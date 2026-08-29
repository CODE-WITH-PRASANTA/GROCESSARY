const express = require("express");

const {
  createReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/reviewController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router =
  express.Router();

// ======================================================
// GET PRODUCT REVIEWS
// PUBLIC
// ======================================================

router.get(
  "/product/:productId",
  getProductReviews
);

// ======================================================
// CREATE REVIEW
// LOGIN REQUIRED
// ======================================================

router.post(
  "/",
  protect,
  createReview
);

// ======================================================
// DELETE REVIEW
// LOGIN REQUIRED
// ======================================================

router.delete(
  "/:reviewId",
  protect,
  deleteReview
);

module.exports = router;