const express = require("express");

const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router =
  express.Router();

// ======================================================
// ALL CART ROUTES REQUIRE LOGIN
// ======================================================

router.use(protect);

// ======================================================
// GET CART
// ======================================================

router.get(
  "/",
  getCart
);

// ======================================================
// ADD TO CART
// ======================================================

router.post(
  "/add",
  addToCart
);

// ======================================================
// UPDATE QUANTITY
// ======================================================

router.put(
  "/update/:productId",
  updateCartQuantity
);

// ======================================================
// REMOVE PRODUCT
// ======================================================

router.delete(
  "/remove/:productId",
  removeFromCart
);

// ======================================================
// CLEAR CART
// ======================================================

router.delete(
  "/clear",
  clearCart
);

module.exports = router;