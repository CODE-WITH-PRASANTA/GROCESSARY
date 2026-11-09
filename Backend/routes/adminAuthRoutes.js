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

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// Public routes
router.post("/login", adminLogin);
router.post("/register", adminRegister);
router.post("/logout", adminLogout);
router.get("/status", checkAdminStatus);
router.get("/registration-status", checkAdminStatus);

// Protected routes (require valid Admin JWT)
router.get("/me", adminAuthMiddleware, getAdminMe);
router.get("/profile", adminAuthMiddleware, getAdminMe);
router.put("/profile", adminAuthMiddleware, updateAdminProfile);

module.exports = router;

