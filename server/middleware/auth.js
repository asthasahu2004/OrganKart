const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const userModel = require("../models/users");

// Verifies token and attaches user details to request
exports.loginCheck = (req, res, next) => {
  try {
    let token = req.headers.token;
    token = token.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userDetails = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: "You must be logged in",
    });
  }
};

// Checks if the request is from the logged-in user
exports.isAuth = (req, res, next) => {
  const { loggedInUserId } = req.body;
  if (
    !loggedInUserId ||
    !req.userDetails._id ||
    loggedInUserId !== req.userDetails._id
  ) {
    return res.status(403).json({ error: "You are not authenticated" });
  }
  next();
};

// Checks if the user has admin privileges
exports.isAdmin = async (req, res, next) => {
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
