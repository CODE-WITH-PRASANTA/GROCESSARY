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
    // UNIT NO
    // ====================================================

    unitNo: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // ====================================================
    // SOURCE
    // ====================================================

    // manual = product created manually
    // import = product created through Excel import

    source: {
      type: String,
      enum: ["manual", "import"],
      default: "manual",
      index: true,
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

    // Purchase price from Excel
    purchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Written / MRP price
    writtenPrice: {
      type: Number,
      default: 0,
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
    // PRODUCT DATES
    // ====================================================

    manufactureDate: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
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
      enum: ["active", "inactive"],
      default: "active",
    },

    // ====================================================
    // PRODUCT IMAGES
    // ====================================================

    // Both manual and imported products use
    // the same image format.

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

// Optional index for Unit No
productSchema.index({
  unitNo: 1,
});

productSchema.index({
  status: 1,
});

// IMPORTANT FOR IMPORTED PRODUCTS

productSchema.index({
  source: 1,
});

productSchema.index({
  manufactureDate: 1,
});

productSchema.index({
  expiryDate: 1,
});

// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
  "Product",
  productSchema
);