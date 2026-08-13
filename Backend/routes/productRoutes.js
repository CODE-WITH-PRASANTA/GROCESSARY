const express = require("express");

const router =
  express.Router();


// ======================================================
// CONTROLLER
// ======================================================

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");


// ======================================================
// UPLOAD MIDDLEWARE
// ======================================================

const {
  upload,
  convertToWebp,
  handleUploadError,
} = require("../middleware/upload");


// ======================================================
// GET ALL PRODUCTS
// GET /api/products
// ======================================================

router.get(
  "/",
  getProducts
);


// ======================================================
// GET PRODUCT BY ID
// GET /api/products/:id
// ======================================================

router.get(
  "/:id",
  getProductById
);


// ======================================================
// CREATE PRODUCT
// POST /api/products
// ======================================================

router.post(
  "/",

  upload.array(
    "images",
    5
  ),

  convertToWebp,

  createProduct,

  handleUploadError
);


// ======================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ======================================================

router.put(
  "/:id",

  upload.array(
    "images",
    5
  ),

  convertToWebp,

  updateProduct,

  handleUploadError
);


// ======================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ======================================================

router.delete(
  "/:id",
  deleteProduct
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;