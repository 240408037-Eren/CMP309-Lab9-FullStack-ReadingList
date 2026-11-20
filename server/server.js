import express from 'express';
import cors from 'cors';

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} (allowing origin: ${CLIENT_ORIGIN})`);
});
