import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import authRoutes from './routes/auth';
import projectsRoutes from './routes/projects';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as now');
    res.json({
      status: 'ok',
      message: 'ReelOps backend running',
      dbTime: dbRes.rows[0].now,
    });
  } catch (error) {
    console.error('DB health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Backend running but cannot connect to database',
    });
  }
});

// Mount auth routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
