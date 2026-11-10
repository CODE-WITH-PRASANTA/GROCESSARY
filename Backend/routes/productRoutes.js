const express = require("express");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,

  updateProductStatus,
  bulkUpdateProductStatus,

  publishProduct,
  unpublishProduct,

  bulkPublishProducts,
  bulkUnpublishProducts,
  bulkDeleteProducts,
} = require("../controllers/productController");

const {
  upload,
  convertToWebp,
  handleUploadError,
} = require("../middleware/upload");

const router = express.Router();

// =====================================================
// GET ALL PRODUCTS
// =====================================================
//
// GET /api/products
//
// Supports:
// ?search=atta
// ?category=categoryId
// ?brand=brandId
// ?unit=unitId
// ?status=active
// ?source=import
// ?page=1
// ?limit=100
//
// =====================================================

router.get(
  "/",
  getAllProducts
);

// =====================================================
// GET PRODUCT BY ID
// =====================================================
//
// GET /api/products/:id
//
// =====================================================

router.get(
  "/:id",
  getProductById
);

// =====================================================
// CREATE PRODUCT
// =====================================================
//
// POST /api/products
//
// Supports up to 5 images.
//
// FormData:
// images
//
// =====================================================

router.post(
  "/",
  upload.array(
    "images",
    5
  ),
  convertToWebp,
  createProduct
);

// =====================================================
// BULK STATUS
// =====================================================
//
// IMPORTANT:
// This route MUST come before /:id
//
// PUT /api/products/bulk-status
//
// Body:
//
// {
//   "ids": [
//     "productId1",
//     "productId2"
//   ],
//   "status": "active"
// }
//
// or:
//
// {
//   "ids": [
//     "productId1",
//     "productId2"
//   ],
//   "status": "inactive"
// }
//
// =====================================================

router.put(
  "/bulk-status",
  bulkUpdateProductStatus
);

// =====================================================
// BULK PUBLISH
// =====================================================
//
// PUT /api/products/bulk-publish
//
// Body:
//
// {
//   "ids": [
//     "productId1",
//     "productId2"
//   ]
// }
//
// =====================================================

router.put(
  "/bulk-publish",
  bulkPublishProducts
);

// =====================================================
// BULK UNPUBLISH
// =====================================================
//
// PUT /api/products/bulk-unpublish
//
// Body:
//
// {
//   "ids": [
//     "productId1",
//     "productId2"
//   ]
// }
//
// =====================================================

router.put(
  "/bulk-unpublish",
  bulkUnpublishProducts
);

// =====================================================
// BULK DELETE
// =====================================================
// DELETE /api/products/bulk or POST /api/products/bulk-delete
// Body: { "ids": ["id1", "id2"] }
// =====================================================

router.delete(
  "/bulk",
  bulkDeleteProducts
);

router.post(
  "/bulk-delete",
  bulkDeleteProducts
);

// =====================================================
// UPDATE PRODUCT STATUS
// =====================================================
//
// PUT /api/products/:id/status
//
// Body:
//
// {
//   "status": "active"
// }
//
// or:
//
// {
//   "status": "inactive"
// }
//
// =====================================================

router.put(
  "/:id/status",
  updateProductStatus
);

// =====================================================
// PUBLISH PRODUCT
// =====================================================
//
// PUT /api/products/:id/publish
//
// =====================================================

router.put(
  "/:id/publish",
  publishProduct
);

// =====================================================
// UNPUBLISH PRODUCT
// =====================================================
//
// PUT /api/products/:id/unpublish
//
// =====================================================

router.put(
  "/:id/unpublish",
  unpublishProduct
);

// =====================================================
// UPDATE PRODUCT
// =====================================================
//
// PUT /api/products/:id
//
// Supports updating product information.
//
// If images are sent:
//
// images = new images
//
// Existing images are preserved and new images
// are appended up to a maximum of 5.
//
// =====================================================

router.put(
  "/:id",
  upload.array(
    "images",
    5
  ),
  convertToWebp,
  updateProduct
);

// =====================================================
// DELETE PRODUCT IMAGE
// =====================================================
//
// DELETE /api/products/:id/images/:imageKey
//
// =====================================================

router.delete(
  "/:id/images/:imageKey",
  deleteProductImage
);

// =====================================================
// DELETE PRODUCT
// =====================================================
//
// DELETE /api/products/:id
//
// =====================================================

router.delete(
  "/:id",
  deleteProduct
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  handleUploadError
);

module.exports = router;