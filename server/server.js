import express from 'express';
import cors from 'cors';
import {
  getBooks,
  getBookById,
  hasDuplicate,
  createBook,
  replaceBook,
  deleteBook,
  getStats
} from './booksStore.js';
import {
  parsePositiveInt,
  validateBookBody,
  mergeAndValidatePatch,
  validateQuery
} from './validate.js';

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

// GET /api/stats - compute reading list statistics dynamically
app.get('/api/stats', async (req, res) => {
  const stats = await getStats();
  return res.json(stats);
});

// GET /api/crash - deliberate async error to verify 500 error middleware
app.get('/api/crash', async (req, res) => {
  throw new Error('Simulated unexpected async failure');
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

// GET /api/books/:id - fetch a single book by positive integer id
app.get('/api/books/:id', async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Book id must be a positive integer' });
  }
  const book = await getBookById(id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.json(book);
});

// POST /api/books - create a new book from a complete body
app.post('/api/books', async (req, res) => {
  const { error, data } = validateBookBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  if (await hasDuplicate(data.title, data.author)) {
    return res.status(409).json({ error: 'A book with this title and author already exists' });
  }
  const created = await createBook(data);
  return res.status(201).location(`/api/books/${created.id}`).json(created);
});

// PUT /api/books/:id - replace an existing book with a complete body
app.put('/api/books/:id', async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Book id must be a positive integer' });
  }
  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Book not found' });
  }
  const { error, data } = validateBookBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  if (await hasDuplicate(data.title, data.author, id)) {
    return res.status(409).json({ error: 'A book with this title and author already exists' });
  }
  const updated = await replaceBook(id, data);
  return res.json(updated);
});

// PATCH /api/books/:id - partially update an existing book
app.patch('/api/books/:id', async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Book id must be a positive integer' });
  }
  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Book not found' });
  }
  const { error, data } = mergeAndValidatePatch(existing, req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  if (await hasDuplicate(data.title, data.author, id)) {
    return res.status(409).json({ error: 'A book with this title and author already exists' });
  }
  const updated = await replaceBook(id, data);
  return res.json(updated);
});

// DELETE /api/books/:id - remove a book
app.delete('/api/books/:id', async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'Book id must be a positive integer' });
  }
  const deleted = await deleteBook(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.status(204).send();
});

// Express 5 compliant 404 fallback for unmatched /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error-handling middleware (handles malformed JSON 400 and unexpected 500)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  console.error('Unhandled server error:', err);
  return res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} (allowing origin: ${CLIENT_ORIGIN})`);
});
