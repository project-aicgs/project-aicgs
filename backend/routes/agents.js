const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');

// Get all agents
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all agents');
    const agents = await Agent.find();
    console.log('Found agents:', agents.length);
    res.json(agents);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get single agent
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching agent:', req.params.id);
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      console.log('Agent not found:', req.params.id);
      return res.status(404).json({ message: 'Agent not found' });
    }
    console.log('Found agent:', agent);
    res.json(agent);
  } catch (err) {
    console.error('Error fetching single agent:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;