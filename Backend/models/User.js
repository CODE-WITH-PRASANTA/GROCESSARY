const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ======================================================
    // PERSONAL INFORMATION
    // ======================================================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    // ======================================================
    // ADDRESS INFORMATION
    // ======================================================

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    // ======================================================
    // AUTHENTICATION
    // ======================================================

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ======================================================
    // PASSWORD RESET
    // ======================================================

    passwordResetOtp: {
      type: String,
      default: null,
    },

    passwordResetOtpExpires: {
      type: Date,
      default: null,
    },

    passwordResetAttempts: {
      type: Number,
      default: 0,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true, // allow null for existing users, unique for those who have one
      index: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
