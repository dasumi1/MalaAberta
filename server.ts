import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import handler from './api/gerar-lista.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/gerar-lista', async (req, res) => {
  await handler(req, res);
});

// Serve static files
app.use(express.static(path.resolve('.', 'dist')));
app.use(express.static(path.resolve('.')));

app.get('*', (_req, res) => {
  res.sendFile(path.resolve('.', 'index.html'));
});

app.listen(port, () => {
  console.log(`Montador de mala server running on port ${port}`);
});
