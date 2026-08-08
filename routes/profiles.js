import express from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

const tableFor = (role) => (role === 'advocate' ? 'advocate_profiles' : 'client_profiles');

// GET /api/profiles/:role/:id
router.get('/:role/:id', requireAuth, async (req, res) => {
  const { role, id } = req.params;
  const table = tableFor(role);

  try {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /api/profiles/:role/:id
router.patch('/:role/:id', requireAuth, async (req, res) => {
  const { role, id } = req.params;
  const table = tableFor(role);
  const updates = req.body || {};

  const allowedFields = [
    'full_name',
    'profile_picture',
    'phone_number',
    'address',
    'bio',
    ...(role === 'advocate' ? ['specialization', 'years_of_experience', 'availability_status'] : []),
  ];

  const fields = Object.keys(updates).filter((key) => allowedFields.includes(key));
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => updates[f]);

  try {
    await pool.query(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...values, id]);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
