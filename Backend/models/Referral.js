// models/Referral.js
const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    referralCode: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "completed", "expired", "cancelled"],
      default: "pending",
    },
    joinedAt: { type: Date, default: Date.now },
    firstOrderAt: { type: Date, default: null },
    firstOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    rewardAmount: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 0 },
    friendRewardAmount: { type: Number, default: 0 },
    friendRewardPoints: { type: Number, default: 0 },
    rewarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

referralSchema.index({ referrer: 1, createdAt: -1 });

module.exports = mongoose.model("Referral", referralSchema);