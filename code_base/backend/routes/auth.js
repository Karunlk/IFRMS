import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { JWT_SECRET } from '../config.js';

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
    const result1 = await db.query('SELECT membership_date from members where member_id = $1', [user.user_id]);
    const member = result1.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid Credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid Credentials' });
    
    const token = jwt.sign({ id: user.user_id, role: user.user_type }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.user_id, name: user.name, email: user.email, role: user.user_type, phone: user.phone_number, dob: user.dob, membership_date: member ? member.membership_date : null } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
