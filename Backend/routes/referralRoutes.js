// routes/referralRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getMyReferrals,
  getMyReferralLink,
} = require("../controllers/referralController");

router.get("/me", protect, getMyReferrals);
router.get("/link", protect, getMyReferralLink);

module.exports = router;