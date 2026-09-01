const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // ======================================================
    // USER
    // Optional because guests can submit reviews
    // ======================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ======================================================
    // GUEST REVIEWER NAME
    // ======================================================

    reviewerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // ======================================================
    // GUEST REVIEWER EMAIL
    // Optional
    // ======================================================

    reviewerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    // ======================================================
    // PRODUCT
    // ======================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // ======================================================
    // RATING
    // ======================================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // ======================================================
    // TITLE
    // ======================================================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // ======================================================
    // COMMENT
    // ======================================================

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // ======================================================
    // VERIFIED PURCHASE
    // ======================================================

    verifiedPurchase: {
      type: Boolean,
      default: false,
    },

    // ======================================================
    // REVIEW STATUS
    //
    // pending   = waiting for admin
    // published = visible on website
    // rejected  = rejected by admin
    // ======================================================

    status: {
      type: String,
      enum: ["pending", "published", "rejected"],
      default: "pending",
      index: true,
    },

    // ======================================================
    // PUBLISHED DATE
    // ======================================================

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// INDEXES
// ======================================================

reviewSchema.index({
  product: 1,
  status: 1,
  createdAt: -1,
});

reviewSchema.index({
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Review",
  reviewSchema
);