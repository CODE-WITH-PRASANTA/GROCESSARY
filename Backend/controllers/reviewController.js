const Review = require("../models/Review");
const Product = require("../models/Product");

// ======================================================
// CREATE REVIEW
// PUBLIC
//
// Guest users + logged-in users can submit
// ======================================================

const createReview = async (req, res) => {
  try {
    const {
      productId,
      reviewerName,
      reviewerEmail,
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
    // REVIEWER NAME
    // ======================================================

    if (
      !reviewerName ||
      !reviewerName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Your name is required.",
      });
    }

    const cleanName =
      reviewerName.trim();

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Name cannot exceed 100 characters.",
      });
    }

    // ======================================================
    // EMAIL
    // Optional
    // ======================================================

    let cleanEmail = "";

    if (
      reviewerEmail &&
      reviewerEmail.trim()
    ) {
      cleanEmail =
        reviewerEmail.trim().toLowerCase();

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }
    }

    // ======================================================
    // RATING
    // ======================================================

    const reviewRating =
      Number(rating);

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

    const cleanTitle =
      title.trim();

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

    const cleanComment =
      comment.trim();

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
    // OPTIONAL DUPLICATE CHECK FOR LOGGED-IN USER
    //
    // Guests are allowed to submit reviews.
    // Logged-in users cannot review the same product twice.
    // ======================================================

    let userId = null;

    if (req.user?._id) {
      userId = req.user._id;

      const existingReview =
        await Review.findOne({
          user: userId,
          product: productId,
        });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message:
            "You have already reviewed this product.",
        });
      }
    }

    // ======================================================
    // CREATE REVIEW
    //
    // ALWAYS PENDING
    // Admin must publish it.
    // ======================================================

    const review =
      await Review.create({
        user: userId,

        reviewerName:
          cleanName,

        reviewerEmail:
          cleanEmail,

        product: productId,

        rating:
          reviewRating,

        title:
          cleanTitle,

        comment:
          cleanComment,

        verifiedPurchase:
          false,

        status:
          "pending",

        publishedAt:
          null,
      });

    // ======================================================
    // POPULATE USER IF AVAILABLE
    // ======================================================

    if (review.user) {
      await review.populate(
        "user",
        "name email mobile"
      );
    }

    // ======================================================
    // RESPONSE
    // ======================================================

    return res.status(201).json({
      success: true,

      message:
        "Review submitted successfully. It will appear after admin approval.",

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
// PUBLIC
//
// ONLY PUBLISHED REVIEWS ARE RETURNED
// ======================================================

const getProductReviews = async (
  req,
  res
) => {
  try {
    const {
      productId,
    } = req.params;

    // ======================================================
    // CHECK PRODUCT
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
    // ONLY PUBLISHED REVIEWS
    // ======================================================

    const reviews =
      await Review.find({
        product: productId,
        status: "published",
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

    reviews.forEach(
      (review) => {
        totalRating += Number(
          review.rating || 0
        );
      }
    );

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

    reviews.forEach(
      (review) => {
        const reviewRating =
          Number(review.rating);

        if (
          reviewRating >= 1 &&
          reviewRating <= 5
        ) {
          ratingBreakdown[
            reviewRating
          ]++;
        }
      }
    );

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
// GET ALL REVIEWS FOR ADMIN
// ======================================================

const getAllReviews = async (
  req,
  res
) => {
  try {
    const reviews =
      await Review.find()
        .populate(
          "user",
          "name email mobile"
        )
        .populate(
          "product",
          "productName sku images"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      reviews,
    });

  } catch (error) {
    console.error(
      "Get all reviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch reviews.",
    });
  }
};

// ======================================================
// PUBLISH REVIEW
// ADMIN
// ======================================================

const publishReview = async (
  req,
  res
) => {
  try {
    const {
      reviewId,
    } = req.params;

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

    review.status =
      "published";

    review.publishedAt =
      new Date();

    await review.save();

    return res.status(200).json({
      success: true,

      message:
        "Review published successfully.",

      review,
    });

  } catch (error) {
    console.error(
      "Publish review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to publish review.",
    });
  }
};

// ======================================================
// REJECT REVIEW
// ADMIN
// ======================================================

const rejectReview = async (
  req,
  res
) => {
  try {
    const {
      reviewId,
    } = req.params;

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

    review.status =
      "rejected";

    review.publishedAt =
      null;

    await review.save();

    return res.status(200).json({
      success: true,

      message:
        "Review rejected successfully.",

      review,
    });

  } catch (error) {
    console.error(
      "Reject review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject review.",
    });
  }
};

// ======================================================
// UNPUBLISH REVIEW
// ADMIN
// ======================================================

const unpublishReview = async (
  req,
  res
) => {
  try {
    const {
      reviewId,
    } = req.params;

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

    review.status =
      "pending";

    review.publishedAt =
      null;

    await review.save();

    return res.status(200).json({
      success: true,

      message:
        "Review unpublished successfully.",

      review,
    });

  } catch (error) {
    console.error(
      "Unpublish review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to unpublish review.",
    });
  }
};

// ======================================================
// DELETE REVIEW
// ADMIN / OWNER
// ======================================================

const deleteReview = async (
  req,
  res
) => {
  try {
    const {
      reviewId,
    } = req.params;

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
    // ADMIN CAN DELETE
    // ======================================================

    const isAdmin =
      req.user?.role === "admin" ||
      req.user?.isAdmin === true;

    if (isAdmin) {
      await Review.findByIdAndDelete(
        reviewId
      );

      return res.status(200).json({
        success: true,
        message:
          "Review deleted successfully.",
      });
    }

    // ======================================================
    // OWNER CAN DELETE
    // ======================================================

    if (
      !review.user ||
      !req.user?._id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this review.",
      });
    }

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
  getAllReviews,
  publishReview,
  rejectReview,
  unpublishReview,
  deleteReview,
};