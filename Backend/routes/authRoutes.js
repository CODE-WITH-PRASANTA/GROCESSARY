const express = require("express");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router =
  express.Router();

// ======================================================
// REGISTER
// ======================================================

router.post(
  "/register",
  register
);

// ======================================================
// LOGIN
// ======================================================

router.post(
  "/login",
  login
);

// ======================================================
// FORGOT PASSWORD
// ======================================================

router.post(
  "/forgot-password",
  forgotPassword
);

// ======================================================
// RESET PASSWORD
// ======================================================

router.post(
  "/reset-password",
  resetPassword
);

// ======================================================
// CURRENT USER
// ======================================================

router.get(
  "/me",
  protect,
  getMe
);

module.exports = router;