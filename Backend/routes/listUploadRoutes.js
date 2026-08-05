const express = require("express");

const router = express.Router();

// ========================================
// MULTER
// ========================================

const {
  upload,
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
  deleteListUpload,
  trackOrderByOrderId,
} = require(
  "../controllers/listUploadController"
);

// ========================================
// CREATE LIST ORDER
// POST /api/list-upload
// Image / PDF required
// ========================================

router.post(
  "/",
  upload.single("uploadedFile"),
  createListUpload
);

// ========================================
// GET ALL LIST ORDERS
// GET /api/list-upload
//
// Optional:
// ?status=Received
// ?search=weekly
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
//
// Can update:
// - listName
// - FullName
// - countryCode
// - phoneNumber
// - deliveryAddress
// - uploadedFile
//
// uploadedFile is optional.
// If provided, old Image/PDF is replaced.
// ========================================

router.put(
  "/:id",
  upload.single("uploadedFile"),
  updateListUpload
);

// ========================================
// UPDATE ORDER STATUS
// PATCH /api/list-upload/:id/status
// ========================================

router.put(
  "/:id/status",
  updateOrderStatus
);

// ========================================
// DELETE ORDER
// DELETE /api/list-upload/:id
//
// Also deletes uploaded Image/PDF
// ========================================

router.delete(
  "/:id",
  deleteListUpload
);

// ========================================
// EXPORT
// ========================================

module.exports = router;