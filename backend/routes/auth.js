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
    scope: ['identify', 'email'],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
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

// Save the return URL when initiating Discord auth - with additional logging
router.get('/discord', (req, res, next) => {
  // Get the redirectUrl from query parameters
  const redirectUrl = req.query.redirect || 'https://aicgs.netlify.app';
  
  // Store the redirect URL in the session
  req.session.returnTo = redirectUrl;
  console.log("Setting returnTo URL in session:", redirectUrl);
  console.log("Session ID:", req.session.id);
  
  // Force session save before redirecting to ensure it's available after auth
  req.session.save((err) => {
    if (err) {
      console.error("Error saving session before auth:", err);
      return res.status(500).send("Error preparing authentication. Please try again.");
    }
    
    console.log("Session saved successfully, proceeding to Discord auth");
    passport.authenticate('discord')(req, res, next);
  });
});

// After successful authentication, redirect to the saved URL - with enhanced error handling
router.get('/discord/callback', 
  passport.authenticate('discord', {
    failureRedirect: 'https://aicgs.netlify.app?authError=true'
  }),
  (req, res) => {
    console.log("Discord auth callback successful for user:", req.user ? req.user.username : "unknown");
    console.log("Session ID:", req.session.id);
    
    // Get the return URL from session
    const returnTo = req.session.returnTo || 'https://aicgs.netlify.app';
    console.log("Redirecting to:", returnTo);
    
    // Clear the returnTo from session
    delete req.session.returnTo;
    
    // Make sure to save session changes before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session after auth:", err);
        return res.redirect('https://aicgs.netlify.app?authError=sessionSave');
      }
      
      // Add cache-busting parameter to prevent browser caching
      const redirectUrl = new URL(returnTo);
      redirectUrl.searchParams.set('t', Date.now().toString());
      
      res.redirect(redirectUrl.toString());
    });
  }
);

// Auth status endpoint with enhanced logging and error handling
router.get('/status', (req, res) => {
  console.log('Auth status check:');
  console.log('- isAuthenticated:', req.isAuthenticated());
  console.log('- User ID:', req.user ? req.user.id : 'none');
  console.log('- Session ID:', req.session.id || 'no session');
  
  // Return detailed status for debugging
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user,
      sessionActive: true
    });
  } else {
    // Check if session exists but no user
    const hasSession = !!req.session && !!req.session.id;
    
    res.json({
      isAuthenticated: false,
      user: null,
      sessionActive: hasSession
    });
  }
});

// Logout route with enhanced error handling
router.get('/logout', (req, res) => {
  console.log("Logging out user:", req.user ? req.user.username : "Unknown");
  
  // First destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    
    // Clear the cookie - even if there was an error with the session
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    // Then redirect to the frontend
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? 'https://aicgs.netlify.app?loggedOut=true'
      : 'http://localhost:5173?loggedOut=true';
    
    res.redirect(redirectUrl);
  });
});

module.exports = router;