const Review = require("../models/Review");
const Product = require("../models/Product");

// ======================================================
// CREATE REVIEW
// ======================================================

const createReview = async (req, res) => {
  try {
   

    const {
      productId,
      rating,
      title,
      comment,
    } = req.body || {};

    // ======================================================
    // PRODUCT ID
    // ======================================================

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    // ======================================================
    // RATING
    // ======================================================

    const reviewRating = Number(rating);

    if (
      !Number.isInteger(reviewRating) ||
      reviewRating < 1 ||
      reviewRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5.",
      });
    }

    // ======================================================
    // TITLE
    // ======================================================

    if (
      !title ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Review title is required.",
      });
    }

    // ======================================================
    // COMMENT
    // ======================================================

    if (
      !comment ||
      !comment.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Review message is required.",
      });
    }

    // ======================================================
    // FIND PRODUCT
    // ======================================================

    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    // ======================================================
    // CHECK DUPLICATE REVIEW
    // ======================================================

    const existingReview =
      await Review.findOne({
        user: req.user._id,
        product: productId,
      });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "You have already reviewed this product.",
      });
    }

    // ======================================================
    // CREATE REVIEW
    // ======================================================

    const review =
      await Review.create({
        user: req.user._id,

        product: productId,

        rating: reviewRating,

        title: title.trim(),

        comment: comment.trim(),

        verifiedPurchase: false,

        status: "active",
      });

    // ======================================================
    // POPULATE USER
    // ======================================================

    await review.populate(
      "user",
      "name email mobile"
    );

    // ======================================================
    // RESPONSE
    // ======================================================

    return res.status(201).json({
      success: true,

      message:
        "Review submitted successfully.",

      review,
    });
  } catch (error) {
    console.error(
      "Create review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit review.",
    });
  }
};

// ======================================================
// GET PRODUCT REVIEWS
// ======================================================

const getProductReviews = async (
  req,
  res
) => {
  try {
    const { productId } =
      req.params;

    const reviews =
      await Review.find({
        product: productId,
        status: "active",
      })
        .populate(
          "user",
          "name email mobile"
        )
        .sort({
          createdAt: -1,
        });

    // ======================================================
    // SUMMARY
    // ======================================================

    const totalReviews =
      reviews.length;

    let totalRating = 0;

    reviews.forEach((review) => {
      totalRating += Number(
        review.rating || 0
      );
    });

    const averageRating =
      totalReviews > 0
        ? Number(
            (
              totalRating /
              totalReviews
            ).toFixed(2)
          )
        : 0;

    // ======================================================
    // RATING BREAKDOWN
    // ======================================================

    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      const rating =
        Number(review.rating);

      if (
        rating >= 1 &&
        rating <= 5
      ) {
        ratingBreakdown[rating]++;
      }
    });

    // ======================================================
    // RESPONSE
    // ======================================================

    return res.status(200).json({
      success: true,

      message:
        "Product reviews fetched successfully.",

      summary: {
        totalReviews,
        averageRating,
        ratingBreakdown,
      },

      reviews,
    });
  } catch (error) {
    console.error(
      "Get product reviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch product reviews.",
    });
  }
};

// ======================================================
// DELETE REVIEW
// ======================================================

const deleteReview = async (
  req,
  res
) => {
  try {
    const { reviewId } =
      req.params;

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found.",
      });
    }

    // ======================================================
    // OWNER CHECK
    // ======================================================

    if (
      review.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this review.",
      });
    }

    await Review.findByIdAndDelete(
      reviewId
    );

    return res.status(200).json({
      success: true,
      message:
        "Review deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete review.",
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview,
};