// models/RewardPoints.js
const mongoose = require("mongoose");

const pointsTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "earned_order",
        "earned_referral",
        "earned_welcome",
        "redeemed_order",
        "redeemed_wallet",
        "expired",
        "admin_adjust",
      ],
      required: true,
    },
    points: { type: Number, required: true },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    reference: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

const rewardPointsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    availablePoints: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0 },
    totalUsed: { type: Number, default: 0 },
    transactions: [pointsTransactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("RewardPoints", rewardPointsSchema);