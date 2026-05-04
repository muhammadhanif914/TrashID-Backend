const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serving static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/scan', require('./routes/wasteRoutes'));
app.use('/api/classify', require('./routes/classificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tps', require('./routes/tpsRoutes'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is working properly' });
});

module.exports = app;