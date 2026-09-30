// models/Bill.js
const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true },
    sku: { type: String, default: "" },
    barcode: { type: String, default: "" },
    unit: { type: String, default: "" },
    price: { type: Number, required: true },       // effective price charged
    originalPrice: { type: Number, default: 0 },   // pre-discount price
    quantity: { type: Number, required: true, min: 1 },
    itemTotal: { type: Number, required: true },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",  
      required: true,
    },

    customer: {
      name: { type: String, default: "" },
      mobile: { type: String, default: "" },
    },

    items: { type: [billItemSchema], required: true },

    subtotal: { type: Number, required: true },
    discountType: {
      type: String,
      enum: ["percentage", "amount"],
      default: "amount",
    },
    discountValue: { type: Number, default: 0 },   // raw input (e.g. 10 or 50)
    discountAmount: { type: Number, default: 0 },  // computed ₹
    totalAmount: { type: Number, required: true },

    // Savings from today's discounts (informational)
    totalSavings: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI"],
      default: "Cash",
    },
    amountReceived: { type: Number, default: 0 },
    changeReturned: { type: Number, default: 0 },

    // UPI fields
    upiTransactionId: { type: String, default: "" },
    upiStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "none"],
      default: "none",
    },

    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "completed",
    },
  },
  { timestamps: true }
);

billSchema.index({ createdAt: -1 });
billSchema.index({ "customer.mobile": 1 });
billSchema.index({ "items.product": 1 });

module.exports = mongoose.model("Bill", billSchema);