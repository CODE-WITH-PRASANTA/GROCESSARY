const express = require("express");
const router = express.Router();

const {
  adminLogin,
  adminRegister,
  getAdminMe,
  updateAdminProfile,
  adminLogout,
  checkAdminStatus,
} = require("../controllers/adminAuthController");

const {
  getAdminDashboardStats,
} = require("../controllers/adminDashboardController");

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// Registration status
router.get("/registration-status", checkAdminStatus);

// Analytics Dashboard Stats
router.get("/dashboard-stats", adminAuthMiddleware, getAdminDashboardStats);

// Register admin
router.post("/register", adminRegister);

// Login
router.post("/login", adminLogin);

// Get profile
router.get("/profile", adminAuthMiddleware, getAdminMe);

// Update name, email and password
router.put("/profile", adminAuthMiddleware, updateAdminProfile);

// Logout
router.post("/logout", adminLogout);

module.exports = router;
