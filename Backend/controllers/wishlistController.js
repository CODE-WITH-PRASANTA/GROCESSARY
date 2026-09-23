const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Add wishlist
const addWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check already exists
    const existingWishlist = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    if (existingWishlist) {
      return res.status(409).json({
        success: false,
        message: "Product already exists in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user: userId,
      product: productId,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

// Remove wishlist
const removeWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.find({
      user: userId,
    })
      .populate({
        path: "product",
        select:
          "productName name slug sku shortDescription fullDescription price discountPrice writtenPrice sellingPrice stockQuantity images unit unitNo status",
        populate: {
          path: "unit",
          select: "name symbol type",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

// Check product wishlist status
const checkWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    return res.status(200).json({
      success: true,
      isWishlisted: Boolean(wishlist),
    });
  } catch (error) {
    console.error("Check wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
    });
  }
};

module.exports = {
  addWishlist,
  removeWishlist,
  getWishlist,
  checkWishlist,
};