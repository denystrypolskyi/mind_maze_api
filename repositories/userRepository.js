const User = require('../models/user');

const findByEmailOrUsername = async (email, username) => {
  return User.findOne({ $or: [{ email }, { username }] });
};

const findByEmail = async (email) => {
  return User.findOne({ email });
};

const findByUsername = async (username) => {
  return User.findOne({ username });
};

const findById = async (userId) => {
  return User.findById(userId);
};

const create = async (userData) => {
  return User.create(userData);
};

module.exports = {
  findByEmailOrUsername,
  findByEmail,
  findByUsername,
  findById,
  create
}