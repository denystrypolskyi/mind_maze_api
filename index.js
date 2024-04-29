const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const LeaderboardEntry = require("./models/leaderboardEntry");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;
const uri = "mongodb://localhost:27017";

const app = express();

app.use("/avatars", express.static(path.join(__dirname, "avatars")));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "avatars/");
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const generateToken = (userId, username, email) => {
  const payload = { userId, username, email };

  const token = jwt.sign(payload, "mySecretKey", { expiresIn: "24h" });

  return token;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided!" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "mySecretKey");
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired!" });
    } else {
      return res.status(401).send({ message: "Invalid token!" });
    }
  }
};

app.post("/verify-token", verifyToken, (req, res) => {
  res.sendStatus(200);
});

app.post("/register", upload.single("avatar"), async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ message: "Email, username, and password are required!" });
  }

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address!" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists!" });
    }

    let avatar = "avatars/default_avatar.jpg";

    if (req.file) {
      avatar = req.file.path;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { email, username, password: hashedPassword, avatar };
    await User.create(userData);

    res.status(200).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Registration failed. Please try again later." });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username or password is missing!" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password!" });
    }

    const token = generateToken(user._id, username, user.email);

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Unable to process your request at the moment. Please try again later.",
    });
  }
});

app.get("/leaderboard", verifyToken, async (req, res) => {
  try {
    const leaderboardEntries = await LeaderboardEntry.find();
    res.status(200).json(leaderboardEntries);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" });
  }
});

app.get("/user-info", verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error!" });
  }
});

app.put("/user-info", verifyToken, async (req, res) => {
  const { email, username } = req.body;
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
        return res
          .status(400)
          .json({ message: "Email already exists for another user!" });
      }
      if (!validator.isEmail(email)) {
        return res
          .status(400)
          .json({ message: "Please provide a valid email address!" });
      }
      user.email = email;
    }

    if (username) {
      const existingUsernameUser = await User.findOne({ username });
      if (
        existingUsernameUser &&
        existingUsernameUser._id.toString() !== userId
      ) {
        return res
          .status(400)
          .json({ message: "Username already exists for another user!" });
      }
      const leaderboardEntry = await LeaderboardEntry.findOne({
        username: user.username,
      });
      if (leaderboardEntry) {
        leaderboardEntry.username = username;
        await leaderboardEntry.save();
      }
      user.username = username;
    }

    await user.save();

    const token = generateToken(userId, user.username, user.email);

    res.status(200).json({
      message: "Your information has been updated successfully!",
      token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update user data. Please try again later." });
  }
});

app.get("/user-avatar", verifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);

    if (!user || !user.avatar) {
      return res.status(404).json({ message: "Avatar not found!" });
    }

    const avatarPath = path.join(__dirname, user.avatar);
    res.status(200).json({ avatarPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error!" });
  }
});

app.put(
  "/user-avatar",
  verifyToken,
  upload.single("avatar"),
  async (req, res) => {
    const { userId } = req.user;
    const avatar = req.file;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      if (!avatar) {
        return res.status(400).json({ message: "Avatar file is missing!" });
      }

      user.avatar = avatar.path;
      await user.save();

      res.status(200).json({ message: "User avatar updated successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update user avatar. Please try again later.",
      });
    }
  }
);

app.post("/save-result", verifyToken, async (req, res) => {
  const { levelReached } = req.body;
  const { username } = req.user;

  if (!username || !levelReached) {
    return res
      .status(400)
      .json({ message: "Username and levelReached are required!" });
  }

  try {
    const existingLeaderboardEntry = await LeaderboardEntry.findOne({
      username,
    });

    if (existingLeaderboardEntry) {
      if (levelReached > existingLeaderboardEntry.levelReached) {
        existingLeaderboardEntry.levelReached = levelReached;
        await existingLeaderboardEntry.save();
        res.status(200).json({ message: "User result updated successfully!" });
      } else {
        res.status(200).json({
          message:
            "User result remains unchanged as the new max level is not higher than the existing one!",
        });
      }
    } else {
      const newLeaderboardEntry = new LeaderboardEntry({
        username,
        levelReached,
      });
      await newLeaderboardEntry.save();
      res.status(201).json({ message: "User result saved successfully!" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to save user result. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});
