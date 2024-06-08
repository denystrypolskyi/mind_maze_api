const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided!" });
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

module.exports = verifyToken;
