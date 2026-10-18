// /back/middlewares/authenticateJWT.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateJWT = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).send("Access denied. No token provided.");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid token or token expired.");
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateJWT;
