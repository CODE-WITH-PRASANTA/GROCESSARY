const express = require("express");

const router = express.Router();


const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} = require("../controllers/categoryController");


const {
  upload,
  convertToWebp,
} = require("../middleware/upload");


// ======================================================
// GET ALL CATEGORIES
// GET /api/categories
// ======================================================

router.get(
  "/",
  getCategories
);


// ======================================================
// GET SINGLE CATEGORY
// GET /api/categories/:id
// ======================================================

router.get(
  "/:id",
  getCategoryById
);


// ======================================================
// CREATE CATEGORY
// POST /api/categories
//
// FormData:
// name
// slug
// parent
// description
// order
// status
// icon
//
// File:
// icon
// ======================================================

router.post(
  "/",
  upload.single("icon"),
  convertToWebp,
  createCategory
);


// ======================================================
// UPDATE CATEGORY
// PUT /api/categories/:id
// ======================================================

router.put(
  "/:id",
  upload.single("icon"),
  convertToWebp,
  updateCategory
);


// ======================================================
// UPDATE STATUS
// PATCH /api/categories/:id/status
// ======================================================

router.put(
  "/:id/status",
  updateCategoryStatus
);


// ======================================================
// DELETE CATEGORY
// DELETE /api/categories/:id
// ======================================================

router.delete(
  "/:id",
  deleteCategory
);


module.exports = router;