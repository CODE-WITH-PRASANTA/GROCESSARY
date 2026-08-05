const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
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

    size: {
      type: Number,
      default: 0,
    },

    sizeMB: {
      type: Number,
      default: 0,
    },

    fileType: {
      type: String,
      enum: ["image", "pdf"],
    },

    path: {
      type: String,
      default: "",
    },

    url: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const listUploadSchema = new mongoose.Schema(
  {
    listName: {
      type: String,
      required: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    countryCode: {
      type: String,
      default: "+91",
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryAddress: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedFile: {
      type: fileSchema,
      required: true,
    },

    // ============================
    // ADMIN / BILLING
    // ============================

    items: {
      type: Number,
      default: 0,
      min: 0,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    handlingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    gst: {
      type: Number,
      default: 0,
      min: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },

    todayDL: {
      type: Number,
      default: 0,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    receiptNo: {
      type: String,
      required: true,
    },

    status: {
      type: String,

      enum: [
        "Received",
        "Reviewing List",
        "Packing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],

      default: "Received",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ListUpload",
  listUploadSchema
);