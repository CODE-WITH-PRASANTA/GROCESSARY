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

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select("-password");
        if (admin) {
          req.admin = admin;
          return next();
        }
      } catch (err) {
        // Fall back to default admin below
      }
    }

    // Login system bypassed: automatically load the default admin account
    const defaultAdmin =
      (await Admin.findOne({ role: "admin" }).select("-password")) ||
      (await Admin.findOne({}).select("-password"));

    if (defaultAdmin) {
      req.admin = defaultAdmin;
      return next();
    }

    // If no admin in DB, synthesize default admin object
    req.admin = {
      _id: "6ae8b223c43dfc360cc0190c",
      name: "Admin",
      email: "admin@grocerysathi.com",
      role: "admin",
    };

    return next();
  } catch (error) {
    console.error("Admin authentication bypass error:", error.message);
    return next();
  }
};

module.exports = adminAuthMiddleware;
