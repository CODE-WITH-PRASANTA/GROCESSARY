const mongoose = require("mongoose");

const coldLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    lookingFor: {
      type: String,
      default: "Contact Us Inquiry",
      trim: true,
    },

    source: {
      type: String,
      default: "Website - Contact Us",
      trim: true,
    },

    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },

    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Follow Up",
        "Converted",
      ],
      default: "New",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ColdLead", coldLeadSchema);