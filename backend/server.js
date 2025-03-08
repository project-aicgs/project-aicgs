const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const activityRoutes = require('./routes/activities');
require('dotenv').config();

// Create Express app
const app = express();

// Define allowed origins
const allowedOrigins = [
  'https://aicgs.netlify.app',
  'https://project-aicgs.onrender.com',
  'http://localhost:5173'
];

// Trust proxy - required for secure cookies in production
app.set('trust proxy', 1);

// CORS Configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: 'none', // Important for cross-site requests
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    domain: undefined, // Let the browser set the domain based on the request
    path: '/', // Ensure cookie is available for all paths
    httpOnly: true // Safer to prevent JavaScript access
  },
  proxy: true // Important for Render/Netlify
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection with enhanced error logging
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database Name:', mongoose.connection.name);
    console.log('Connected to Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    console.error('Connection String:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@')); // Hide password
  });

// Monitor MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

// Routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const voteRoutes = require('./routes/votes');

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/activities', activityRoutes);

// Handle favicon.ico request
app.get('/favicon.ico', (req, res) => res.status(204));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Log detailed error information
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });

  // Send appropriate error response
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Allowed Origins:', allowedOrigins);
});