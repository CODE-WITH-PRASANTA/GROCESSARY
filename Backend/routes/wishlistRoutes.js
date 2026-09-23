const express = require("express");

const {
  addWishlist,
  removeWishlist,
  getWishlist,
  checkWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's wishlist
router.get("/", protect, getWishlist);

// Check whether product is in wishlist
router.get(
  "/check/:productId",
  protect,
  checkWishlist
);

// Add product to wishlist
router.post(
  "/:productId",
  protect,
  addWishlist
);

// Remove product from wishlist
router.delete(
  "/:productId",
  protect,
  removeWishlist
);

module.exports = router;