const mongoose = require("mongoose");

// ======================================================
// PRODUCT SCHEMA
// ======================================================

const productSchema = new mongoose.Schema(
  {
    // ====================================================
    // PRODUCT INFORMATION
    // ====================================================

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // ====================================================
    // CATEGORY
    // ====================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // ====================================================
    // BRAND
    // ====================================================

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },

    // ====================================================
    // SKU
    // ====================================================

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ====================================================
    // UNIT
    // ====================================================

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    // ====================================================
    // TAGS
    // ====================================================

    tags: {
      type: [String],
      default: [],
    },

    // ====================================================
    // DESCRIPTION
    // ====================================================

    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    fullDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // ====================================================
    // SEO
    // ====================================================

    metaTitle: {
      type: String,
      default: "",
      trim: true,
    },

    metaDescription: {
      type: String,
      default: "",
      trim: true,
    },

    metaKeywords: {
      type: [String],
      default: [],
    },

    // ====================================================
    // PRICE
    // ====================================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ====================================================
    // STOCK
    // ====================================================

    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockAlert: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ====================================================
    // TAX
    // ====================================================

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ====================================================
    // STOCK STATUS
    // ====================================================

    isOutOfStock: {
      type: Boolean,
      default: false,
    },

    // ====================================================
    // PRODUCT STATUS
    // ====================================================

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
      ],
      default: "active",
    },

    // ====================================================
    // PRODUCT IMAGES
    // ====================================================

    images: {
      type: [String],
      default: [],
    },
  },

  {
    timestamps: true,
  }
);


// ======================================================
// INDEXES
// ======================================================

productSchema.index({
  productName: 1,
});

productSchema.index({
  category: 1,
});

productSchema.index({
  brand: 1,
});

productSchema.index({
  unit: 1,
});

productSchema.index({
  status: 1,
});


// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
  "Product",
  productSchema
);