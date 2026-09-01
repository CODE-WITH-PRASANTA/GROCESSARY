const mongoose = require("mongoose");

const todayDiscountSchema = new mongoose.Schema(
  {
    // ======================================================
    // PRODUCT
    // ======================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },

    // ======================================================
    // DISCOUNT PRICE
    // ======================================================

    discountPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================================
    // START DATE
    // ======================================================

    startDate: {
      type: Date,
      required: true,
    },

    // ======================================================
    // END DATE
    // ======================================================

    endDate: {
      type: Date,
      required: true,
    },

    // ======================================================
    // STATUS
    // ======================================================

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// INDEX
// ======================================================

todayDiscountSchema.index({
  status: 1,
  startDate: 1,
  endDate: 1,
});

module.exports = mongoose.model(
  "TodayDiscount",
  todayDiscountSchema
);
