import express from 'express';
import { getDb } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await getDb().query(
      `SELECT notification_id as id, title, message, is_read, created_at
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification(s) as read
router.put('/read', authenticate, async (req, res) => {
  const { notification_id } = req.body; // if omitted, mark all as read
  try {
    if (notification_id) {
      await getDb().query(
        `UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 AND user_id = $2`,
        [notification_id, req.user.id]
      );
    } else {
      await getDb().query(
        `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
        [req.user.id]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
