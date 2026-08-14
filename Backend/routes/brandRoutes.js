const express = require("express");

const router = express.Router();


// ==========================================================
// CONTROLLER
// ==========================================================

const {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
} = require("../controllers/brandController");


// ==========================================================
// MULTER
// ==========================================================

const {
  upload,
  convertToWebp,
} = require("../middleware/upload");


// ==========================================================
// GET ALL BRANDS
// GET /api/brands
// ==========================================================

router.get("/", getBrands);


// ==========================================================
// GET SINGLE BRAND
// GET /api/brands/:id
// ==========================================================

router.get("/:id", getBrandById);


// ==========================================================
// CREATE BRAND
// POST /api/brands
//
// FormData:
//
// name
// tagline
// slug
// category
// description
// order
// status
// logo
// ==========================================================

router.post(
  "/",
  upload.single("logo"),
  convertToWebp,
  createBrand
);


// ==========================================================
// UPDATE BRAND
// PUT /api/brands/:id
//
// FormData:
//
// name
// tagline
// slug
// category
// description
// order
// status
// logo
// ==========================================================

router.put(
  "/:id",
  upload.single("logo"),
  convertToWebp,
  updateBrand
);


// ==========================================================
// UPDATE BRAND STATUS
// PATCH /api/brands/:id/status
//
// JSON:
//
// {
//   "status": "Active"
// }
// ==========================================================

router.patch(
  "/:id/status",
  updateBrandStatus
);


// ==========================================================
// DELETE BRAND
// DELETE /api/brands/:id
// ==========================================================

router.delete(
  "/:id",
  deleteBrand
);


module.exports = router;