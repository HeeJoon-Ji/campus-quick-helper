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
  console.log('A user connected:', socket.id);

  socket.on('join_room', (errandId) => {
    socket.join(errandId);
    console.log(`User ${socket.id} joined room: ${errandId}`);
  });

  socket.on('send_message', async (data) => {
    const { errandId, text, senderId } = data;
    
    try {
      const newMessage = new Message({ errandId, senderId, text });
      await newMessage.save();
      
      io.to(errandId).emit('receive_message', {
        text,
        senderId,
        timestamp: newMessage.createdAt
      });
    } catch (err) {
      console.error('Chat error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

// --- View Routes ---

// Root Route (Main Dashboard)
app.get('/', async (req, res) => {
  try {
    const errands = await Errand.find().sort({ createdAt: -1 });
    res.render('index', { errands });
  } catch (error) {
    console.error('Error fetching errands:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Auth Pages
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));

// Search Page
app.get('/search', (req, res) => res.render('search'));

// My Page
app.get('/mypage', (req, res) => res.render('mypage'));

// Errand Detail Page
app.get('/errands/:id', (req, res) => {
  res.render('detail', { errandId: req.params.id });
});

// Chat Page
app.get('/chat/:id', (req, res) => {
  res.render('chat', { errandId: req.params.id });
});

startServer();
