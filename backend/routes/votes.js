const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Agent = require('../models/Agent');
const Activity = require('../models/Activity');
const User = require('../models/User'); // Added missing import
const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

// Helper function to count user votes
const getUserVoteCount = async (userId) => {
  try {
    const count = await Vote.countDocuments({ userId: userId });
    return count;
  } catch (err) {
    console.error('Error in getUserVoteCount:', err);
    throw new Error('Failed to get vote count');
  }
};

// Get trait voting statistics
router.get('/trait-stats/:agentId', async (req, res) => {
  try {
    console.log('Fetching trait stats for agent:', req.params.agentId);
    const votes = await Vote.find({ agentId: req.params.agentId });
    console.log('Found votes for trait stats:', votes.length);
    const traitStats = {};
    
    votes.forEach(vote => {
      vote.selectedTraits.forEach(trait => {
        if (!traitStats[trait]) {
          traitStats[trait] = 0;
        }
        traitStats[trait]++;
      });
    });

    res.json({ traitStats });
  } catch (err) {
    console.error('Error in trait-stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
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
        console.log('Token not found in database for tokenId:', decoded.tokenId);
        return res.status(401).json({ 
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
          redirectTo: 'https://project-aicgs.onrender.com/api/auth/discord?redirect=https://aicgs.netlify.app/?showVoting=true&t=' + Date.now()
        });
      }
      
      // Get the user
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('User not found for userId:', decoded.userId);
        return res.status(401).json({ 
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
          redirectTo: 'https://project-aicgs.onrender.com/api/auth/discord?redirect=https://aicgs.netlify.app/?showVoting=true&t=' + Date.now()
        });
      }
      
      // Attach user to request
      req.user = user;
      return next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        redirectTo: 'https://project-aicgs.onrender.com/api/auth/discord?redirect=https://aicgs.netlify.app/?showVoting=true&t=' + Date.now()
      });
    }
  } else if (req.isAuthenticated()) {
    // Traditional session authentication (fallback)
    return next();
  } else {
    // Not authenticated
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
      redirectTo: 'https://project-aicgs.onrender.com/api/auth/discord?redirect=https://aicgs.netlify.app/?showVoting=true&t=' + Date.now()
    });
  }
};

// Get voting statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching vote stats');
    const totalVotes = await Vote.countDocuments();
    const uniqueVoters = await Vote.distinct('userId').then(users => users.length);
    console.log('Stats:', { totalVotes, uniqueVoters });
    res.json({ 
      totalVotes,
      uniqueVoters
    });
  } catch (err) {
    console.error('Error in /stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get remaining votes for authenticated user
router.get('/remaining', isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching remaining votes for user:', req.user._id); // Changed from req.user.id
    const userVoteCount = await getUserVoteCount(req.user._id); // Changed from req.user.id
    const remainingVotes = 100 - userVoteCount;
    console.log('Remaining votes:', remainingVotes);
    res.json({ remainingVotes });
  } catch (err) {
    console.error('Error in /remaining:', err);
    res.status(500).json({ message: err.message });
  }
});

// Cast a vote
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { agentId, selectedTraits } = req.body;
    console.log('Received vote request for agent:', agentId);
    console.log('Selected traits:', selectedTraits);
    console.log('Authenticated user:', req.user._id); // Changed from req.user.id

    // Check user's total vote count
    const userVoteCount = await getUserVoteCount(req.user._id); // Changed from req.user.id
    console.log('Current vote count for user:', userVoteCount);
    
    if (userVoteCount >= 100) {
      return res.status(400).json({ message: 'You have reached the maximum limit of 100 votes' });
    }

    // Check if user has already voted for this agent
    const existingVote = await Vote.findOne({
      agentId,
      userId: req.user._id // Changed from req.user.id
    });

    if (existingVote) {
      console.log('User already voted for this agent');
      return res.status(400).json({ message: 'You have already voted for this agent' });
    }

    // Get the agent and check its status
    const agent = await Agent.findById(agentId);
    if (!agent) {
      console.log('Agent not found:', agentId);
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if agent is still accepting votes
    if (agent.votes >= agent.votesNeeded || 
        agent.status === 'Agent Migration Processing' || 
        agent.status === 'Active') {
      console.log('Agent not accepting votes:', agent.status);
      return res.status(400).json({ message: 'This agent is no longer accepting votes' });
    }

    // Validate selected traits
    if (!selectedTraits || selectedTraits.length === 0) {
      return res.status(400).json({ message: 'Must select at least one trait' });
    }

    // Check if selected traits are valid
    const invalidTraits = selectedTraits.filter(trait => !agent.proposedTraits.includes(trait));
    if (invalidTraits.length > 0) {
      return res.status(400).json({ message: 'Invalid traits selected' });
    }

    // Create new vote
    const vote = new Vote({
      agentId,
      selectedTraits,
      userId: req.user._id // Changed from req.user.id
    });

    await vote.save();
    console.log('Vote saved successfully');

    // Create activity entry
    const activity = new Activity({
      userId: req.user._id, // Changed from req.user.id
      agentId,
      activityType: 'VOTE'
    });

    await activity.save();
    console.log('Activity record created');

    // Update agent's vote count and check if it reached the threshold
    let updateData = { $inc: { votes: 1 } };
    if (agent.votes + 1 >= agent.votesNeeded) {
      updateData.$set = { status: 'Agent Migration Processing' };
    }

    const updatedAgent = await Agent.findByIdAndUpdate(
      agentId,
      updateData,
      { new: true }
    );

    console.log('Agent updated:', updatedAgent);

    // Get updated trait stats
    const votes = await Vote.find({ agentId });
    const traitStats = {};
    votes.forEach(vote => {
      vote.selectedTraits.forEach(trait => {
        if (!traitStats[trait]) {
          traitStats[trait] = 0;
        }
        traitStats[trait]++;
      });
    });

    const remainingVotes = 100 - (userVoteCount + 1);

    res.status(201).json({ 
      vote, 
      agent: updatedAgent,
      remainingVotes,
      traitStats
    });
  } catch (err) {
    console.error('Error in vote creation:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;