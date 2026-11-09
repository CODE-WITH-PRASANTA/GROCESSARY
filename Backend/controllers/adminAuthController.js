const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");
const Admin = require("../models/Admin"); // Legacy fallback if needed

// ======================================================
// HELPER: Generate JWT Token for AdminUser
// ======================================================
const generateAdminToken = (adminUser) => {
  return jwt.sign(
    {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      type: "admin_user",
    },
    process.env.JWT_SECRET || "grocerysathi_super_admin_jwt_secret_key_2026",
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// HELPER: Set HTTP-Only Cookie
// ======================================================
const sendAdminAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

// ======================================================
// HELPER: Auto-Seed Default Admin if No Admin Exists
// ======================================================
const ensureDefaultAdminExists = async () => {
  try {
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      // Check if legacy Admin collection has any record
      const legacyAdmin = await Admin.findOne({});
      if (legacyAdmin) {
        // Sync legacy admin into AdminUser
        const newAdmin = new AdminUser({
          _id: legacyAdmin._id,
          name: legacyAdmin.name || "Admin",
          email: legacyAdmin.email.toLowerCase(),
          password: legacyAdmin.password, // Pre-hashed
          role: legacyAdmin.role || "superadmin",
        });
        // Save directly to bypass double-hashing
        await AdminUser.collection.insertOne(newAdmin);
        console.log(`[AdminAuth] Migrated legacy admin (${legacyAdmin.email}) to AdminUser.`);
      }

      // Also ensure default super admin exists
      const superAdminExists = await AdminUser.findOne({ email: "admin@grocerysathi.com" });
      if (!superAdminExists) {
        const defaultAdmin = new AdminUser({
          name: "Super Admin",
          email: "admin@grocerysathi.com",
          password: "Admin@12345",
          role: "superadmin",
          phone: "9876543210",
        });
        await defaultAdmin.save();
        console.log("[AdminAuth] Seeded default super admin: admin@grocerysathi.com / Admin@12345");
      }
    }
  } catch (err) {
    console.error("[AdminAuth] Error ensuring default admin:", err.message);
  }
};

// Trigger seed check on module load
ensureDefaultAdminExists();

// ======================================================
// @desc    Admin User Login
// @route   POST /api/admin/auth/login or /api/admin-user/login
// @access  Public
// ======================================================
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Ensure at least one admin exists in DB
    await ensureDefaultAdminExists();

    // 1. Check in AdminUser model
    let admin = await AdminUser.findOne({ email: normalizedEmail }).select("+password");

    // 2. If not found in AdminUser, check legacy Admin model
    if (!admin) {
      const legacyAdmin = await Admin.findOne({ email: normalizedEmail }).select("+password");
      if (legacyAdmin) {
        // Test password with legacy
        const matchesLegacy = await bcrypt.compare(password, legacyAdmin.password);
        if (matchesLegacy) {
          // Promote into AdminUser
          admin = await AdminUser.create({
            _id: legacyAdmin._id,
            name: legacyAdmin.name,
            email: legacyAdmin.email,
            password: password, // Will be hashed by pre-save
            role: legacyAdmin.role || "admin",
          });
        }
      }
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your admin account has been deactivated. Please contact the administrator.",
      });
    }

    // Compare password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    // Update lastLogin
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = generateAdminToken(admin);

    // Send HTTP-only cookie
    sendAdminAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone || "",
        avatar: admin.avatar || "",
        permissions: admin.permissions || ["all"],
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("[AdminAuth] Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during login.",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Register a new Admin User
// @route   POST /api/admin/auth/register or /api/admin-user/register
// @access  Public (or Superadmin)
// ======================================================
const adminRegister = async (req, res) => {
  try {
    const { name, email, password, role, phone, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An admin with this email address already exists.",
      });
    }

    // Create new AdminUser
    const newAdmin = await AdminUser.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || "admin",
      phone: phone || "",
      permissions: Array.isArray(permissions) ? permissions : ["all"],
    });

    const token = generateAdminToken(newAdmin);
    sendAdminAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Admin user registered successfully.",
      token,
      admin: {
        id: newAdmin._id,
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        phone: newAdmin.phone,
        avatar: newAdmin.avatar,
        permissions: newAdmin.permissions,
      },
    });
  } catch (error) {
    console.error("[AdminAuth] Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register admin user.",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Get Current Logged-in Admin Profile
// @route   GET /api/admin/auth/me or /api/admin/profile
// @access  Admin Protected
// ======================================================
const getAdminMe = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated as admin.",
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        _id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        phone: req.admin.phone || "",
        avatar: req.admin.avatar || "",
        permissions: req.admin.permissions || ["all"],
        isActive: req.admin.isActive,
        lastLogin: req.admin.lastLogin,
        createdAt: req.admin.createdAt,
      },
    });
  } catch (error) {
    console.error("[AdminAuth] Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve admin profile.",
    });
  }
};

// ======================================================
// @desc    Update Admin Profile
// @route   PUT /api/admin/auth/profile or /api/admin/profile
// @access  Admin Protected
// ======================================================
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    const { name, email, phone, avatar, currentPassword, newPassword } = req.body;

    if (name) admin.name = name.trim();
    if (phone !== undefined) admin.phone = phone.trim();
    if (avatar !== undefined) admin.avatar = avatar;

    if (email && email.trim().toLowerCase() !== admin.email) {
      const emailExists = await AdminUser.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: admin._id },
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another admin.",
        });
      }
      admin.email = email.trim().toLowerCase();
    }

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password.",
        });
      }

      // Check current password with select(+password)
      const adminWithPass = await AdminUser.findById(admin._id).select("+password");
      const isMatch = await adminWithPass.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password does not match.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters.",
        });
      }

      admin.password = newPassword; // Pre-save hook will hash it
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully.",
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error("[AdminAuth] Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update admin profile.",
      error: error.message,
    });
  }
};

// ======================================================
// @desc    Admin Logout
// @route   POST /api/admin/auth/logout or /api/admin-user/logout
// @access  Public
// ======================================================
const adminLogout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully.",
    });
  } catch (error) {
    console.error("[AdminAuth] Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log out admin.",
    });
  }
};

// ======================================================
// @desc    Check Admin Status / Registration Status
// @route   GET /api/admin/auth/status
// @access  Public
// ======================================================
const checkAdminStatus = async (req, res) => {
  try {
    const count = await AdminUser.countDocuments();
    return res.status(200).json({
      success: true,
      isRegistered: count > 0,
      registrationAllowed: true,
      count,
    });
  } catch (error) {
    console.error("[AdminAuth] Check status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify admin status.",
    });
  }
};

module.exports = {
  adminLogin,
  adminRegister,
  getAdminMe,
  updateAdminProfile,
  adminLogout,
  checkAdminStatus,
  ensureDefaultAdminExists,
};

