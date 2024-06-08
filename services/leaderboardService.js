const leaderboardRepository = require("../repositories/leaderboardRepository");

const getLeaderboard = async () => {
  const leaderboardEntries = await leaderboardRepository.findAll();
  return { status: 200, data: leaderboardEntries };
};

const saveResult = async (username, levelReached) => {
  const existingLeaderboardEntry = await leaderboardRepository.findByUsername(
    username
  );

  if (existingLeaderboardEntry) {
    if (levelReached > existingLeaderboardEntry.levelReached) {
      existingLeaderboardEntry.levelReached = levelReached;
      await existingLeaderboardEntry.save();
      return { status: 200, message: "User result updated successfully!" };
    } else {
      return {
        status: 200,
        message:
          "User result remains unchanged as the new max level is not higher than the existing one!",
      };
    }
  } else {
    const newLeaderboardEntry = await leaderboardRepository.create({
      username,
      levelReached,
    });
    return { status: 201, message: "User result saved successfully!" };
  }
};

module.exports = {
  getLeaderboard,
  saveResult,
};
