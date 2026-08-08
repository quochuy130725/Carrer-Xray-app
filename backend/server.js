const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const scanRoutes = require('./routes/scanRoutes');
const { getCases, analyzeCustomJD } = require('./controllers/scanController');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Kết nối Database (MongoDB)
connectDB();

// Global CORS Middleware (Tự động xử lý Preflight OPTIONS & All Origins)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payload Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'CAREER X-RAY Server Ready' }));
app.get('/api/cases', getCases);
app.post('/api/analyze', analyzeCustomJD);
app.use('/api/scan', scanRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 CAREER X-RAY Server running on port ${PORT}`));
