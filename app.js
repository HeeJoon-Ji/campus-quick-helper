require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const Errand = require('./models/Errand');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// View Engine Setup
app.set('view engine', 'ejs');
app.use(express.static('public'));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/errands', require('./routes/errands'));

// Socket.io Logic
io.on('connection', (socket) => {
  socket.on('join_room', (errandId) => socket.join(errandId));
  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({ errandId: data.errandId, senderId: data.senderId, text: data.text });
      await newMessage.save();
      io.to(data.errandId).emit('receive_message', { text: data.text, senderId: data.senderId, timestamp: newMessage.createdAt });
    } catch (err) { console.error(err); }
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB Error:', error.message);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// View Routes
app.get('/', async (req, res) => {
  const errands = await Errand.find().sort({ createdAt: -1 });
  res.render('index', { errands });
});
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/search', (req, res) => res.render('search'));
app.get('/mypage', (req, res) => res.render('mypage'));
app.get('/errands/:id', (req, res) => res.render('detail', { errandId: req.params.id }));
app.get('/chat/:id', (req, res) => res.render('chat', { errandId: req.params.id }));

// Export for Render or other environments
module.exports = { app, server };

if (require.main === module) {
  startServer();
}
