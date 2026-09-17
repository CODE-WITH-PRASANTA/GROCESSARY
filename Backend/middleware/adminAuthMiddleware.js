const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuthMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check HTTP-only cookie
    if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    // Check Authorization header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const admin = await Admin.findById(decoded.id).select(
      "-password"
    );

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    console.error("Admin authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

module.exports = adminAuthMiddleware;