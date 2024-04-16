const mongoose = require("mongoose");

const userResultSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  maxLevelReached: {
    type: Number,
    required: true
  }
});

const UserResult = mongoose.model("UserResult", userResultSchema);

module.exports = UserResult;
