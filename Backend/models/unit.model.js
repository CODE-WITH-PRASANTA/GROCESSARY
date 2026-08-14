const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Unit name is required"],
      trim: true,
    },

    symbol: {
      type: String,
      required: [true, "Unit symbol is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["Weight", "Volume", "Count", "Length", "Other"],
      default: "Count",
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


/*
  Prevent duplicate unit names.
*/
unitSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  }
);


/*
  Prevent duplicate symbols.
*/
unitSchema.index(
  { symbol: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  }
);


/*
  Default sorting.
*/
unitSchema.index({
  order: 1,
});


module.exports = mongoose.model("Unit", unitSchema);