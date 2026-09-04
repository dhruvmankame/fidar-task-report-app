require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// --- Global middleware ---
app.use(cors());               // allow the mobile app to call the API
app.use(express.json({ limit: '15mb' })); // parse JSON bodies (large so base64 image attachments fit)
app.use(morgan('dev'));        // request logging

// --- Health checks ---
app.get('/', (req, res) => res.json({ ok: true, service: 'Task & Work Report API' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// --- Feature routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/reports', require('./routes/reports'));

// --- Fallbacks ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_report';

connectDB(MONGO_URI)
  .then(() => {
    // 0.0.0.0 so a phone on the same Wi-Fi (and Expo Go) can reach it.
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 API running on http://0.0.0.0:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
