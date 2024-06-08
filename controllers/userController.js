const userService = require("../services/userService");

const getUserInfo = async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await userService.getUserInfo(userId);
    res.status(user.status).json(user.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const updateUserInfo = async (req, res) => {
  const { userId } = req.user;
  const { email, username } = req.body;
  try {
    const result = await userService.updateUserInfo(userId, email, username);
    res
      .status(result.status)
      .json({ message: result.message, token: result.token });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update user data. Please try again later." });
  }
};

const getUserAvatar = async (req, res) => {
  const { userId } = req.user;
  try {
    const result = await userService.getUserAvatar(userId);
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error!" });
  }
};

const updateUserAvatar = async (req, res) => {
  const { userId } = req.user;
  const avatar = req.file;
  try {
    const result = await userService.updateUserAvatar(userId, avatar);
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Failed to update user avatar. Please try again later.",
      });
  }
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  getUserAvatar,
  updateUserAvatar,
};
