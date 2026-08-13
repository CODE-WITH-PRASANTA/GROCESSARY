const express = require("express");

const router = express.Router();

// ========================================
// MULTER & FILE PROCESSING MIDDLEWARE
// ========================================

const {
  upload,
  convertToWebp, // <--- 1. Imported convertToWebp
} = require("../middleware/upload");

// ========================================
// CONTROLLERS
// ========================================

const {
  createListUpload,
  getAllListUploads,
  getListUploadById,
  updateListUpload,
  updateOrderStatus,
  uploadOrderReceipt, // <--- Added receipt upload controller
  deleteListUpload,
  trackOrderByOrderId,
} = require("../controllers/listUploadController");

// ========================================
// CREATE LIST ORDER
// POST /api/list-upload
// Image / PDF required
// ========================================

router.post(
  "/",
  upload.single("uploadedFile"),
  convertToWebp, // <--- 2. Added convertToWebp here
  createListUpload
);

// ========================================
// GET ALL LIST ORDERS
// GET /api/list-upload
// ========================================

router.get(
  "/",
  getAllListUploads
);

// ========================================
// TRACK ORDER USING ORDER ID
// ========================================

router.get(
  "/track/:orderId",
  trackOrderByOrderId
);

// ========================================
// GET SINGLE ORDER
// GET /api/list-upload/:id
// ========================================

router.get(
  "/:id",
  getListUploadById
);

// ========================================
// UPDATE ORDER
// PUT /api/list-upload/:id
// ========================================

router.put(
  "/:id",
  upload.single("uploadedFile"),
  convertToWebp, // <--- 3. Added convertToWebp here as well
  updateListUpload
);

// ========================================
// UPLOAD RECEIPT
// PUT /api/list-upload/:id/receipt
// ========================================

router.put(
  "/:id/receipt",
  upload.single("receiptFile"),
  convertToWebp, // <--- Added convertToWebp for receipt uploads
  uploadOrderReceipt
);

// ========================================
// UPDATE ORDER STATUS
// PUT /api/list-upload/:id/status
// ========================================

router.put(
  "/:id/status",
  updateOrderStatus
);

// ========================================
// DELETE ORDER
// DELETE /api/list-upload/:id
// ========================================

router.delete(
  "/:id",
  deleteListUpload
);

// ========================================
// EXPORT
// ========================================

module.exports = router;