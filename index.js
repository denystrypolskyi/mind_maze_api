const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const UserResult = require("./models/userResult");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const PORT = process.env.PORT || 3000;
const uri = "mongodb://localhost:27017";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

app.use(bodyParser.json());

const jwt = require("jsonwebtoken");

const generateToken = (userId, username, email) => {
  const payload = { userId, username, email };

  const token = jwt.sign(payload, "mySecretKey", { expiresIn: "2h" });

  return token;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "mySecretKey");
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    } else {
      return res.status(401).send({ message: "Invalid token." });
    }
  }
};

app.post("/verify-token", verifyToken, (req, res) => {
  res.sendStatus(200);
});

app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ message: "Email, username, and password are required" });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Email or username already exists" });
  }

  const userData = { email, username, password };
  User.create(userData)
    .then(() => {
      res.status(200).json({ message: "User registered successfully" });
    })
    .catch((error) => {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user" });
    });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password is missing" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = generateToken(user._id, username, user.email);

    res.status(200).send(token);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/user-results", verifyToken, async (req, res) => {
  try {
    const results = await UserResult.find();
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching user results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/user-info", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/save-result", verifyToken, async (req, res) => {
  const { maxLevelReached } = req.body;
  const { username } = req.user;

  if (!username || !maxLevelReached) {
    return res
      .status(400)
      .json({ message: "Username and maxLevelReached are required" });
  }

  try {
    const existingUserResult = await UserResult.findOne({ username });

    if (existingUserResult) {
      if (maxLevelReached > existingUserResult.maxLevelReached) {
        existingUserResult.maxLevelReached = maxLevelReached;
        await existingUserResult.save();
        res.status(200).json({ message: "User result updated successfully" });
      } else {
        res.status(200).json({
          message:
            "User result remains unchanged, as new max level reached is not higher.",
        });
      }
    } else {
      const newUserResult = new UserResult({
        username,
        maxLevelReached,
      });
      await newUserResult.save();
      res.status(201).json({ message: "User result saved successfully" });
    }
  } catch (error) {
    console.error("Error saving user result:", error);
    res.status(500).json({ message: "Error saving user result" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
