const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Generate JWT token
const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// Check whether an admin already exists
const checkAdminRegistration = async (req, res) => {
  try {
    const adminExists = await Admin.exists({});

    return res.status(200).json({
      success: true,

      // true means an admin is already registered
      isRegistered: Boolean(adminExists),

      // Registration is allowed only when no admin exists
      registrationAllowed: !adminExists,
    });
  } catch (error) {
    console.error("Check admin registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check admin registration status",
    });
  }
};

// Register the first admin only
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // Prevent registration after the first admin
    const existingAdmin = await Admin.exists({});

    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin registration is already completed",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailAlreadyExists = await Admin.findOne({
      email: normalizedEmail,
    });

    if (emailAlreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Admin email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Register admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin registration failed",
    });
  }
};

// Login admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Explicitly include password if schema has select: false
    const admin = await Admin.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatched = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateAdminToken(admin);

    // Store token in HTTP-only cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",

      // You can remove this token if you only use cookies
      token,

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
};

// Get logged-in admin details
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin profile",
    });
  }
};

// Update admin profile and password
const updateAdminProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      currentPassword,
      newPassword,
    } = req.body;

    // Include password for password comparison
    const admin = await Admin.findById(req.admin._id).select(
      "+password"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether another admin is using this email
    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
      _id: { $ne: admin._id },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use",
      });
    }

    // Update profile details
    admin.name = name.trim();
    admin.email = normalizedEmail;

    // Change password only when password data is provided
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "New password must contain at least 6 characters",
        });
      }

      const passwordMatched = await bcrypt.compare(
        currentPassword,
        admin.password
      );

      if (!passwordMatched) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      admin.password = await bcrypt.hash(newPassword, 12);
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update admin profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update admin profile",
    });
  }
};

// Logout admin
const logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    console.error("Logout admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

module.exports = {
  checkAdminRegistration,
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  logoutAdmin,
};