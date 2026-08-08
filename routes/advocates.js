import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// GET /api/advocates — public listing, matches the old anon-key Supabase select('*')
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM advocate_profiles');
    res.json({ advocates: rows });
  } catch (err) {
    console.error('Fetch advocates error:', err);
    res.status(500).json({ error: 'Failed to fetch advocates' });
  }
});

export default router;
