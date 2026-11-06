const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  createHandoff,
  consumeHandoff,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Authentication Endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Logged-in User Profile Endpoints
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

// Single Sign-On / Handoff Endpoints
router.post("/create-handoff", protect, createHandoff);
router.post("/consume-handoff", consumeHandoff);

module.exports = router;
