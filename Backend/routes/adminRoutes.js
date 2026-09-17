const express = require("express");
const router = express.Router();

const {
  checkAdminRegistration,
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  logoutAdmin,
} = require("../controllers/adminController");

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// Registration status
router.get(
  "/registration-status",
  checkAdminRegistration
);

// Register first admin
router.post("/register", registerAdmin);

// Login
router.post("/login", loginAdmin);

// Get profile
router.get(
  "/profile",
  adminAuthMiddleware,
  getAdminProfile
);

// Update name, email and password
router.put(
  "/profile",
  adminAuthMiddleware,
  updateAdminProfile
);

// Logout
// No middleware required so logout also works if token expired
router.post("/logout", logoutAdmin);

module.exports = router;