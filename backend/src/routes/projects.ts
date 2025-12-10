import { Router } from 'express';
import pool from '../db';
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/projects (any logged-in user)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, status, start_date, end_date FROM projects'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/projects (only admin or producer)
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'producer'),
  async (req: AuthRequest, res) => {
    try {
      const { title, description, status, start_date, end_date, budget_total } =
        req.body;

      if (!title || !status) {
        return res
          .status(400)
          .json({ message: 'Title and status are required' });
      }

      const createdBy = req.user!.userId;

      const result = await pool.query(
        `INSERT INTO projects (title, description, status, start_date, end_date, budget_total, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [title, description, status, start_date, end_date, budget_total, createdBy]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating project:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
