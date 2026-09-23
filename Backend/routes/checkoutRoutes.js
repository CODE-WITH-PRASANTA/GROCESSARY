// routes/checkoutRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { previewCheckout } = require("../controllers/checkoutController");

router.post("/preview", protect, previewCheckout);

module.exports = router;