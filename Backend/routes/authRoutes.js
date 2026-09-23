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

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

// Logged-in user only
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.post("/create-handoff", protect, createHandoff);
router.post("/consume-handoff", consumeHandoff);

module.exports = router;
