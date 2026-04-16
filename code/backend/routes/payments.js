import express from 'express';
import { getDb } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Membership plan pricing (in INR paise for Stripe, but we store in rupees)
const PLAN_PRICES = {
  basic: 499,
  standard: 999,
  premium: 1999
};

// Create a payment intent / initiate renewal
router.post('/create-intent', authenticate, requireRole('member'), async (req, res) => {
  const { plan, months = 1 } = req.body;

  if (!PLAN_PRICES[plan]) {
    return res.status(400).json({ error: 'Invalid membership plan' });
  }

  const amount = PLAN_PRICES[plan] * months;

  try {
    const db = getDb();

    // Check if Stripe is configured
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here') {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe uses paise
        currency: 'inr',
        metadata: {
          member_id: req.user.id,
          plan,
          months
        }
      });

      // Record pending payment
      await db.query(
        `INSERT INTO payments (member_id, amount, currency, status, membership_plan, months, stripe_payment_intent_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.user.id, amount, 'INR', 'pending', plan, months, paymentIntent.id]
      );
      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        plan,
        months
      });
    }

    // Mock payment flow when Stripe is not configured
    const mockIntentId = `mock_pi_${Date.now()}`;
    await db.query(
      `INSERT INTO payments (member_id, amount, currency, status, membership_plan, months, stripe_payment_intent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.user.id, amount, 'INR', 'pending', plan, months, mockIntentId]
    );

    return res.json({
      clientSecret: `mock_secret_${Date.now()}`,
      paymentIntentId: mockIntentId,
      amount,
      plan,
      months,
      mockMode: true
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm / complete payment (called after successful payment)
router.post('/confirm', authenticate, requireRole('member'), async (req, res) => {
  const { paymentIntentId, plan, months = 1 } = req.body;

  if (!PLAN_PRICES[plan]) {
    return res.status(400).json({ error: 'Invalid membership plan' });
  }

  try {
    const db = getDb();
    let verified = false;

    // Verify with Stripe if configured
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here') {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      verified = intent.status === 'succeeded';
    } else {
      // In mock mode, trust the confirmation
      verified = true;
    }

    if (!verified) {
      return res.status(400).json({ error: 'Payment not verified' });
    }

    // Update payment record to succeeded
    await db.query(
      `UPDATE payments SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP
       WHERE stripe_payment_intent_id = $1 AND member_id = $2`,
      [paymentIntentId, req.user.id]
    );
    // Calculate new expiry date (extend from today or from existing expiry)
    const memberRes = await db.query(
      'SELECT membership_expiry_date FROM members WHERE member_id = $1',
      [req.user.id]
    );
    if (!memberRes.rows[0]) {
      return res.status(404).json({ error: 'Member record not found' });
    }
    const existingExpiry = memberRes.rows[0]?.membership_expiry_date;
    const baseDate = existingExpiry && new Date(existingExpiry) > new Date()
      ? new Date(existingExpiry)
      : new Date();

    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + parseInt(months));

    // Update membership
    await db.query(
      `UPDATE members SET membership_expiry_date = $1, membership_plan = $2
       WHERE member_id = $3`,
      [newExpiry.toISOString().split('T')[0], plan, req.user.id]
    );

    // Send notification to member
    await db.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, $2, $3)`,
      [
        req.user.id,
        'Membership Renewed Successfully!',
        `Your ${plan} membership has been renewed for ${months} month(s). Valid until ${newExpiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
      ]
    );

    res.json({
      success: true,
      newExpiry: newExpiry.toISOString().split('T')[0],
      plan,
      months
    });
  } catch (error) {
    console.error('Payment confirm error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment history for current member
router.get('/history', authenticate, async (req, res) => {
  try {
    const db = getDb();
    let result;

    if (req.user.role === 'admin') {
      result = await db.query(
        `SELECT p.payment_id as id, p.amount, p.currency, p.status, p.membership_plan as plan,
                p.months, p.created_at, u.name as member_name, u.email as member_email
         FROM payments p
         JOIN members m ON p.member_id = m.member_id
         JOIN users u ON m.member_id = u.user_id
         ORDER BY p.created_at DESC`
      );
    } else {
      result = await db.query(
        `SELECT payment_id as id, amount, currency, status, membership_plan as plan, months, created_at
         FROM payments WHERE member_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
      );
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
