import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { name, email, password, phone, dob, role, specialization } = req.body;
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
      
      res.status(201).json({ id: user.user_id, name: user.name, email: user.email, role: user.user_type, phone: user.phone_number, dob: user.dob });
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

router.get('/', authenticate, async (req, res) => {
  try {
    let query = 'SELECT user_id as id, name, email, user_type as role FROM users';
    if (req.user.role === 'member') {
      query += " WHERE user_type = 'trainer'";
    }
    const result = await getDb().query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  const { name, email, phone, dob } = req.body;
  try {
    const result = await getDb().query(
      'UPDATE users SET name = $1, email = $2, phone_number = $3, dob = $4 WHERE user_id = $5 RETURNING user_id as id, name, email, user_type as role, phone_number as phone, dob',
      [name, email, phone, dob, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await getDb().query('DELETE FROM users WHERE user_id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
