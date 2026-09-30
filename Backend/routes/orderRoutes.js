// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminAuthMiddleware");

// 👇 Destructure — multer instance + your custom middleware
const {
  upload,
  convertToWebp,
  handleUploadError,
} = require("../middleware/upload");

const {
  placeOrder,
  verifyPayment,
  razorpayWebhook,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
  abandonOrder,
  cancelOrder,
  getAllOrders,
  requestReturn,
  getReturnConfig,
  getReturnPickup,
  verifyPickupOtp,
  uploadPickupProof,
} = require("../controllers/orderController");

// ======================================================
// PUBLIC
// ======================================================
router.post("/webhook", razorpayWebhook);
router.get("/return-config", getReturnConfig);

// ======================================================
// AUTHENTICATED — user routes
// ======================================================
router.post("/place", protect, placeOrder);
router.post("/verify", protect, verifyPayment);
router.post("/:id/abandon", protect, abandonOrder);
router.post("/:id/cancel", protect, cancelOrder);
router.post("/:id/return", protect, requestReturn);

// ---- Return pickup flow ----
router.get("/:id/return-pickup", protect, getReturnPickup);
router.post("/:id/verify-pickup-otp", protect, verifyPickupOtp);

// Upload product proof images
// Order: multer → convert to webp → controller
router.post(
  "/:id/upload-pickup-proof",
  protect,
  upload.array("images", 5),   // 👈 multer instance handles multipart
  convertToWebp,               // 👈 converts to webp, updates req.files
  uploadPickupProof            // 👈 controller reads req.files
);

// Read own orders
router.get("/my", protect, getMyOrders);

// ======================================================
// ADMIN
// ======================================================
router.get("/", adminMiddleware, getAllOrders);
router.put("/:id/status", adminMiddleware, updateOrderStatus);

// ======================================================
// SINGLE ORDER — MUST BE LAST
// ======================================================
router.get("/:id", protect, getOrderById);

module.exports = router;