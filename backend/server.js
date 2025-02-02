const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const activityRoutes = require('./routes/activities');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://aicgs.netlify.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: true, // Changed to true for production
    sameSite: 'none', // Changed to none for cross-site requests
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const voteRoutes = require('./routes/votes');

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/activities', activityRoutes);

// Handle favicon.ico request
app.get('/favicon.ico', (req, res) => res.status(204));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});