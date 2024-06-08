const LeaderboardEntry = require('../models/leaderboardEntry');

const findByUsername = async (username) => {
  return LeaderboardEntry.findOne({ username });
};

const findAll = async () => {
  return LeaderboardEntry.find();
};

const create = async (entryData) => {
  return LeaderboardEntry.create(entryData);
};

module.exports = {
  findByUsername,
  findAll,
  create
}