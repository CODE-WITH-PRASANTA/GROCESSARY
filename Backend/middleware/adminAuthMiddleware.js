const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const Admin = require("../models/Admin"); // Legacy fallback

const adminAuthMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookies
    if (req.cookies) {
      if (req.cookies.adminToken) {
        token = req.cookies.adminToken;
      } else if (req.cookies.token) {
        token = req.cookies.token;
      }
    }

    // 2. Check Authorization Bearer header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 3. Reject if no token provided
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Admin authorization token is missing. Please log in.",
      });
    }

    // 4. Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "grocerysathi_super_admin_jwt_secret_key_2026"
      );
    } catch (err) {
      console.warn("[AdminAuthMiddleware] Token verification failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid token. Please log in again.",
        error: err.name,
      });
    }

    if (!decoded || !decoded.id) {
      if (decoded && decoded.userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Customer accounts cannot access the admin portal.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Malformed token. Please log in again.",
      });
    }

    // 5. Query AdminUser collection first
    let admin = await AdminUser.findById(decoded.id).select("-password");

    // Fallback to legacy Admin collection if not migrated yet
    if (!admin) {
      admin = await Admin.findById(decoded.id).select("-password");
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin user associated with this token does not exist.",
      });
    }

    if (admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This admin account is currently deactivated.",
      });
    }

    // Attach admin to request object
    req.admin = admin;
    req.adminUser = admin;

    return next();
  } catch (error) {
    console.error("[AdminAuthMiddleware] Critical error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Admin authorization error.",
      error: error.message,
    });
  }
};

module.exports = adminAuthMiddleware;
