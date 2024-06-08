const leaderboardService = require("../services/leaderboardService");

const getLeaderboard = async (req, res) => {
  try {
    const result = await leaderboardService.getLeaderboard();
    res.status(result.status).json(result.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const saveResult = async (req, res) => {
  const { levelReached } = req.body;
  const { username } = req.user;
  try {
    const result = await leaderboardService.saveResult(username, levelReached);
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save user result. Please try again later." });
  }
};

module.exports = { getLeaderboard, saveResult };
