const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');
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

// Save the return URL when initiating Discord auth
router.get('/discord', (req, res, next) => {
  // Get the redirectUrl from query or fallback to referer
  const redirectUrl = req.query.redirect || req.headers.referer || 'https://aicgs.netlify.app';
  
  // Store it in session for later use
  req.session.returnTo = redirectUrl;
  console.log("Setting return URL to:", redirectUrl);
  
  // Force session save before redirecting to ensure it's available after auth
  req.session.save((err) => {
    if (err) {
      console.error("Error saving session:", err);
    }
    next();
  });
}, passport.authenticate('discord'));

// After successful authentication, redirect to the saved URL
router.get('/discord/callback', 
  passport.authenticate('discord', {
    failureRedirect: 'https://aicgs.netlify.app'
  }),
  (req, res) => {
    // Get the return URL from session and redirect there
    const returnTo = req.session.returnTo || 'https://aicgs.netlify.app/?showVoting=true';
    console.log("Successfully authenticated, redirecting to:", returnTo);
    
    // Clear the returnTo from session
    delete req.session.returnTo;
    
    // Make sure to save session changes before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session after auth:", err);
      }
      res.redirect(returnTo);
    });
  }
);

// Auth status endpoint with enhanced logging
router.get('/status', (req, res) => {
  console.log('Auth status check:');
  console.log('- isAuthenticated:', req.isAuthenticated());
  console.log('- User ID:', req.user ? req.user.id : 'none');
  console.log('- Session ID:', req.session.id || 'no session');
  
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null
    });
  }
});

// Logout route with improved handling
router.get('/logout', (req, res) => {
  console.log("Logging out user:", req.user ? req.user.username : "Unknown");
  
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    
    // Clear the session completely
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: 'Error destroying session' });
      }
      
      // Clear the cookie
      res.clearCookie('connect.sid');
      
      // Redirect to frontend after successful logout
      res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://aicgs.netlify.app'
        : 'http://localhost:5173');
    });
  });
});

module.exports = router;