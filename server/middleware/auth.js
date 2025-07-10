const jwt = require("jsonwebtoken");
const userModel = require("../models/users");
const User = require("../models/users");
require("dotenv").config();

const loginCheck = async (req, res, next) => {
  try {
    // Debug: Log all headers
    console.log("Request headers:", req.headers);
    
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid authorization header found");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token ? token.substring(0, 20) + "..." : "null");
    console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);
    if (!token) {
      console.log("No token extracted from header");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }
    console.log("JWT_SECRET used for decoding:", process.env.JWT_SECRET);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Find user
    const user = await User.findById(decoded._id);
    console.log("User found:", user ? { id: user._id, name: user.name, role: user.userRole } : "null");

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Checks if the request is from the logged-in user
const isAuth = (req, res, next) => {
  const { loggedInUserId } = req.body;
  if (
    !loggedInUserId ||
    !req.user._id ||
    loggedInUserId !== req.user._id.toString()
  ) {
    return res.status(403).json({ error: "You are not authenticated" });
  }
  next();
};

// Checks if the user has admin privileges
const isAdmin = async (req, res, next) => {
  try {
    const reqUser = await userModel.findById(req.body.loggedInUserId);

    if (!reqUser || reqUser.userRole !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "Failed to verify admin access" });
  }
};

module.exports = { loginCheck, isAuth, isAdmin };