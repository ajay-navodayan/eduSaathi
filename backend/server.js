const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/guiders', require('./routes/guiders'));
app.use('/notifications', require('./routes/notifications'));
app.use('/resources', require('./routes/resources'));
app.use('/tutors', require('./routes/tutors'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🎓 EduSaathi API is running!', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EduSaathi Server running on port ${PORT}`);
});

module.exports = app;
