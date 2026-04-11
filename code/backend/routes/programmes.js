import express from 'express';
import { getDb } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await getDb().query('SELECT program_id as id, program_name as name, capacity FROM fitness_programs');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, capacity } = req.body;
  try {
    const result = await getDb().query(
      'INSERT INTO fitness_programs (program_name, capacity) VALUES ($1, $2) RETURNING program_id as id, program_name as name, capacity',
      [name, parseInt(capacity) || 20]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/enrolled', authenticate, async (req, res) => {
  try {
    const result = await getDb().query(
      'SELECT p.program_id as id, p.program_name as name, p.capacity FROM fitness_programs p JOIN enrollments e ON p.program_id = e.program_id WHERE e.member_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/enrol', authenticate, async (req, res) => {
  const { programme_id } = req.body;
  try {
    await getDb().query(
      'INSERT INTO enrollments (member_id, program_id) VALUES ($1, $2)',
      [req.user.id, programme_id]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
