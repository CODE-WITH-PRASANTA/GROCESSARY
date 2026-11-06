const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit mobile number"],
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

    // Address Information
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
      default: "India",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    // Authentication & Authorization
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
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

    // Password Reset via OTP
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

    // Referral Program
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      uppercase: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to format user object safely without exposing credentials
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    name: `${this.firstName} ${this.lastName}`.trim(),
    email: this.email,
    mobile: this.mobile,
    role: this.role,
    profileImage: this.profileImage || "",
    gender: this.gender || "",
    dateOfBirth: this.dateOfBirth,
    address: this.address || "",
    city: this.city || "",
    state: this.state || "",
    country: this.country || "",
    pincode: this.pincode || "",
    referralCode: this.referralCode || "",
    referredBy: this.referredBy || null,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);
