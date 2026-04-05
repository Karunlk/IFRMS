import express from 'express';
import { getDb } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT s.schedule_id as id, s.session_date as date, 'Training Session' as type, t.name as trainer, m.name as member
      FROM schedules s
      JOIN users t ON s.trainer_id = t.user_id
      JOIN users m ON s.member_id = m.user_id
    `;
    const params = [];
    
    if (req.user.role === 'member') {
      query += ' WHERE s.member_id = $1';
      params.push(req.user.id);
    } else if (req.user.role === 'trainer') {
      query += ' WHERE s.trainer_id = $1';
      params.push(req.user.id);
    }
    
    const result = await getDb().query(query, params);
    res.json(result.rows.map(r => {
      const d = new Date(r.date);
      // Ensure we don't get NaN if date is invalid
      if (isNaN(d.getTime())) return r;
      return {
        ...r,
        date: d.toISOString().split('T')[0],
        time: d.toISOString().split('T')[1].substring(0, 5)
      };
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { date, time, type, member_id, trainer_id } = req.body;
  try {
    // Combine date and time into timestamp, forcing UTC to avoid server timezone shifts
    const sessionDate = new Date(`${date}T${time}Z`).toISOString();
    
    const tId = req.user.role === 'trainer' ? req.user.id : trainer_id;
    const mId = req.user.role === 'member' ? req.user.id : member_id;

    // Fallback logic if IDs are not provided (for simplicity in the UI)
    // In a real app, the UI should send IDs.
    let finalTId = tId;
    let finalMId = mId;

    if (!finalTId) {
      const tRes = await getDb().query("SELECT user_id FROM users WHERE user_type = 'trainer' LIMIT 1");
      if (tRes.rows.length > 0) finalTId = tRes.rows[0].user_id;
    }
    if (!finalMId) {
      const mRes = await getDb().query("SELECT user_id FROM users WHERE user_type = 'member' LIMIT 1");
      if (mRes.rows.length > 0) finalMId = mRes.rows[0].user_id;
    }

    const result = await getDb().query(
      'INSERT INTO schedules (session_date, trainer_id, member_id) VALUES ($1, $2, $3) RETURNING schedule_id',
      [sessionDate, finalTId, finalMId]
    );
    
    // Fetch the full record to return
    const fullRes = await getDb().query(`
      SELECT s.schedule_id as id, s.session_date as date, 'Training Session' as type, t.name as trainer, m.name as member
      FROM schedules s
      JOIN users t ON s.trainer_id = t.user_id
      JOIN users m ON s.member_id = m.user_id
      WHERE s.schedule_id = $1
    `, [result.rows[0].schedule_id]);

    const r = fullRes.rows[0];
    const d = new Date(r.date);
    res.status(201).json({
      ...r,
      date: d.toISOString().split('T')[0],
      time: d.toISOString().split('T')[1].substring(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;
  
  try {
    const sessionDate = new Date(`${date}T${time}Z`).toISOString();
    
    // Verify ownership or admin
    const checkRes = await getDb().query('SELECT * FROM schedules WHERE schedule_id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    const schedule = checkRes.rows[0];
    if (req.user.role !== 'admin' && req.user.id !== schedule.trainer_id && req.user.id !== schedule.member_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await getDb().query(
      'UPDATE schedules SET session_date = $1 WHERE schedule_id = $2',
      [sessionDate, id]
    );

    const fullRes = await getDb().query(`
      SELECT s.schedule_id as id, s.session_date as date, 'Training Session' as type, t.name as trainer, m.name as member
      FROM schedules s
      JOIN users t ON s.trainer_id = t.user_id
      JOIN users m ON s.member_id = m.user_id
      WHERE s.schedule_id = $1
    `, [id]);

    const r = fullRes.rows[0];
    const d = new Date(r.date);
    res.json({
      ...r,
      date: d.toISOString().split('T')[0],
      time: d.toISOString().split('T')[1].substring(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
