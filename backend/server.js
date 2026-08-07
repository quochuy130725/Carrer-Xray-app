const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const { scanJD } = require('./controllers/scanController');

const app = express();
app.use(cors());
app.use(express.json());


// Kết nối MongoDB Local
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('🍃 Connected to Local MongoDB successfully!'))
    .catch((err) => console.warn('⚠️ MongoDB connection error, system will use jobs.json Fallback:', err.message));
// Routes
app.get('/api/health', (req, res) => res.json({ status: 'CAREER X-RAY Server Ready' }));
app.post('/api/scan/jd', scanJD);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CAREER X-RAY Server running on port ${PORT}`));
