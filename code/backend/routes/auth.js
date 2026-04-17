import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { JWT_SECRET } from '../config.js';
import { verifyFirebaseToken } from '../firebase.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone, dob } = req.body;
  const role = 'member'; // Enforce member role for public registration
  try {
    const db = getDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const userRes = await client.query(
        'INSERT INTO users (user_type, name, email, password, phone_number, dob) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, user_type, name, email, phone_number, dob',
        [role, name, email, hashedPassword, phone, dob]
      );
      const user = userRes.rows[0];
      
      if (role === 'member') {
        await client.query('INSERT INTO members (member_id, membership_date) VALUES ($1, CURRENT_DATE)', [user.user_id]);
      } else if (role === 'trainer') {
        await client.query('INSERT INTO trainers (trainer_id, specialization) VALUES ($1, $2)', [user.user_id, specialization || 'General']);
      }
      
      await client.query('COMMIT');
      
      const token = jwt.sign({ id: user.user_id, role: user.user_type }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user: { id: user.user_id, name: user.name, email: user.email, role: user.user_type, phone: user.phone_number, dob: user.dob } });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = getDb();
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid Credentials' });
    const result1 = await db.query('SELECT membership_date from members where member_id = $1', [user.user_id]);
    const member = result1.rows[0];
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid Credentials' });
    
    const token = jwt.sign({ id: user.user_id, role: user.user_type }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.user_id, name: user.name, email: user.email, role: user.user_type, phone: user.phone_number, dob: user.dob, membership_date: member ? member.membership_date : null } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/firebase
 * Exchange a Firebase ID token for an app JWT.
 *
 * Body: { idToken: string, phone?: string, dob?: string }
 *
 * Flow:
 *   1. Verify the Firebase ID token with Firebase Admin SDK.
 *   2. Find or create the user in the DB (upsert by email).
 *   3. Return our own app JWT + user payload.
 */
router.post('/firebase', async (req, res) => {
  const { idToken, phone, dob } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken is required' });

  try {
    // 1. Verify Firebase token
    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Firebase token: ' + err.message });
    }

    const firebaseUid = decoded.uid;
    const email = decoded.email || '';
    const displayName = decoded.name || decoded.email?.split('@')[0] || 'User';
    const picture = decoded.picture || null;

    const db = getDb();

    // 2. Find existing user by firebase_uid or email
    let userRow = null;
    const byUid = await db.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
    if (byUid.rows.length > 0) {
      userRow = byUid.rows[0];
    } else if (email) {
      const byEmail = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (byEmail.rows.length > 0) {
        userRow = byEmail.rows[0];
        // Link firebase_uid to existing account
        await db.query('UPDATE users SET firebase_uid = $1, avatar_url = COALESCE(avatar_url, $2) WHERE user_id = $3', [firebaseUid, picture, userRow.user_id]);
        userRow.firebase_uid = firebaseUid;
      }
    }

    // 3. If user doesn't exist, create a new member account
    if (!userRow) {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const insertRes = await client.query(
          `INSERT INTO users (user_type, name, email, phone_number, dob, firebase_uid, avatar_url)
           VALUES ('member', $1, $2, $3, $4, $5, $6)
           RETURNING user_id, user_type, name, email, phone_number, dob, avatar_url`,
          [displayName, email, phone || null, dob || null, firebaseUid, picture]
        );
        userRow = insertRes.rows[0];
        await client.query(
          'INSERT INTO members (member_id, membership_date) VALUES ($1, CURRENT_DATE)',
          [userRow.user_id]
        );
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    // 4. Fetch member details if applicable
    let member = null;
    if (userRow.user_type === 'member') {
      const memRes = await db.query(
        'SELECT membership_date, membership_expiry_date, membership_plan FROM members WHERE member_id = $1',
        [userRow.user_id]
      );
      member = memRes.rows[0] || null;
    }

    // 5. Issue app JWT
    const token = jwt.sign({ id: userRow.user_id, role: userRow.user_type }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: userRow.user_id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.user_type,
        phone: userRow.phone_number,
        dob: userRow.dob,
        avatar_url: userRow.avatar_url || picture,
        ...(member && {
          membership_date: member.membership_date,
          membership_expiry_date: member.membership_expiry_date,
          membership_plan: member.membership_plan,
        }),
      },
    });
  } catch (error) {
    console.error('[Firebase Auth]', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
