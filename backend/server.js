require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const connectDB = require('./config/db');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const authRoutes     = require('./routes/authRoutes');
const profileRoutes  = require('./routes/profileRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Full Stack Assessment API is running' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/documents', documentRoutes);

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 0, message: 'File too large. Maximum size is 5MB.' });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: 0, message: err.message });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 0, message: 'Something went wrong!' });
});

const startServer = async () => {
  const port = process.env.PORT || 5000;

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });

  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

startServer();
