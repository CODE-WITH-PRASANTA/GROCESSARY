const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const AuthHandoff = require("../models/AuthHandoff");

const { sendEmailOtp } = require("../utils/sendOtp");
const generateReferralCode = require("../utils/generateReferralCode");
const { applyReferralCode } = require("./referralController");
// ======================================================
// GENERATE JWT
// ======================================================

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

// ======================================================
// GENERATE OTP
// ======================================================

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ======================================================
// REGISTER
// ======================================================

// ======================================================
// REGISTER
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
        message: "All fields are required.",
      });
    }

    // -----------------------------------------------
    // VALIDATE MOBILE
    // -----------------------------------------------

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10 digit mobile number.",
      });
    }

    // -----------------------------------------------
    // VALIDATE PASSWORD
    // -----------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // -----------------------------------------------
    // NORMALIZE EMAIL
    // -----------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------------------------
    // CHECK EXISTING USER
    // -----------------------------------------------

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { mobile }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered.",
        });
      }

      if (existingUser.mobile === mobile) {
        return res.status(409).json({
          success: false,
          message: "Mobile number is already registered.",
        });
      }
    }

    // -----------------------------------------------
    // HASH PASSWORD
    // -----------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 12);

    // -----------------------------------------------
    // GENERATE UNIQUE REFERRAL CODE FOR NEW USER
    // -----------------------------------------------

    let newUserReferralCode;
    let exists = true;

    while (exists) {
      newUserReferralCode = generateReferralCode(
        firstName || lastName || "USER",
      );
      exists = await User.exists({ referralCode: newUserReferralCode });
    }

    // -----------------------------------------------
    // CREATE USER
    // -----------------------------------------------

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      mobile,
      password: hashedPassword,
      referralCode: newUserReferralCode,
    });

    // -----------------------------------------------
    // APPLY INCOMING REFERRAL CODE (if provided)
    // -----------------------------------------------

    if (incomingReferralCode && incomingReferralCode.trim()) {
      try {
        await applyReferralCode(
          user._id,
          incomingReferralCode.trim().toUpperCase(),
        );
      } catch (refErr) {
        // Do not block signup if referral fails
        console.error("applyReferralCode error:", refErr);
      }
    }

    // -----------------------------------------------
    // JWT
    // -----------------------------------------------

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        referralCode: user.referralCode, // 👈 include this
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile and password are required.",
      });
    }

    const value = emailOrMobile.trim().toLowerCase();

    // -----------------------------------------------
    // FIND USER
    // -----------------------------------------------

    const user = await User.findOne({
      $or: [
        {
          email: value,
        },
        {
          mobile: emailOrMobile.trim(),
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password.",
      });
    }

    // -----------------------------------------------
    // ACTIVE CHECK
    // -----------------------------------------------

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // -----------------------------------------------
    // PASSWORD CHECK
    // -----------------------------------------------

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password.",
      });
    }

    // -----------------------------------------------
    // TOKEN
    // -----------------------------------------------

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",

      token,

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (req, res) => {
  try {
    const { emailOrMobile } = req.body;

    if (!emailOrMobile) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number is required.",
      });
    }

    const value = emailOrMobile.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        {
          email: value,
        },
        {
          mobile: emailOrMobile.trim(),
        },
      ],
    });

    // Don't reveal whether account exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, an OTP has been sent.",
      });
    }

    // -----------------------------------------------
    // GENERATE OTP
    // -----------------------------------------------

    const otp = generateOtp();

    // Hash OTP before database storage
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // 10 minute expiry
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetOtp = hashedOtp;

    user.passwordResetOtpExpires = expires;

    user.passwordResetAttempts = 0;

    await user.save();

    // -----------------------------------------------
    // SEND OTP
    // -----------------------------------------------

    if (user.email) {
      await sendEmailOtp(user.email, otp);
    }

    /*
      IMPORTANT:

      For mobile OTP, connect your SMS provider
      here.

      Example:
      
      await sendSmsOtp(
        user.mobile,
        otp
      );
    */

    return res.status(200).json({
      success: true,
      message: "If the account exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process forgot password request.",
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
  try {
    const { emailOrMobile, otp, newPassword } = req.body;

    if (!emailOrMobile || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile, OTP and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const value = emailOrMobile.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        {
          email: value,
        },
        {
          mobile: emailOrMobile.trim(),
        },
      ],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or account.",
      });
    }

    // -----------------------------------------------
    // OTP EXPIRY
    // -----------------------------------------------

    if (!user.passwordResetOtp || !user.passwordResetOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired.",
      });
    }

    if (new Date() > user.passwordResetOtpExpires) {
      user.passwordResetOtp = null;

      user.passwordResetOtpExpires = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // -----------------------------------------------
    // OTP CHECK
    // -----------------------------------------------

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== user.passwordResetOtp) {
      user.passwordResetAttempts += 1;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // -----------------------------------------------
    // HASH NEW PASSWORD
    // -----------------------------------------------

    user.password = await bcrypt.hash(newPassword, 12);

    // -----------------------------------------------
    // CLEAR OTP
    // -----------------------------------------------

    user.passwordResetOtp = null;

    user.passwordResetOtpExpires = null;

    user.passwordResetAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
};

// ======================================================
// GET CURRENT USER
// ======================================================

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,

      user: {
        id: req.user._id,

        firstName: req.user.firstName,
        lastName: req.user.lastName,

        email: req.user.email,
        mobile: req.user.mobile,

        // ✅ ADD THIS
        profileImage: req.user.profileImage || "",

        gender: req.user.gender || "",
        dateOfBirth: req.user.dateOfBirth || null,

        address: req.user.address || "",
        city: req.user.city || "",
        state: req.user.state || "",
        country: req.user.country || "",
        pincode: req.user.pincode || "",
        referralCode: req.user.referralCode || "",

        role: req.user.role,
        isActive: req.user.isActive,

        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user.",
    });
  }
};

// ======================================================
// UPDATE LOGGED-IN USER
// ======================================================

const updateMe = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobile,
      profileImage,
      gender,
      dateOfBirth,
      address,
      city,
      state,
      country,
      pincode,
    } = req.body;

    const updateData = {};

    if (firstName !== undefined) {
      updateData.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      updateData.lastName = lastName.trim();
    }

    if (email !== undefined) {
      updateData.email = email.trim().toLowerCase();
    }

    if (mobile !== undefined) {
      updateData.mobile = mobile.trim();
    }
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage.trim();
    }
    if (gender !== undefined) {
      updateData.gender = gender;
    }

    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth || null;
    }

    if (address !== undefined) {
      updateData.address = address.trim();
    }

    if (city !== undefined) {
      updateData.city = city.trim();
    }

    if (state !== undefined) {
      updateData.state = state.trim();
    }

    if (country !== undefined) {
      updateData.country = country.trim();
    }

    if (pincode !== undefined) {
      updateData.pincode = pincode.trim();
    }

    console.log("UPDATE USER ID:", req.user._id);

    console.log("UPDATE DATA:", updateData);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select(
      "-password -passwordResetOtp -passwordResetOtpExpires -passwordResetAttempts",
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log("UPDATED USER:", updatedUser);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      return res.status(400).json({
        success: false,
        message:
          field === "email"
            ? "Email address is already in use."
            : field === "mobile"
              ? "Mobile number is already in use."
              : "Duplicate value already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((item) => item.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

const createHandoff = async (req, res) => {
  try {
    const code = crypto.randomBytes(32).toString("hex");

    await AuthHandoff.create({
      code,
      userId: req.user._id,
      expiresAt: new Date(Date.now() + 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      code,
    });
  } catch (error) {
    console.error("Create handoff error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create login handoff.",
    });
  }
};

const consumeHandoff = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Handoff code is required.",
      });
    }

    // Find the one-time code
    const handoff = await AuthHandoff.findOne({
      code,
    });

    if (!handoff) {
      return res.status(401).json({
        success: false,
        message: "Invalid or already used login code.",
      });
    }

    // Check expiration
    if (handoff.expiresAt < new Date()) {
      await AuthHandoff.deleteOne({
        _id: handoff._id,
      });

      return res.status(401).json({
        success: false,
        message: "Login code has expired.",
      });
    }

    // Find user
    const user = await User.findById(handoff.userId).select(
      "-password -passwordResetOtp",
    );

    if (!user) {
      await AuthHandoff.deleteOne({
        _id: handoff._id,
      });

      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check active account
    if (!user.isActive) {
      await AuthHandoff.deleteOne({
        _id: handoff._id,
      });

      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // IMPORTANT:
    // Delete code before returning JWT.
    // This makes the code one-time-use.
    await AuthHandoff.deleteOne({
      _id: handoff._id,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("Consume handoff error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete login.",
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
