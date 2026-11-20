import express from 'express';
import cors from 'cors';
import { getBooks } from './booksStore.js';
import { validateQuery } from './validate.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Restrict CORS strictly to the configured client origin
app.use(cors({ origin: CLIENT_ORIGIN }));

// Parse incoming JSON payloads
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/books - list books with filtering, sorting, and pagination
app.get('/api/books', async (req, res) => {
  const { error, options } = validateQuery(req.query);
  if (error) {
    return res.status(400).json({ error });
  }
  const list = await getBooks(options);
  return res.json(list);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} (allowing origin: ${CLIENT_ORIGIN})`);
});
