const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");

const {
  sendEmailOtp,
} = require("../utils/sendOtp");

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
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "7d",
    }
  );
};

// ======================================================
// GENERATE OTP
// ======================================================

const generateOtp = () => {
  return Math.floor(
    100000 +
      Math.random() * 900000
  ).toString();
};

// ======================================================
// REGISTER
// ======================================================

const register = async (
  req,
  res
) => {
  try {
    const {
      firstName,
      lastName,
      mobile,
      email,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !mobile ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required.",
      });
    }

    // -----------------------------------------------
    // VALIDATE MOBILE
    // -----------------------------------------------

    if (
      !/^[0-9]{10}$/.test(mobile)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10 digit mobile number.",
      });
    }

    // -----------------------------------------------
    // VALIDATE PASSWORD
    // -----------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    // -----------------------------------------------
    // NORMALIZE EMAIL
    // -----------------------------------------------

    const normalizedEmail =
      email.trim().toLowerCase();

    // -----------------------------------------------
    // CHECK EXISTING USER
    // -----------------------------------------------

    const existingUser =
      await User.findOne({
        $or: [
          {
            email:
              normalizedEmail,
          },
          {
            mobile,
          },
        ],
      });

    if (existingUser) {
      if (
        existingUser.email ===
        normalizedEmail
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Email is already registered.",
        });
      }

      if (
        existingUser.mobile ===
        mobile
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Mobile number is already registered.",
        });
      }
    }

    // -----------------------------------------------
    // HASH PASSWORD
    // -----------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // -----------------------------------------------
    // CREATE USER
    // -----------------------------------------------

    const user =
      await User.create({
        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          normalizedEmail,

        mobile,

        password:
          hashedPassword,
      });

    // -----------------------------------------------
    // JWT
    // -----------------------------------------------

    const token =
      generateToken(
        user._id
      );

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",

      token,

      user: {
        id: user._id,
        firstName:
          user.firstName,
        lastName:
          user.lastName,
        email:
          user.email,
        mobile:
          user.mobile,
        role:
          user.role,
      },
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Registration failed.",
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

const login = async (
  req,
  res
) => {
  try {
    const {
      emailOrMobile,
      password,
    } = req.body;

    if (
      !emailOrMobile ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email/mobile and password are required.",
      });
    }

    const value =
      emailOrMobile
        .trim()
        .toLowerCase();

    // -----------------------------------------------
    // FIND USER
    // -----------------------------------------------

    const user =
      await User.findOne({
        $or: [
          {
            email: value,
          },
          {
            mobile:
              emailOrMobile.trim(),
          },
        ],
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email/mobile or password.",
      });
    }

    // -----------------------------------------------
    // ACTIVE CHECK
    // -----------------------------------------------

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive.",
      });
    }

    // -----------------------------------------------
    // PASSWORD CHECK
    // -----------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email/mobile or password.",
      });
    }

    // -----------------------------------------------
    // TOKEN
    // -----------------------------------------------

    const token =
      generateToken(
        user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Login successful.",

      token,

      user: {
        id: user._id,
        firstName:
          user.firstName,
        lastName:
          user.lastName,
        email:
          user.email,
        mobile:
          user.mobile,
        role:
          user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed.",
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword = async (
  req,
  res
) => {
  try {
    const {
      emailOrMobile,
    } = req.body;

    if (!emailOrMobile) {
      return res.status(400).json({
        success: false,
        message:
          "Email or mobile number is required.",
      });
    }

    const value =
      emailOrMobile
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        $or: [
          {
            email: value,
          },
          {
            mobile:
              emailOrMobile.trim(),
          },
        ],
      });

    // Don't reveal whether account exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If the account exists, an OTP has been sent.",
      });
    }

    // -----------------------------------------------
    // GENERATE OTP
    // -----------------------------------------------

    const otp =
      generateOtp();

    // Hash OTP before database storage
    const hashedOtp =
      crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    // 10 minute expiry
    const expires =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );

    user.passwordResetOtp =
      hashedOtp;

    user.passwordResetOtpExpires =
      expires;

    user.passwordResetAttempts = 0;

    await user.save();

    // -----------------------------------------------
    // SEND OTP
    // -----------------------------------------------

    if (user.email) {
      await sendEmailOtp(
        user.email,
        otp
      );
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
      message:
        "If the account exists, an OTP has been sent.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process forgot password request.",
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      emailOrMobile,
      otp,
      newPassword,
    } = req.body;

    if (
      !emailOrMobile ||
      !otp ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email/mobile, OTP and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    const value =
      emailOrMobile
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        $or: [
          {
            email: value,
          },
          {
            mobile:
              emailOrMobile.trim(),
          },
        ],
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid OTP or account.",
      });
    }

    // -----------------------------------------------
    // OTP EXPIRY
    // -----------------------------------------------

    if (
      !user.passwordResetOtp ||
      !user.passwordResetOtpExpires
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP is invalid or expired.",
      });
    }

    if (
      new Date() >
      user.passwordResetOtpExpires
    ) {
      user.passwordResetOtp =
        null;

      user.passwordResetOtpExpires =
        null;

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // -----------------------------------------------
    // OTP CHECK
    // -----------------------------------------------

    const hashedOtp =
      crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    if (
      hashedOtp !==
      user.passwordResetOtp
    ) {
      user.passwordResetAttempts +=
        1;

      await user.save();

      return res.status(400).json({
        success: false,
        message:
          "Invalid OTP.",
      });
    }

    // -----------------------------------------------
    // HASH NEW PASSWORD
    // -----------------------------------------------

    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    // -----------------------------------------------
    // CLEAR OTP
    // -----------------------------------------------

    user.passwordResetOtp =
      null;

    user.passwordResetOtpExpires =
      null;

    user.passwordResetAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password.",
    });
  }
};

// ======================================================
// GET CURRENT USER
// ======================================================

const getMe = async (
  req,
  res
) => {
  try {
    return res.status(200).json({
      success: true,

      user: {
        id: req.user._id,
        firstName:
          req.user.firstName,
        lastName:
          req.user.lastName,
        email:
          req.user.email,
        mobile:
          req.user.mobile,
        role:
          req.user.role,
      },
    });
  } catch (error) {
    console.error(
      "Get me error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch user.",
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};