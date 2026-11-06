const User = require("../models/User");
const Order = require("../models/Order");

// ==========================================
// GET ALL USERS (FOR ADMIN)
// GET /api/users or /api/admin/users
// ==========================================
const getAllUsers = async (req, res) => {
  try {
    const { search = "", status = "all", role = "all" } = req.query;

    const query = {};

    // Filter by role
    if (role && role !== "all") {
      query.role = role;
    }

    // Filter by active status
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    // Search query
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { mobile: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ];
    }

    // Total counts for KPI stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Fetch users sorted by newest
    const users = await User.find(query)
      .select("-password -passwordResetOtp -passwordResetOtpExpires")
      .sort({ createdAt: -1 })
      .lean();

    // Attach order statistics to each user
    const userIds = users.map((u) => u._id);
    let orderMap = new Map();

    try {
      const orderAggregates = await Order.aggregate([
        { $match: { user: { $in: userIds } } },
        {
          $group: {
            _id: "$user",
            orderCount: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
            lastOrderDate: { $max: "$createdAt" },
          },
        },
      ]);

      orderAggregates.forEach((agg) => {
        orderMap.set(String(agg._id), {
          orderCount: agg.orderCount || 0,
          totalSpent: agg.totalSpent || 0,
          lastOrderDate: agg.lastOrderDate,
        });
      });
    } catch (aggErr) {
      console.warn("Could not aggregate user orders:", aggErr.message);
    }

    const enrichedUsers = users.map((u) => {
      const stats = orderMap.get(String(u._id)) || {
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: null,
      };
      return {
        ...u,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User",
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        newThisMonth,
      },
      data: enrichedUsers,
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE USER BY ID
// GET /api/users/:id
// ==========================================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -passwordResetOtp -passwordResetOtpExpires")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch user's orders
    let orders = [];
    let stats = { totalOrders: 0, totalSpent: 0 };

    try {
      orders = await Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const orderStats = await Order.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
          },
        },
      ]);
      if (orderStats[0]) {
        stats = orderStats[0];
      }
    } catch (orderErr) {
      console.warn("Could not fetch user orders:", orderErr.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        totalOrders: stats.totalOrders || 0,
        totalSpent: stats.totalSpent || 0,
        recentOrders: orders,
      },
    });
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE USER STATUS (ACTIVE / INACTIVE)
// PATCH /api/users/:id/status
// ==========================================
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (typeof req.body.isActive === "boolean") {
      user.isActive = req.body.isActive;
    } else {
      user.isActive = !user.isActive;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status changed to ${user.isActive ? "Active" : "Inactive"}.`,
      data: {
        id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("toggleUserStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE USER
// PUT /api/users/:id
// ==========================================
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, gender, address, city, state, pincode, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (mobile) user.mobile = mobile.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (state !== undefined) user.state = state.trim();
    if (pincode !== undefined) user.pincode = pincode.trim();
    if (role && ["user", "admin"].includes(role)) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user.toSafeObject(),
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE USER
// DELETE /api/users/:id
// ==========================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUser,
  deleteUser,
};

