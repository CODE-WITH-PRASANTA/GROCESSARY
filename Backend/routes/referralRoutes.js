// routes/referralRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminAuthMiddleware");
const {
  getMyReferrals,
  getMyReferralLink,
  validateReferralCode,
  adminGetAllReferrals,
} = require("../controllers/referralController");

// Public validation
router.get("/validate/:code", validateReferralCode);

// Customer protected
router.get("/me", protect, getMyReferrals);
router.get("/link", protect, getMyReferralLink);

// Admin protected
router.get("/admin/all", adminMiddleware, adminGetAllReferrals);

module.exports = router;