const mongoose = require("mongoose");

const leaderboardEntrySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  levelReached: {
    type: Number,
    required: true
  }
});

const LeaderboardEntry = mongoose.model("LeaderboardEntry", leaderboardEntrySchema);

module.exports = LeaderboardEntry;
