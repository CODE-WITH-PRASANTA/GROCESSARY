const express = require("express");

const {
  createReview,
  getProductReviews,
  getAllReviews,
  publishReview,
  rejectReview,
  unpublishReview,
  deleteReview,
} = require("../controllers/reviewController");

const {
  protect,
  optionalAuth,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// PUBLIC
// GET PUBLISHED REVIEWS
// ======================================================

router.get(
  "/product/:productId",
  getProductReviews
);


// ======================================================
// PUBLIC
// CREATE REVIEW
//
// Login is NOT required
// ======================================================

router.post(
  "/",
  optionalAuth,
  createReview
);


// ======================================================
// ADMIN
// GET ALL REVIEWS
// ======================================================

router.get(
  "/admin/all",
  
  getAllReviews
);


// ======================================================
// ADMIN
// PUBLISH
// ======================================================

router.put(
  "/admin/:reviewId/publish",
 
  publishReview
);


// ======================================================
// ADMIN
// REJECT
// ======================================================


router.put(
  "/admin/:reviewId/reject",
  
  rejectReview
);




// ======================================================
// ADMIN
// UNPUBLISH
// ======================================================

router.put(
  "/admin/:reviewId/unpublish",
  
  unpublishReview
);


// ======================================================
// DELETE
// ======================================================

router.delete(
  "/:reviewId",
 
  deleteReview
);


module.exports = router;