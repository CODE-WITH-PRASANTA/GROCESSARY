const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================================================
// PROTECT
// Login REQUIRED
// ======================================================

const protect = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    ).select(
      "-password -passwordResetOtp"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error(
      "Auth middleware error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token.",
    });
  }
};


// ======================================================
// OPTIONAL AUTH
//
// Login NOT required.
//
// If token exists:
//     req.user = user
//
// If no token:
//     req.user = null
//
// This is used for guest reviews.
// ======================================================

const optionalAuth = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    // ==================================================
    // NO TOKEN
    // Guest user
    // ==================================================

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      req.user = null;

      return next();
    }

    const token =
      authHeader.split(" ")[1];

    // ==================================================
    // EMPTY TOKEN
    // ==================================================

    if (!token) {
      req.user = null;

      return next();
    }

    // ==================================================
    // VERIFY TOKEN
    // ==================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==================================================
    // FIND USER
    // ==================================================

    const user = await User.findById(
      decoded.userId
    ).select(
      "-password -passwordResetOtp"
    );

    // ==================================================
    // USER NOT FOUND
    // Treat as guest
    // ==================================================

    if (!user) {
      req.user = null;

      return next();
    }

    // ==================================================
    // INACTIVE USER
    // ==================================================

    if (!user.isActive) {
      req.user = null;

      return next();
    }

    // ==================================================
    // LOGGED-IN USER
    // ==================================================

    req.user = user;

    next();

  } catch (error) {
    console.log(
      "Optional auth: no valid login token, continuing as guest."
    );

    // ==================================================
    // IMPORTANT
    //
    // Invalid/expired token should NOT block
    // guest review submission.
    // ==================================================

    req.user = null;

    next();
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  protect,
  optionalAuth,
};