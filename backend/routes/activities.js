const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Get recent activities
router.get('/recent', async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username avatar discordId')
      .populate('agentId', 'name');

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;