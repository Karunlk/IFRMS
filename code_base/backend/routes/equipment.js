import express from 'express';
import { getDb } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await getDb().query('SELECT * FROM equipment ORDER BY equipment_id ASC');
    res.json(result.rows.map(row => ({
      id: row.equipment_id,
      name: row.equipment_name,
      status: row.equipment_status,
      managed_by: row.managed_by
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  const { name, status } = req.body;
  try {
    const result = await getDb().query(
      'INSERT INTO equipment (equipment_name, equipment_status, managed_by) VALUES ($1, $2, $3) RETURNING *',
      [name, status || 'Available', req.user.id]
    );
    const row = result.rows[0];
    res.status(201).json({ id: row.equipment_id, name: row.equipment_name, status: row.equipment_status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  const { status } = req.body;
  try {
    await getDb().query('UPDATE equipment SET equipment_status = $1 WHERE equipment_id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await getDb().query('DELETE FROM equipment WHERE equipment_id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
