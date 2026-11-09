const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    title: {
      type: String,
      required: [true, "Coupon title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase amount cannot be negative"],
    },
    maxDiscount: {
      type: Number,
      default: null, // Only applicable for percentage discounts
      min: [0, "Maximum discount cannot be negative"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
      min: [1, "Usage limit must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, "Per-user limit must be at least 1"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Expired"],
      default: "Active",
    },
    isPublic: {
      type: Boolean,
      default: true, // true = Public coupon (visible to customers on store), false = Private coupon (code-only)
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        orderId: String,
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual to check if coupon is currently valid
couponSchema.virtual("isValid").get(function () {
  const now = new Date();
  const isExpired = this.expiryDate && new Date(this.expiryDate) < now;
  const isUsageExceeded = this.usageLimit !== null && this.usageCount >= this.usageLimit;
  return this.status === "Active" && !isExpired && !isUsageExceeded;
});

// Automatically check and update Expired status before save
couponSchema.pre("save", function () {
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    this.status = "Expired";
  }
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

module.exports = Coupon;

