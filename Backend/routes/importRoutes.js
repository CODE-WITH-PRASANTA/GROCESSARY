const express = require("express");

const {
  importData,
  getImportedData,
  getImportedDataById,
  updateImportedData,
  addImages,
  deleteImage,
  deleteImportedData,
} = require("../controllers/importController");

const {
  upload: importUpload,
  convertToWebp,
  handleUploadError,
} = require("../middleware/upload");

const router = express.Router();

// =====================================================
// IMPORT
// =====================================================

router.post(
  "/",
  importUpload.any(),
  convertToWebp,
  importData
);

// =====================================================
// GET ALL PRODUCTS
// =====================================================

router.get(
  "/",
  getImportedData
);

// =====================================================
// GET PRODUCT BY ID
// =====================================================

router.get(
  "/:id",
  getImportedDataById
);

// =====================================================
// UPDATE PRODUCT
// =====================================================

router.put(
  "/:id",
  importUpload.array(
    "images",
    5
  ),
  convertToWebp,
  updateImportedData
);

// =====================================================
// ADD IMAGES
// =====================================================

router.post(
  "/:id/images",
  importUpload.array(
    "images",
    5
  ),
  convertToWebp,
  addImages
);

// =====================================================
// DELETE IMAGE
// =====================================================

router.delete(
  "/:id/images/:imageId",
  deleteImage
);

// =====================================================
// DELETE PRODUCT
// =====================================================

router.delete(
  "/:id",
  deleteImportedData
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  handleUploadError
);

module.exports = router;