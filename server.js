import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import advocateRoutes from './routes/advocates.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/advocates', advocateRoutes);

app.listen(PORT, () => {
  console.log(`Justly Connect API listening on http://localhost:${PORT}`);
});
