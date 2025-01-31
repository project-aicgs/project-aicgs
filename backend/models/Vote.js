// First, update your Vote model (models/Vote.js) to track trait votes:
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  agentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agent',
    required: true 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  selectedTraits: [String],
  timestamp: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate votes
voteSchema.index({ agentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);