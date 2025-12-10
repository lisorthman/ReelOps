import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import pool from '../db';

const router = Router();

// Types for JWT
type JwtPayload = {
  userId: number;
  role: string;
};

// Strongly-typed JWT configuration
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

/**
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    const userRole = role || 'producer';

    // Check if email exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertResult = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, userRole]
    );

    const user = insertResult.rows[0];

    // JWT options typed separately so TS is happy
    const signOptions: jwt.SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
    };

    const token = jwt.sign(
      { userId: user.id, role: user.role } as JwtPayload,
      JWT_SECRET,
      signOptions
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const signOptions: jwt.SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
    };

    const token = jwt.sign(
      { userId: user.id, role: user.role } as JwtPayload,
      JWT_SECRET,
      signOptions
    );

    // Remove password_hash before sending back
    delete (user as any).password_hash;

    res.json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
