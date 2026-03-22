const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/guiders', require('./routes/guiders'));
app.use('/notifications', require('./routes/notifications'));
app.use('/resources', require('./routes/resources'));
app.use('/tutors', require('./routes/tutors'));
app.use('/messages', require('./routes/messages'));
app.use('/admin', require('./routes/admin'));
app.use('/profile', require('./routes/profile'));

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

// Socket.io integration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined room`);
  });

  socket.on('send_message', (data) => {
    // data: { sender_id, receiver_id, content }
    io.to(data.receiver_id.toString()).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const initializeDatabase = require('./init_db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Run DB initialization and migrations before starting server
    await initializeDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 EduSaathi Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();

module.exports = app;
