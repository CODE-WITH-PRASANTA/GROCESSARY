const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ======================================================
// POPULATE CART
// ======================================================

// ======================================================
// POPULATE CART
// ======================================================

const populateCart = async (cart) => {
  await cart.populate({
    path: "items.product",
    select:
      "productName slug sku price writtenPrice sellingPrice discountPrice stockQuantity images unit unitNo",
    populate: {
      path: "unit",
      select: "name symbol type",
    },
  });

  return cart;
};

// ======================================================
// GET CART
// GET /api/cart
// ======================================================

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully.",
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart.",
    });
  }
};

// ======================================================
// ADD TO CART
// POST /api/cart/add
// ======================================================

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const stock = Number(product.stockQuantity || 0);

    if (stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock.",
      });
    }

    if (requestedQuantity > stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock} item(s) available in stock.`,
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;

      if (newQuantity > stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${stock} item(s) available in stock.`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: requestedQuantity,
      });
    }

    await cart.save();

    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully.",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart.",
    });
  }
};

// ======================================================
// UPDATE CART QUANTITY
// PUT /api/cart/update/:productId
// ======================================================

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;

    const { quantity } = req.body;

    const newQuantity = Number(quantity);

    // --------------------------------------------------
    // VALIDATE QUANTITY
    // --------------------------------------------------

    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    // --------------------------------------------------
    // CHECK PRODUCT
    // --------------------------------------------------

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // --------------------------------------------------
    // CHECK STOCK
    // --------------------------------------------------

    const stock = Number(product.stockQuantity || 0);

    if (stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock.",
      });
    }

    if (newQuantity > stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock} item(s) available in stock.`,
      });
    }

    // --------------------------------------------------
    // FIND USER CART
    // --------------------------------------------------

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    // --------------------------------------------------
    // FIND CART ITEM
    // --------------------------------------------------

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product is not in cart.",
      });
    }

    // --------------------------------------------------
    // UPDATE QUANTITY
    // --------------------------------------------------

    cartItem.quantity = newQuantity;

    await cart.save();

    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully.",
      cart,
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart quantity.",
    });
  }
};

// ======================================================
// REMOVE FROM CART
// DELETE /api/cart/remove/:productId
// ======================================================

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString(),
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "Product is not in cart.",
      });
    }

    await cart.save();

    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart.",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart.",
    });
  }
};

// ======================================================
// CLEAR CART
// DELETE /api/cart/clear
// ======================================================

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty.",
        cart: null,
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear cart.",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
