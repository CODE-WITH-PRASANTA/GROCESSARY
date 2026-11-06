const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const AuthHandoff = require("../models/AuthHandoff");
const { sendEmailOtp } = require("../utils/sendOtp");
const generateReferralCode = require("../utils/generateReferralCode");
const { applyReferralCode } = require("./referralController");

// ======================================================
// HELPER: GENERATE JWT
// ======================================================
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "grocery_sathi_secret_key_default",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ======================================================
// HELPER: GENERATE 6-DIGIT OTP
// ======================================================
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ======================================================
// REGISTER NEW USER
// ======================================================
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      mobile,
      email,
      password,
      referralCode: incomingReferralCode,
    } = req.body;

    if (!firstName || !lastName || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedMobile = mobile.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate mobile number (10 digits)
    if (!/^[0-9]{10}$/.test(trimmedMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists with email or mobile
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile: trimmedMobile }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          message: "Email address is already registered. Please log in instead.",
        });
      }
      if (existingUser.mobile === trimmedMobile) {
        return res.status(409).json({
          success: false,
          message: "Mobile number is already registered. Please log in instead.",
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code for the newly registered user
    let newReferralCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts += 1;
      newReferralCode = generateReferralCode(trimmedFirst || "USER");
      const exists = await User.exists({ referralCode: newReferralCode });
      if (!exists) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      newReferralCode = `GS${Date.now().toString(36).toUpperCase()}`;
    }

    // Create user
    const user = await User.create({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: normalizedEmail,
      mobile: trimmedMobile,
      password: hashedPassword,
      referralCode: newReferralCode,
    });

    // Apply incoming referral code if provided
    if (incomingReferralCode && incomingReferralCode.trim()) {
      try {
        await applyReferralCode(user._id, incomingReferralCode.trim().toUpperCase());
      } catch (refErr) {
        console.error("Non-fatal referral application error:", refErr.message);
      }
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to Grocery Sathi.",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Register controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ======================================================
// LOGIN USER (Email or 10-digit Mobile)
// ======================================================
const login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number and password are required.",
      });
    }

    const trimmedInput = emailOrMobile.trim();
    const isMobileQuery = /^[0-9]{10}$/.test(trimmedInput);

    let user;
    if (isMobileQuery) {
      user = await User.findOne({ mobile: trimmedInput });
    } else {
      user = await User.findOne({
        $or: [
          { email: trimmedInput.toLowerCase() },
          { mobile: trimmedInput },
        ],
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your email/mobile and password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive. Please contact customer support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your email/mobile and password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ======================================================
// FORGOT PASSWORD - REQUEST OTP
// ======================================================
const forgotPassword = async (req, res) => {
  try {
    const { emailOrMobile } = req.body;

    if (!emailOrMobile) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email or mobile number.",
      });
    }

    const trimmedInput = emailOrMobile.trim();
    const user = await User.findOne({
      $or: [
        { email: trimmedInput.toLowerCase() },
        { mobile: trimmedInput },
      ],
    });

    // Consistent response for privacy security
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account matches your details, a verification OTP has been sent.",
      });
    }

    const otp = generateOtp();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordResetOtp = hashedOtp;
    user.passwordResetOtpExpires = expiresAt;
    user.passwordResetAttempts = 0;
    await user.save();

    // Send OTP via email
    if (user.email) {
      try {
        await sendEmailOtp(user.email, otp);
      } catch (mailErr) {
        console.error("Error sending OTP email:", mailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: "A 6-digit OTP has been sent to your registered email address.",
      // In non-production or for testing, optional hint:
      maskedEmail: user.email ? user.email.replace(/(?<=.{2}).(?=[^@]*?@)/g, "*") : undefined,
    });
  } catch (error) {
    console.error("Forgot password controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request. Please try again.",
    });
  }
};

// ======================================================
// RESET PASSWORD WITH OTP
// ======================================================
const resetPassword = async (req, res) => {
  try {
    const { emailOrMobile, otp, newPassword } = req.body;

    if (!emailOrMobile || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile, OTP, and new password are all required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const trimmedInput = emailOrMobile.trim();
    const user = await User.findOne({
      $or: [
        { email: trimmedInput.toLowerCase() },
        { mobile: trimmedInput },
      ],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or account not found.",
      });
    }

    if (!user.passwordResetOtp || !user.passwordResetOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "No active password reset request found. Please request a new OTP.",
      });
    }

    if (new Date() > user.passwordResetOtpExpires) {
      user.passwordResetOtp = null;
      user.passwordResetOtpExpires = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const hashedInputOtp = crypto.createHash("sha256").update(otp.trim()).digest("hex");
    if (hashedInputOtp !== user.passwordResetOtp) {
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check the code sent to your email.",
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetOtp = null;
    user.passwordResetOtpExpires = null;
    user.passwordResetAttempts = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again later.",
    });
  }
};

// ======================================================
// GET CURRENT USER (/api/auth/me)
// ======================================================
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
    });
  } catch (error) {
    console.error("GetMe controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile.",
    });
  }
};

// ======================================================
// UPDATE USER PROFILE (/api/auth/me)
// ======================================================
const updateMe = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "profileImage",
      "gender",
      "dateOfBirth",
      "address",
      "city",
      "state",
      "country",
      "pincode",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] === "string") {
          updates[key] = req.body[key].trim();
        } else {
          updates[key] = req.body[key];
        }
      }
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({
        success: false,
        message: `${field === "email" ? "Email" : "Mobile number"} is already in use by another account.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile.",
    });
  }
};

// ======================================================
// CREATE HANDOFF (Single Sign-On for secondary portal)
// ======================================================
const createHandoff = async (req, res) => {
  try {
    const code = crypto.randomBytes(32).toString("hex");

    await AuthHandoff.create({
      code,
      userId: req.user._id,
      expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds
    });

    return res.status(200).json({
      success: true,
      code,
    });
  } catch (error) {
    console.error("Create handoff error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create login handoff token.",
    });
  }
};

// ======================================================
// CONSUME HANDOFF
// ======================================================
const consumeHandoff = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Handoff code is required.",
      });
    }

    const handoff = await AuthHandoff.findOne({ code });
    if (!handoff) {
      return res.status(401).json({
        success: false,
        message: "Invalid or already used login handoff code.",
      });
    }

    if (handoff.expiresAt < new Date()) {
      await AuthHandoff.deleteOne({ _id: handoff._id });
      return res.status(401).json({
        success: false,
        message: "Login handoff code has expired.",
      });
    }

    const user = await User.findById(handoff.userId);
    if (!user || !user.isActive) {
      await AuthHandoff.deleteOne({ _id: handoff._id });
      return res.status(401).json({
        success: false,
        message: "User account not found or inactive.",
      });
    }

    // Delete one-time handoff code
    await AuthHandoff.deleteOne({ _id: handoff._id });

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login handoff successful.",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Consume handoff error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to complete login handoff.",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  createHandoff,
  consumeHandoff,
};
