// models/Wallet.js
const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "add_money",
        "order_payment",
        "refund",
        "referral_bonus",
        "cashback",
        "withdrawal",
        "admin_credit",
        "admin_debit",
        "points_conversion",
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    balanceAfter: { type: Number, required: true },
    reference: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    transactions: [walletTransactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);