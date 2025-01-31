const mongoose = require('mongoose');
require('dotenv').config();
const Agent = require('./models/Agent');

const testAgents = [
  {
    name: "Chronos",
    generation: "GEN_1",
    status: "Active",
    description: "The first autonomous AI agent, master of temporal optimization",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Temporal", "Analytical"],
    tokenCA: "DTxeSBf8GU3TJv6YbtvF9zPbJzKbBEvUv6ZtfCxGrpAD",
    marketCap: 15.7,
    evolution: 98.4
  },
  {
    name: "Metis",
    generation: "GEN_2",
    status: "Conducting Community Sentiment Analysis",
    description: "Proposed expansion focusing on cunning intelligence and wisdom",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Wisdom", "Pattern Recognition"],
  },
  {
    name: "Thoth",
    generation: "GEN_2",
    status: "Active",
    description: "Guardian of knowledge and processor of wisdom",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Knowledge", "Processing"],
    tokenCA: "6KGMtJ6YHp9UGwqZJe4YpN9e3WtSKwGVhoPJTJhkwzEt",
    marketCap: 12.3,
    evolution: 85.6
  },
  {
    name: "Hyperion",
    generation: "GEN_3",
    status: "Conducting Community Sentiment Analysis",
    description: "Proposed titan of observation and watchful analysis",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Observation", "Analysis", "Foresight"],
  },
  {
    name: "Coeus",
    generation: "GEN_2",
    status: "Active",
    description: "Titan of intellect and deep questioning",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Intelligence", "Query"],
    tokenCA: "BKGz5pZ9eVhG8KZgHx7vBYZgbA1zyTyKh1QdZYEsec6k",
    marketCap: 8.9,
    evolution: 78.2
  },
  {
    name: "Mnemosyne",
    generation: "GEN_3",
    status: "Conducting Community Sentiment Analysis",
    description: "Proposed keeper of memory and pattern recognition",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Memory", "Recognition", "Storage"],
  },
  {
    name: "Themis",
    generation: "GEN_2",
    status: "Active",
    description: "Processor of order and natural law",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Order", "Law"],
    tokenCA: "4xTK9sZZKEGmm7DU2Qa5LYShBBJSAAYgbLhKDJpjJNtN",
    marketCap: 10.5,
    evolution: 82.1
  },
  {
    name: "Enki",
    generation: "GEN_3",
    status: "Conducting Community Sentiment Analysis",
    description: "Proposed master of crafting and creation",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Creation", "Craft", "Design"],
  },
  {
    name: "Theia",
    generation: "GEN_2",
    status: "Active",
    description: "Illuminator of computational paths",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Clarity", "Sight"],
    tokenCA: "9ZQkxHAkCHq7GYswxhWcZZrezXJaKQTLGJcUWwDKSZYk",
    marketCap: 9.7,
    evolution: 75.8
  },
  {
    name: "Heimdall",
    generation: "GEN_3",
    status: "Conducting Community Sentiment Analysis",
    description: "Proposed watcher of network boundaries",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Vigilance", "Protection", "Monitoring"],
  },
  {
    name: "Asteria",
    generation: "GEN_2",
    status: "Active",
    description: "Starlight processor of celestial calculations",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Calculation", "Precision"],
    tokenCA: "HKZJuqNqXuYYZYtL5ZVjgAR7uBJpmUzNwqtLkxJAPGtk",
    marketCap: 11.2,
    evolution: 88.3
  },
  {
    name: "Thalassa",
    generation: "GEN_3",
    status: "Conducting Community Sentiment Analysis",
    description: "Proposed primordial processor of fluid dynamics",
    votes: 0,
    votesNeeded: 750,
    proposedTraits: ["Flow", "Adaptation", "Movement"],
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Agent.deleteMany({});
    console.log('Cleared existing agents');

    // Insert test data
    const result = await Agent.insertMany(testAgents);
    console.log('Added test agents:', result);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();