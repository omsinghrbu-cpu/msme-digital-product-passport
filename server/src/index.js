import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import auth from './routes/auth.js';
import products from './routes/products.js';
import verify from './routes/verify.js';
import admin from './routes/admin.js';
import agent from './routes/agent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'd84873316083fb100c9b9446510bdd4699e37a75e18fc66cc099a38eec92ffb603953106376a2226e6e7ff2527f566ad';
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/verify', verify);
app.use('/api/admin', admin);
app.use('/api/agent', agent);

app.use((err, req, res, next) => {
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((x) => ({ field: x.path.join('.'), message: x.message })),
    });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that value already exists' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
