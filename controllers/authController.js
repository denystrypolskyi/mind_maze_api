const authService = require("../services/authService");

const register = async (req, res) => {
  const { email, username, password } = req.body;
  const avatar = req.file ? req.file.path : "avatars/default_avatar.jpg";
  try {
    const result = await authService.register(
      email,
      username,
      password,
      avatar
    );
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Registration failed. Please try again later." });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await authService.login(username, password);
    res
      .status(result.status)
      .json({ token: result.token, message: result.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Unable to process your request at the moment. Please try again later.",
    });
  }
};

const verifyToken = (req, res) => {
  res.sendStatus(200);
};

module.exports = {
  register,
  login,
  verifyToken,
};
