import express from 'express';
import { getDb } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let query = '';
    let params = [];
    if (req.user.role === 'member') {
      query = 'SELECT workout_plan_id as id, trainer_id, member_id, workout_description, created_at FROM workout_plans WHERE member_id = $1 ORDER BY created_at DESC';
      params = [req.user.id];
    } else if (req.user.role === 'trainer') {
      query = 'SELECT workout_plan_id as id, trainer_id, member_id, workout_description, created_at FROM workout_plans WHERE trainer_id = $1 ORDER BY created_at DESC';
      params = [req.user.id];
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await getDb().query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ error: 'Forbidden' });
  const { member_id, workout_description } = req.body;
  try {
    const result = await getDb().query(
      'INSERT INTO workout_plans (trainer_id, member_id, workout_description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING workout_plan_id as id, trainer_id, member_id, workout_description, created_at',
      [req.user.id, member_id, workout_description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
