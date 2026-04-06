import express from 'express';
import { getDb } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const result = await getDb().query('SELECT report_id as id, report_type as type, generated_at as date, report_type || \' Report\' as title FROM reports ORDER BY generated_at DESC');
    res.json(result.rows.map(r => ({
      ...r,
      date: new Date(r.date).toISOString().split('T')[0]
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { type } = req.body;
  try {
    const result = await getDb().query(
      'INSERT INTO reports (report_type, generated_by) VALUES ($1, $2) RETURNING report_id, generated_at',
      [type, req.user.id]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.report_id,
      title: `${type} Report`,
      date: new Date(row.generated_at).toISOString().split('T')[0],
      type
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
