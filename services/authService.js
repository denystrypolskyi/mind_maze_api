const bcrypt = require("bcryptjs");
const validator = require("validator");
const userRepository = require("../repositories/userRepository");
const jwt = require("jsonwebtoken");

const generateToken = (userId, username, email) => {
  const payload = { userId, username, email };

  const token = jwt.sign(payload, "mySecretKey", { expiresIn: "24h" });

  return token;
};

const register = async (email, username, password, avatar) => {
  if (!email || !username || !password) {
    return {
      status: 400,
      message: "Email, username, and password are required!",
    };
  }

  if (!validator.isEmail(email)) {
    return { status: 400, message: "Please provide a valid email address!" };
  }

  const existingUser = await userRepository.findByEmailOrUsername(
    email,
    username
  );
  if (existingUser) {
    return { status: 400, message: "Email or username already exists!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = { email, username, password: hashedPassword, avatar };
  await userRepository.create(userData);

  return { status: 200, message: "User registered successfully!" };
};

const login = async (username, password) => {
  if (!username || !password) {
    return { status: 400, message: "Username or password is missing!" };
  }

  const user = await userRepository.findByUsername(username);
  if (!user) {
    return { status: 404, message: "User not found!" };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { status: 401, message: "Incorrect password!" };
  }

  const token = generateToken(user._id, username, user.email);
  return { status: 200, token, message: "Login successful!" };
};

module.exports = {
  register,
  login,
};
