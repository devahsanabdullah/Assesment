import express from 'express';
import cors from 'cors';
import authRoutes from './auth';
import treeRoutes from './trees';
import { pool } from './db';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trees', treeRoutes);

const PORT = process.env.PORT || 8000;

async function start() {
  try {
    await pool.query('SELECT 1'); // simple check
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (e) {
    console.error('Failed to connect to database', e);
    process.exit(1);
  }
}

start();
