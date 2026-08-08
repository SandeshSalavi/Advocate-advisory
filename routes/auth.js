import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'email, password, name and role are required' });
  }

  const conn = await pool.getConnection();
  try {
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [id, email, passwordHash, role]
    );

    const table = role === 'advocate' ? 'advocate_profiles' : 'client_profiles';
    await conn.query(
      `INSERT INTO ${table} (id, email, full_name, role) VALUES (?, ?, ?, ?)`,
      [id, email, name, role]
    );
    await conn.commit();

    const user = { id, email, role };
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    await conn.rollback();
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  } finally {
    conn.release();
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const dbUser = rows[0];
    const valid = await bcrypt.compare(password, dbUser.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = { id: dbUser.id, email: dbUser.email, role: dbUser.role };
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// POST /api/auth/signout — stateless JWT, client just discards the token
router.post('/signout', (req, res) => {
  res.json({ success: true });
});

// GET /api/auth/session — validates the bearer token and returns the user
router.get('/session', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: { id: decoded.id, email: decoded.email, role: decoded.role }, token });
  } catch (err) {
    res.json({ user: null });
  }
});

// POST /api/auth/reset-password — stub; wire up an email provider to send a real reset link
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }
  // In production: generate a reset token, store it, and email a reset link.
  console.log(`Password reset requested for ${email} (no email provider configured)`);
  res.json({ success: true });
});

export default router;
