import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Helper: check that project exists and (if producer) that user owns it.
 * Returns true if ok, otherwise sends response and returns false.
 */
async function checkProjectAccess(
  req: AuthRequest,
  res: Response,
  projectId: number
): Promise<boolean> {
  const user = req.user!;
  const projectRes = await pool.query('SELECT id, created_by FROM projects WHERE id = $1', [projectId]);
  if (projectRes.rows.length === 0) {
    res.status(404).json({ message: 'Project not found' });
    return false;
  }
  const project = projectRes.rows[0];
  if (user.role === 'producer' && project.created_by !== user.userId) {
    res.status(403).json({ message: 'You are not allowed to operate on this project' });
    return false;
  }
  return true;
}

/**
 * POST /api/projects/:projectId/cast-crew
 * Add a person to a project by email.
 * Body: { email, role, position? }
 */
router.post(
  '/projects/:projectId/cast-crew',
  authenticate,
  authorizeRoles('admin', 'producer'),
  async (req: AuthRequest, res: Response) => {
    try {
      const projectId = Number(req.params.projectId);
      if (!Number.isInteger(projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' });
      }

      // Check project access
      if (!(await checkProjectAccess(req, res, projectId))) return;

      const { email, role_type, position, daily_rate, notes } = req.body;

      if (!email || !role_type) {
        return res.status(400).json({ message: 'Email and role_type are required' });
      }

      // Validate role_type
      const allowedRoleTypes = ['cast', 'crew'];
      if (!allowedRoleTypes.includes(role_type)) {
        return res.status(400).json({ message: `role_type must be one of: ${allowedRoleTypes.join(', ')}` });
      }

      // Validate daily_rate if provided
      if (daily_rate !== undefined) {
        const dr = Number(daily_rate);
        if (Number.isNaN(dr) || dr < 0) {
          return res.status(400).json({ message: 'daily_rate must be a non-negative number' });
        }
      }

      // Look up user by email
      const userRes = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ message: 'User with this email not found. They must register first.' });
      }

      const user = userRes.rows[0];
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot add admin user as cast/crew' });
      }

      const userId = user.id;

      // Check if already added to this project
      const existingRes = await pool.query(
        'SELECT id FROM cast_crew WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (existingRes.rows.length > 0) {
        return res.status(409).json({ message: 'This user is already added to the project' });
      }

      // Insert into cast_crew
      const insert = await pool.query(
        `INSERT INTO cast_crew (project_id, user_id, role_type, position, daily_rate, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, userId, role_type, position || null, daily_rate || null, notes || null]
      );

      res.status(201).json(insert.rows[0]);
    } catch (err) {
      console.error('Error adding cast/crew:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/projects/:projectId/cast-crew
 * List members for a project with user details
 */
router.get(
  '/projects/:projectId/cast-crew',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const projectId = Number(req.params.projectId);
      if (!Number.isInteger(projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' });
      }

      // If producer, ensure ownership
      if (req.user!.role === 'producer') {
        if (!(await checkProjectAccess(req, res, projectId))) return;
      }

      // If crew, ensure they are assigned to this project
      if (req.user!.role === 'crew') {
        const assignment = await pool.query(
          'SELECT 1 FROM cast_crew WHERE project_id = $1 AND user_id = $2',
          [projectId, req.user!.userId]
        );
        if (assignment.rows.length === 0) {
          return res.status(403).json({ message: 'You are not assigned to this project' });
        }
      }

      const result = await pool.query(
        `SELECT 
          cc.id,
          cc.project_id,
          cc.user_id,
          cc.role_type,
          cc.position,
          cc.daily_rate,
          cc.notes,
          cc.created_at,
          u.name,
          u.email
         FROM cast_crew cc
         INNER JOIN users u ON cc.user_id = u.id
         WHERE cc.project_id = $1
         ORDER BY cc.created_at ASC`,
        [projectId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error listing cast/crew:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/projects/:projectId/cast-crew/:id
 * Update a cast/crew member's role or position
 */
router.put(
  '/projects/:projectId/cast-crew/:id',
  authenticate,
  authorizeRoles('admin', 'producer'),
  async (req: AuthRequest, res: Response) => {
    try {
      const projectId = Number(req.params.projectId);
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || !Number.isInteger(projectId)) {
        return res.status(400).json({ message: 'Invalid id or projectId' });
      }

      const existingRes = await pool.query(
        'SELECT * FROM cast_crew WHERE id = $1 AND project_id = $2',
        [id, projectId]
      );
      if (existingRes.rows.length === 0) {
        return res.status(404).json({ message: 'Cast/crew member not found' });
      }

      // If producer, ensure they own the project
      if (req.user!.role === 'producer') {
        const ok = await checkProjectAccess(req, res, projectId);
        if (!ok) return;
      }

      const { role_type, position } = req.body;

      // Validate role_type if provided
      if (role_type) {
        const allowedRoleTypes = ['cast', 'crew'];
        if (!allowedRoleTypes.includes(role_type)) {
          return res.status(400).json({ message: `role_type must be one of: ${allowedRoleTypes.join(', ')}` });
        }
      }

      const updateRes = await pool.query(
        `UPDATE cast_crew SET
           role_type = COALESCE($1, role_type),
           position = COALESCE($2, position)
         WHERE id = $3
         RETURNING *`,
        [role_type, position, id]
      );

      res.json(updateRes.rows[0]);
    } catch (err) {
      console.error('Error updating cast/crew:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/projects/:projectId/cast-crew/:id
 * Remove a cast/crew member from a project
 */
router.delete(
  '/projects/:projectId/cast-crew/:id',
  authenticate,
  authorizeRoles('admin', 'producer'),
  async (req: AuthRequest, res: Response) => {
    try {
      const projectId = Number(req.params.projectId);
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || !Number.isInteger(projectId)) {
        return res.status(400).json({ message: 'Invalid id or projectId' });
      }

      const existingRes = await pool.query(
        'SELECT * FROM cast_crew WHERE id = $1 AND project_id = $2',
        [id, projectId]
      );
      if (existingRes.rows.length === 0) {
        return res.status(404).json({ message: 'Cast/crew member not found' });
      }

      // If producer, ensure they own the project
      if (req.user!.role === 'producer') {
        const ok = await checkProjectAccess(req, res, projectId);
        if (!ok) return;
      }

      await pool.query('DELETE FROM cast_crew WHERE id = $1', [id]);
      res.json({ message: 'Member removed successfully' });
    } catch (err) {
      console.error('Error deleting cast/crew:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
