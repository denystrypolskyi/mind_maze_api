const validator = require("validator");
const userRepository = require("../repositories/userRepository");
const leaderboardRepository = require("../repositories/leaderboardRepository");
const jwt = require("jsonwebtoken");
const path = require("path");

const generateToken = (userId, username, email) => {
  const payload = { userId, username, email };

  const token = jwt.sign(payload, "mySecretKey", { expiresIn: "24h" });

  return token;
};

const getUserInfo = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    return { status: 404, data: { message: "User not found!" } };
  }
  return { status: 200, data: user };
};

const updateUserInfo = async (userId, email, username) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    return { status: 404, message: "User not found!" };
  }

  if (email) {
    const existingEmailUser = await userRepository.findByEmail(email);
    if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
      return { status: 400, message: "Email already exists for another user!" };
    }
    if (!validator.isEmail(email)) {
      return { status: 400, message: "Please provide a valid email address!" };
    }
    user.email = email;
  }

  if (username) {
    const existingUsernameUser = await userRepository.findByUsername(username);
    if (
      existingUsernameUser &&
      existingUsernameUser._id.toString() !== userId
    ) {
      return {
        status: 400,
        message: "Username already exists for another user!",
      };
    }
    const leaderboardEntry = await leaderboardRepository.findByUsername(
      user.username
    );
    if (leaderboardEntry) {
      leaderboardEntry.username = username;
      await leaderboardEntry.save();
    }
    user.username = username;
  }

  await user.save();

  const token = generateToken(userId, user.username, user.email);
  return {
    status: 200,
    message: "Your information has been updated successfully!",
    token,
  };
};

const getUserAvatar = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user || !user.avatar) {
    return { status: 404, data: { message: "Avatar not found!" } };
  }
  const avatarPath = path.join(__dirname, user.avatar);
  return { status: 200, data: { avatarPath } };
};

const updateUserAvatar = async (userId, avatar) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    return { status: 404, message: "User not found!" };
  }

  if (!avatar) {
    return { status: 400, message: "Avatar file is missing!" };
  }

  user.avatar = avatar.path;
  await user.save();
  return { status: 200, message: "User avatar updated successfully!" };
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  getUserAvatar,
  updateUserAvatar,
};
