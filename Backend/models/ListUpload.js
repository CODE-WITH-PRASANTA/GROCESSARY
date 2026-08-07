const mongoose = require("mongoose");

// ======================================================
// COMMON STATUS VALUES
// ======================================================

const ORDER_STATUSES = [
  "Received",
  "Reviewing List",
  "Packing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

// ======================================================
// FILE SCHEMA
//
// Used for:
// 1. Customer uploaded grocery list
// 2. Admin uploaded receipt
// ======================================================

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      default: "",
      trim: true,
    },

    mimeType: {
      type: String,
      default: "",
      trim: true,
    },

    size: {
      type: Number,
      default: 0,
      min: 0,
    },

    sizeMB: {
      type: Number,
      default: 0,
      min: 0,
    },

    fileType: {
      type: String,

      enum: ["image", "pdf"],

      default: undefined,
    },

    path: {
      type: String,
      default: "",
      trim: true,
    },

    url: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

// ======================================================
// STATUS HISTORY SCHEMA
//
// Every time admin changes status:
//
// Received
// Reviewing List
// Packing
// Out for Delivery
// Delivered
//
// Exact date/time is stored here.
// ======================================================

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,

      enum: ORDER_STATUSES,

      required: true,
    },

    date: {
      type: Date,

      default: Date.now,

      required: true,
    },
  },
  {
    _id: false,
  },
);

// ======================================================
// MAIN LIST UPLOAD SCHEMA
// ======================================================

const listUploadSchema = new mongoose.Schema(
  {
    // ==================================================
    // CUSTOMER INFORMATION
    // ==================================================

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

      trim: true,
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

    // ==================================================
    // CUSTOMER UPLOADED GROCERY LIST
    // ==================================================

    uploadedFile: {
      type: fileSchema,

      required: true,
    },

    // ==================================================
    // ADMIN UPLOADED RECEIPT
    //
    // This is NOT the customer's grocery list.
    //
    // Admin uploads this receipt separately.
    // Customer can download it when status becomes:
    //
    // Out for Delivery
    // Delivered
    // ==================================================

    receiptFile: {
      type: fileSchema,

      default: null,
    },

    // ==================================================
    // ITEMS
    // ==================================================

    items: {
      type: Number,

      default: 0,

      min: 0,
    },

    // ==================================================
    // DELIVERY DATE / TIME
    //
    // Example:
    // 2026-08-07T18:30:00
    // ==================================================

    deliveryDateTime: {
      type: Date,

      default: null,
    },

    // ==================================================
    // BILLING INFORMATION
    // ==================================================

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

    // ==================================================
    // DOWNLOAD INFORMATION
    // ==================================================

    downloads: {
      type: Number,

      default: 0,

      min: 0,
    },

    todayDL: {
      type: Number,

      default: 0,

      min: 0,
    },

    // ==================================================
    // ORDER ID
    // ==================================================

    orderId: {
      type: String,

      required: true,

      unique: true,

      trim: true,

      index: true,
    },

    // ==================================================
    // RECEIPT NUMBER
    // ==================================================

    receiptNo: {
      type: String,

      required: true,

      trim: true,
    },

    // ==================================================
    // CURRENT ORDER STATUS
    //
    // Only the CURRENT status is stored here.
    //
    // Example:
    // status: "Packing"
    // ==================================================

    status: {
      type: String,

      enum: ORDER_STATUSES,

      default: "Received",
    },

    // ==================================================
    // STATUS HISTORY
    //
    // Example:
    //
    // [
    //   {
    //     status: "Received",
    //     date: "2026-08-07T08:00:00.000Z"
    //   },
    //   {
    //     status: "Reviewing List",
    //     date: "2026-08-07T08:30:00.000Z"
    //   },
    //   {
    //     status: "Packing",
    //     date: "2026-08-07T09:15:00.000Z"
    //   },
    //   {
    //     status: "Out for Delivery",
    //     date: "2026-08-07T11:00:00.000Z"
    //   }
    // ]
    // ==================================================

    statusHistory: {
      type: [statusHistorySchema],

      default: [],
    },
  },

  // ====================================================
  // AUTOMATIC TIMESTAMPS
  //
  // MongoDB automatically creates:
  //
  // createdAt
  // updatedAt
  // ====================================================

  {
    timestamps: true,
  },
);

// ======================================================
// INITIAL RECEIVED STATUS
//
// This middleware is useful as extra protection.
//
// When a NEW order is created and statusHistory is empty,
// automatically add:
//
// Received + current date/time
//
// Your create controller can also add it.
// This prevents new orders from accidentally having
// an empty statusHistory.
// ======================================================

listUploadSchema.pre("save", function () {
  if (
    this.isNew &&
    (!this.statusHistory ||
      this.statusHistory.length === 0)
  ) {
    this.statusHistory = [
      {
        status: "Received",

        date: new Date(),
      },
    ];
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = mongoose.model(
  "ListUpload",
  listUploadSchema,
);