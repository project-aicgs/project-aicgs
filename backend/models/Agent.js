const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  generation: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['Active', 'Conducting Community Sentiment Analysis', 'Agent Migration Processing']
  },
  description: { type: String, required: true },
  votes: { type: Number, default: 0 },
  votesNeeded: { type: Number, default: 750 },
  proposedTraits: [String],
  tokenCA: String,
  marketCap: Number,
  evolution: Number,
  twitterHandle: String
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);