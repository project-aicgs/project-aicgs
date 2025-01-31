// Then, update your votes route (routes/votes.js) to include trait stats:
const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Agent = require('../models/Agent');
const Activity = require('../models/Activity');

// Helper function to count user votes
const getUserVoteCount = async (userId) => {
  try {
    const count = await Vote.countDocuments({ userId: userId });
    return count;
  } catch (err) {
    throw new Error('Failed to get vote count');
  }
};

// Get trait voting statistics
router.get('/trait-stats/:agentId', async (req, res) => {
  try {
    const votes = await Vote.find({ agentId: req.params.agentId });
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
    res.status(500).json({ message: err.message });
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

router.get('/stats', async (req, res) => {
  try {
    const totalVotes = await Vote.countDocuments();
    res.json({ totalVotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/remaining', isAuthenticated, async (req, res) => {
  try {
    const userVoteCount = await getUserVoteCount(req.user.id);
    const remainingVotes = 100 - userVoteCount;
    res.json({ remainingVotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { agentId, selectedTraits } = req.body;

    // Check user's total vote count
    const userVoteCount = await getUserVoteCount(req.user.id);
    if (userVoteCount >= 100) {
      return res.status(400).json({ message: 'You have reached the maximum limit of 100 votes' });
    }

    // Check if user has already voted for this agent
    const existingVote = await Vote.findOne({
      agentId,
      userId: req.user.id
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted for this agent' });
    }

    // Get the agent and check its status
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if agent is still accepting votes
    if (agent.votes >= agent.votesNeeded || 
        agent.status === 'Agent Migration Processing' || 
        agent.status === 'Active') {
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
      userId: req.user.id
    });

    await vote.save();

    // Create activity entry
    const activity = new Activity({
      userId: req.user.id,
      agentId,
      activityType: 'VOTE'
    });

    await activity.save();

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

    // Add this route to your existing votes.js
router.get('/stats', async (req, res) => {
  try {
    const totalVotes = await Vote.countDocuments();
    
    // Count unique voters by getting distinct userId values
    const uniqueVoters = await Vote.distinct('userId').then(users => users.length);
    
    res.json({ 
      totalVotes,
      uniqueVoters
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

    const remainingVotes = 100 - (userVoteCount + 1);

    res.status(201).json({ 
      vote, 
      agent: updatedAgent,
      remainingVotes,
      traitStats
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;