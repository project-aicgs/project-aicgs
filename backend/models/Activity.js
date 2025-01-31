const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ['VOTE', 'COMMENT', 'PROPOSAL']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying of recent activities
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);