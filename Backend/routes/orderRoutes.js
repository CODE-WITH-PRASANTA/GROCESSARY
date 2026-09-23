// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminAuthMiddleware");

const {
  placeOrder,
  verifyPayment,
  razorpayWebhook,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
  abandonOrder,
  getAllOrders
} = require("../controllers/orderController");

// ======================================================
// PUBLIC — Razorpay webhook (no auth, uses raw body)
// ======================================================

router.post("/webhook", razorpayWebhook);

// ======================================================
// AUTHENTICATED ROUTES
// ======================================================

// Place / verify / abandon — any logged-in user
router.post("/place", protect, placeOrder);
router.post("/verify", protect, verifyPayment);
router.post("/:id/abandon", protect, abandonOrder);

// Read own orders
router.get("/my", protect, getMyOrders);

router.get("/", adminMiddleware, getAllOrders);

// Admin-only status update
router.put("/:id/status", adminMiddleware, updateOrderStatus);

// Single order — must be LAST so it doesn't shadow /my or /place
router.get("/:id", protect, getOrderById);

module.exports = router;
