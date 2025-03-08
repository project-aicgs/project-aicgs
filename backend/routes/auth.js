const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const router = express.Router();

// Passport setup
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Discord Strategy
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Discord auth callback received for user:', profile.username);
      let user = await User.findOne({ discordId: profile.id });
      
      if (!user) {
        console.log('Creating new user for Discord ID:', profile.id);
        user = await User.create({
          discordId: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar
        });
      } else {
        console.log('Updating existing user:', user.username);
        // Update user information in case it changed on Discord
        user.username = profile.username;
        user.email = profile.email;
        user.avatar = profile.avatar;
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      console.error('Error in Discord strategy:', err);
      return done(err, null);
    }
  }
));

// Generate authentication token
const generateToken = async (userId) => {
  // Generate a random token
  const randomToken = crypto.randomBytes(32).toString('hex');
  
  // Save the token in the database
  const tokenDoc = new Token({
    userId,
    token: randomToken
  });
  
  await tokenDoc.save();
  
  // Create a JWT that contains the token reference
  const token = jwt.sign(
    { userId, tokenId: tokenDoc._id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  return token;
};

// Save the return URL when initiating Discord auth
router.get('/discord', (req, res, next) => {
  // Get the redirectUrl from query parameters
  const redirectUrl = req.query.redirect || 'https://aicgs.netlify.app';
  
  // Store the redirect URL in the session
  req.session.returnTo = redirectUrl;
  console.log("Setting returnTo URL in session:", redirectUrl);
  
  // Force session save before redirecting
  req.session.save((err) => {
    if (err) {
      console.error("Error saving session before auth:", err);
      return res.status(500).send("Error preparing authentication. Please try again.");
    }
    
    console.log("Session saved successfully, proceeding to Discord auth");
    passport.authenticate('discord')(req, res, next);
  });
});

// After successful authentication, redirect with token
router.get('/discord/callback', 
  passport.authenticate('discord', {
    failureRedirect: 'https://aicgs.netlify.app?authError=true'
  }),
  async (req, res) => {
    try {
      console.log("Discord auth callback successful for user:", req.user.username);
      
      // Generate token for the authenticated user
      const token = await generateToken(req.user.id);
      
      // Get the return URL from session
      const returnTo = req.session.returnTo || 'https://aicgs.netlify.app';
      console.log("Redirecting to:", returnTo);
      
      // Clear the returnTo from session
      delete req.session.returnTo;
      
      // Construct redirect URL with token
      const redirectUrl = new URL(returnTo);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('t', Date.now().toString()); // Cache buster
      
      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("Error generating token:", error);
      res.redirect('https://aicgs.netlify.app?authError=tokenGeneration');
    }
  }
);

// Verify token and get user
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ 
        isAuthenticated: false, 
        message: 'No token provided' 
      });
    }
    
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if the token exists in the database
    const tokenDoc = await Token.findById(decoded.tokenId);
    if (!tokenDoc) {
      return res.status(401).json({ 
        isAuthenticated: false, 
        message: 'Invalid token' 
      });
    }
    
    // Get the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        isAuthenticated: false, 
        message: 'User not found' 
      });
    }
    
    // Return user info
    res.json({
      isAuthenticated: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        discordId: user.discordId
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ 
      isAuthenticated: false, 
      message: 'Invalid or expired token' 
    });
  }
});

// Auth status endpoint
router.get('/status', async (req, res) => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Verify the JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check if the token exists in the database
      const tokenDoc = await Token.findById(decoded.tokenId);
      if (!tokenDoc) {
        return res.json({ isAuthenticated: false, user: null });
      }
      
      // Get the user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.json({ isAuthenticated: false, user: null });
      }
      
      // User is authenticated
      return res.json({
        isAuthenticated: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          discordId: user.discordId
        }
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return res.json({ isAuthenticated: false, user: null });
    }
  } else if (req.isAuthenticated()) {
    // Traditional session authentication (fallback)
    return res.json({
      isAuthenticated: true,
      user: req.user
    });
  } else {
    // Not authenticated
    return res.json({
      isAuthenticated: false,
      user: null
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Verify the JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Delete the token from the database
      await Token.findByIdAndDelete(decoded.tokenId);
      
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error("Logout error:", error);
      res.json({ success: true, message: 'Logged out successfully' });
    }
  } else {
    // Traditional session logout (fallback)
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
      }
      
      res.json({ success: true, message: 'Logged out successfully' });
    });
  }
});

module.exports = router;