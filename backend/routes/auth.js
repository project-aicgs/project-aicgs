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
      let user = await User.findOne({ discordId: profile.id });
      
      if (!user) {
        user = await User.create({
          discordId: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar
        });
      } else {
        // Update user information in case it changed on Discord
        user.username = profile.username;
        user.email = profile.email;
        user.avatar = profile.avatar;
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// When redirecting from Discord auth, save the return URL in session
router.get('/discord', (req, res, next) => {
  // Store the referer or a provided redirect URL
  req.session.returnTo = req.query.redirect || req.headers.referer || 'https://aicgs.netlify.app';
  next();
}, passport.authenticate('discord'));

// After successful authentication, redirect to the saved URL
router.get('/discord/callback', 
  passport.authenticate('discord', {
    failureRedirect: 'https://aicgs.netlify.app'
  }),
  (req, res) => {
    // Get the return URL from session and redirect there
    const returnTo = req.session.returnTo || 'https://aicgs.netlify.app/?showVoting=true';
    delete req.session.returnTo;
    res.redirect(returnTo);
  }
);

// Auth status endpoint to check if user is authenticated
router.get('/status', (req, res) => {
  console.log('Auth status check:', req.isAuthenticated(), req.user?.id); // More specific logging
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

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    // Clear the session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session' });
      }
      // Redirect to frontend after successful logout
      res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://aicgs.netlify.app'
        : 'http://localhost:5173');
    });
  });
});

module.exports = router;