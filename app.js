const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const uri = "mongodb://localhost:27017";

app.use("/avatars", express.static(path.join(__dirname, "avatars")));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

mongoose.connect(uri)
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Could not connect to the database', err));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});

module.exports = app;
