const mongoose = require("mongoose");

const importSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    writtenPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    manufactureDate: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: String,
      default: "",
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    inStock: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    images: [
      {
        originalName: {
          type: String,
          default: "",
        },

        fileName: {
          type: String,
          default: "",
        },

        mimeType: {
          type: String,
          default: "",
        },

        path: {
          type: String,
          default: "",
        },

        url: {
          type: String,
          default: "",
        },

        size: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Import",
  importSchema
);