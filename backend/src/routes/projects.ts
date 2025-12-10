import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// Allowed project statuses
const ALLOWED_STATUSES = [
  'planning',
  'pre-production',
  'shooting',
  'post-production',
  'completed',
] as const;

type ProjectStatus = (typeof ALLOWED_STATUSES)[number];

// Simple validation helper
function isValidStatus(status: any): status is ProjectStatus {
  return ALLOWED_STATUSES.includes(status);
}

/**
 * GET /api/projects
 * - List all projects
 * - Any authenticated user can view
 */
router.get(
  '/',
  authenticate,
  async (_req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT
          p.id,
          p.title,
          p.description,
          p.status,
          p.start_date,
          p.end_date,
          p.budget_total,
          p.created_at,
          u.name AS created_by_name,
          u.id AS created_by_id
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        ORDER BY p.created_at DESC`
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching projects:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/projects/:id
 * - Get single project by ID
 * - Any authenticated user can view
 */
router.get(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT
          p.id,
          p.title,
          p.description,
          p.status,
          p.start_date,
          p.end_date,
          p.budget_total,
          p.created_at,
          u.name AS created_by_name,
          u.id AS created_by_id
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching project:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * POST /api/projects
 * - Create project
 * - Only admin/producer
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'producer'),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        title,
        description,
        status,
        start_date,
        end_date,
        budget_total,
      } = req.body;

      if (!title || !status) {
        return res
          .status(400)
          .json({ message: 'Title and status are required' });
      }

      if (!isValidStatus(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
        });
      }

      const createdBy = req.user!.userId;

      const result = await pool.query(
        `INSERT INTO projects
          (title, description, status, start_date, end_date, budget_total, created_by)
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

/**
 * PUT /api/projects/:id
 * - Update project
 * - Only admin/producer
 * (You could later restrict producers to only their own projects)
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'producer'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        status,
        start_date,
        end_date,
        budget_total,
      } = req.body;

      // Optional validation
      if (status && !isValidStatus(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`,
        });
      }

      // Check if project exists
      const existing = await pool.query('SELECT id FROM projects WHERE id = $1', [
        id,
      ]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const result = await pool.query(
        `UPDATE projects
         SET
           title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           budget_total = COALESCE($6, budget_total)
         WHERE id = $7
         RETURNING *`,
        [title, description, status, start_date, end_date, budget_total, id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating project:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/projects/:id
 * - Delete project
 * - Here we allow only admin (common business rule)
 *   If you want producers to delete too, add 'producer' in authorizeRoles
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const existing = await pool.query('SELECT id FROM projects WHERE id = $1', [
        id,
      ]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      await pool.query('DELETE FROM projects WHERE id = $1', [id]);

      res.json({ message: 'Project deleted successfully' });
    } catch (err) {
      console.error('Error deleting project:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
