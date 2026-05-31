require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const Errand = require('./models/Errand');

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
  // Logic here...
});

// Root Route
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

// Export app and server separately for testing
module.exports = { app, server };

// Only start the server if this file is run directly
if (require.main === module) {
    const connectDB = async () => {
      try {
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB Atlas');
      } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error.message);
        process.exit(1);
      }
    };

    const startServer = async () => {
      await connectDB();
      server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    };

    startServer();
}
