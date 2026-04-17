import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { getDb, initDb } from './db.js';

// Set dummy values if not provided so the app can run
process.env.DATABASE_URL = process.env.DATABASE_URL || 'dummy';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dummy_secret_key_for_development';

import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import scheduleRoutes from './routes/schedule.js';
import reportsRoutes from './routes/reports.js';
import usersRoutes from './routes/users.js';
import programmesRoutes from './routes/programmes.js';
import workoutsRoutes from './routes/workouts.js';
import progressRoutes from './routes/progress.js';
import paymentsRoutes from './routes/payments.js';
import notificationsRoutes from './routes/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Stricter limit for payment routes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Strict limit for auth
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' }
});

async function startServer() {
  await initDb();
  
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/equipment', generalLimiter, equipmentRoutes);
  app.use('/api/schedule', generalLimiter, scheduleRoutes);
  app.use('/api/reports', generalLimiter, reportsRoutes);
  app.use('/api/users', generalLimiter, usersRoutes);
  app.use('/api/programmes', generalLimiter, programmesRoutes);
  app.use('/api/workouts', generalLimiter, workoutsRoutes);
  app.use('/api/progress', generalLimiter, progressRoutes);
  app.use('/api/payments', paymentLimiter, paymentsRoutes);
  app.use('/api/notifications', generalLimiter, notificationsRoutes);

  // Vite Middleware for Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '../frontend'),
      configFile: path.resolve(__dirname, '../frontend/vite.config.js')
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================`);
    console.log(`🚀 API is running on port ${PORT}`);
    console.log(`🔌 Database connection initialized`);
    console.log(`=================================`);
  });
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  const db = getDb();
  if (db.end) await db.end();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  const db = getDb();
  if (db.end) await db.end();
  process.exit(0);
});
