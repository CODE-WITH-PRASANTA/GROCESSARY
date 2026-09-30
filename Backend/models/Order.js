// models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    sku: { type: String, default: "" },
    unit: { type: String, default: "" }, // e.g. "250 g"
    price: { type: Number, required: true }, // per-unit selling price at order time
    originalPrice: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    itemTotal: { type: Number, required: true },
    image: { type: String, default: "" },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    items: { type: [orderItemSchema], required: true },

    // Pricing breakdown
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // subtotal + delivery + tax

    // Discounts applied
    walletUsed: { type: Number, default: 0 },
    pointsUsed: { type: Number, default: 0 },
    pointsValue: { type: Number, default: 0 },

    // Final payable amount
    payableAmount: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "wallet"],
      default: "razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    // Delivery address snapshot
    deliveryAddress: {
      name: String,
      mobile: String,
      address: String,
      landmark: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      addressType: String,
    },

    // Status
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    statusHistory: [statusHistorySchema],

    // ---- Return request fields ----
    returnStatus: {
      type: String,
      enum: [
        "none",
        "requested",
        "approved",
        "rejected",
        "pickup_scheduled",
        "picked",
        "inspection",
        "refunded",
        "replaced",
      ],
      default: "none",
    },
    returnReason: { type: String, default: "" },
    returnNote: { type: String, default: "" },
    returnRequestedAt: { type: Date, default: null },
    returnResolvedAt: { type: Date, default: null },
    returnAssignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    returnAmount: { type: Number, default: 0 },
    returnType: {
      type: String,
      enum: ["refund", "replacement", "exchange"],
      default: "refund",
    },
    deliveredAt: { type: Date, default: null },

    // Pickup details (set by admin when scheduling)
    pickupDetails: {
      scheduledAt: { type: Date, default: null },
      slot: { type: String, default: "" }, // e.g. "10:00 AM – 12:00 PM"
      agent: { type: String, default: "" }, // agent name
      agentPhone: { type: String, default: "" },
      address: { type: String, default: "" },
      instructions: { type: String, default: "" },
      otp: { type: String, default: "" }, // 4–6 digit OTP
      otpVerified: { type: Boolean, default: false },
      otpVerifiedAt: { type: Date, default: null },
    },

    // Proof uploaded by user at pickup
    pickupProof: {
      images: { type: [String], default: [] },
      condition: { type: String, default: "" }, // e.g. "good", "damaged", "opened", "other"
      note: { type: String, default: "" },
      uploadedAt: { type: Date, default: null },
    },

    // Inspection report by admin
    inspectionReport: {
      verdict: { type: String, default: "" }, // "approved", "rejected"
      condition: { type: String, default: "" },
      note: { type: String, default: "" },
      images: { type: [String], default: [] }, // optional admin uploads
      inspectedAt: { type: Date, default: null },
    },

    // Idempotency — prevents double-processing a webhook
    processedPaymentIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ returnStatus: 1, returnRequestedAt: -1 });
orderSchema.index({ returnAssignedTo: 1 });

module.exports = mongoose.model("Order", orderSchema);
