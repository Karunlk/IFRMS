import express from 'express';
import { getDb } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let query = '';
    let params = [];
    if (req.user.role === 'member') {
      query = 'SELECT fp.progress_id as id, wp.member_id, wp.trainer_id, fp.weight, fp.reps, fp.workout_time, fp.progress_date as recorded_at FROM fitness_progress fp JOIN workout_plans wp ON fp.workout_plan_id = wp.workout_plan_id WHERE wp.member_id = $1 ORDER BY fp.progress_date DESC';
      params = [req.user.id];
    } else if (req.user.role === 'trainer') {
      query = 'SELECT fp.progress_id as id, wp.member_id, wp.trainer_id, fp.weight, fp.reps, fp.workout_time, fp.progress_date as recorded_at FROM fitness_progress fp JOIN workout_plans wp ON fp.workout_plan_id = wp.workout_plan_id WHERE wp.trainer_id = $1 ORDER BY fp.progress_date DESC';
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
  const { member_id, weight, reps, workout_time } = req.body;
  try {
    const planRes = await getDb().query('SELECT workout_plan_id FROM workout_plans WHERE member_id = $1 AND trainer_id = $2 LIMIT 1', [member_id, req.user.id]);
    if (planRes.rows.length === 0) {
      return res.status(400).json({ error: 'Member does not have a workout plan with this trainer' });
    }
    const planId = planRes.rows[0].workout_plan_id;
    
    const result = await getDb().query(
      'INSERT INTO fitness_progress (workout_plan_id, weight, reps, workout_time, progress_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING progress_id as id, weight, reps, workout_time, progress_date as recorded_at',
      [planId, weight, parseInt(reps) || 0, parseInt(workout_time) || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
