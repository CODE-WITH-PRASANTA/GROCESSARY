const express = require("express");

const {
  addWishlist,
  removeWishlist,
  getWishlist,
  checkWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's wishlist
router.get("/", protect, getWishlist);

// Clear entire wishlist
router.delete("/clear", protect, clearWishlist);

// Check whether product is in wishlist
router.get("/check/:productId", protect, checkWishlist);

// Add product to wishlist (supports both /:productId and /add)
router.post("/add", protect, addWishlist);
router.post("/:productId", protect, addWishlist);

// Remove product from wishlist (supports both /:productId and /remove/:productId)
router.delete("/remove/:productId", protect, removeWishlist);
router.delete("/:productId", protect, removeWishlist);

module.exports = router;
