const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");

// ======================================================
// Helper: return a plain number or 0
// ======================================================
const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ======================================================
// GET /api/dashboard/summary
// ======================================================
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, totalOrders, recentOrders, wishlistCount] = await Promise.all([
        User.findById(userId).select(
          "name firstName lastName email walletBalance",
        ),
        Order.countDocuments({ user: userId }),
        Order.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select(
            "orderNumber items totalAmount orderStatus createdAt statusHistory",
          )
          .lean(),
        Wishlist.countDocuments({ user: userId }),
      ]);

    const formattedOrders = recentOrders.map((o) => {
      const firstItem = o.items?.[0] || {};
      const totalQty = (o.items || []).reduce(
        (sum, i) => sum + toNumber(i.quantity),
        0,
      );

      return {
        id: o._id,
        orderNumber: o.orderNumber || "",
        name: firstItem.productName || "Order",
        image: firstItem.image || "",
        price: toNumber(o.totalAmount),
        qty: totalQty,
        date: o.createdAt,
        status: o.orderStatus || "pending",
      };
    });

    return res.json({
      success: true,
      data: {
        user: {
          name:
            user?.name ||
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            "User",
          email: user?.email || "",
          walletBalance: toNumber(user?.walletBalance),
        },
        stats: {
          totalOrders,
          walletBalance: toNumber(user?.walletBalance),
          coupons: 0,
          wishlist: wishlistCount,
        },
        recentOrders: formattedOrders,
      },
    });
  } catch (err) {
    console.error("getSummary error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary.",
    });
  }
};

// ======================================================
// GET /api/dashboard/categories
// Group user's past orders by item category
// ======================================================
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Order.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          orderStatus: { $nin: ["cancelled", "refunded"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "purchasedProduct",
        },
      },
      {
        $unwind: {
          path: "$purchasedProduct",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "purchasedProduct.category",
          foreignField: "_id",
          as: "purchasedCategory",
        },
      },
      {
        $unwind: {
          path: "$purchasedCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$purchasedCategory.name", "Other"] },
          totalSpent: {
            $sum: {
              $multiply: [
                { $ifNull: ["$items.price", 0] },
                { $ifNull: ["$items.quantity", 0] },
              ],
            },
          },
          image: { $first: "$items.image" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 },
    ]);

    const grandTotal =
      result.reduce((sum, r) => sum + toNumber(r.totalSpent), 0) || 1;

    const categories = result.map((r) => ({
      name: r._id || "Other",
      totalSpent: toNumber(r.totalSpent),
      image: r.image || "",
      percentage: Math.round((toNumber(r.totalSpent) / grandTotal) * 100),
    }));

    return res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.error("getCategories error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load category breakdown.",
    });
  }
};

// ======================================================
// GET /api/dashboard/spending?range=this_month|last_month|last_3_months
// ======================================================
exports.getSpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const range = String(req.query.range || "this_month").toLowerCase();

    const now = new Date();
    let startDate;
    let groupFormat = "%d %b";
    let sortKey = "_id";

    switch (range) {
      case "last_month": {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        req._endDate = endDate;
        break;
      }
      case "last_3_months": {
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        groupFormat = "%b";
        break;
      }
      case "this_month":
      default: {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      }
    }

    const matchStage = {
      user: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: startDate },
      orderStatus: { $nin: ["cancelled", "refunded"] },
    };

    if (range === "last_month") {
      matchStage.createdAt.$lt = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          amount: { $sum: "$totalAmount" },
          sortDate: { $min: "$createdAt" },
        },
      },
      { $sort: { sortDate: 1 } },
    ];

    const rows = await Order.aggregate(pipeline);

    const total = rows.reduce((sum, r) => sum + toNumber(r.amount), 0);

    const points = rows.map((r) => ({
      date: r._id,
      amount: toNumber(r.amount),
    }));

    return res.json({
      success: true,
      data: {
        total,
        points,
        range,
      },
    });
  } catch (err) {
    console.error("getSpending error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load spending data.",
    });
  }
};

// ======================================================
// GET /api/dashboard/recommended
// ======================================================
exports.getRecommended = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Categories the user has bought most
    const topCategoriesAgg = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "purchasedProduct",
        },
      },
      { $unwind: "$purchasedProduct" },
      {
        $group: {
          _id: "$purchasedProduct.category",
          count: { $sum: "$items.quantity" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    const topCategories = topCategoriesAgg.map((c) => c._id).filter(Boolean);

    // 2. Product IDs the user already bought — exclude from recommendations
    const boughtProductIds = await Order.distinct("items.product", {
      user: userId,
    });

    // 3. Build query
    const query = { status: "active" };
    if (topCategories.length > 0) {
      query.category = { $in: topCategories };
    }
    if (boughtProductIds.length > 0) {
      query._id = { $nin: boughtProductIds };
    }

    let products = await Product.find(query)
      .populate("unit", "name symbol")
      .sort({ rating: -1, createdAt: -1 })
      .limit(8)
      .lean();

    // 4. Fallback: if too few, top-rated overall
    if (products.length < 4) {
      products = await Product.find({ status: "active" })
        .populate("unit", "name symbol")
        .sort({ rating: -1, createdAt: -1 })
        .limit(8)
        .lean();
    }

    return res.json({
      success: true,
      data: products.map((p) => ({
        id: p._id,
        name: p.productName || p.name || "Product",
        unit:
          [p.unitNo, p.unit?.symbol || p.unit?.name].filter(Boolean).join(" ") ||
          "1 unit",
        price: toNumber(p.discountPrice || p.sellingPrice || p.price),
        image:
          Array.isArray(p.images) && p.images[0] ? p.images[0] : p.image || "",
      })),
    });
  } catch (err) {
    console.error("getRecommended error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load recommendations.",
    });
  }
};

// ======================================================
// GET /api/dashboard/offers
// ======================================================
exports.getOffers = async (req, res) => {
  return res.json({ success: true, data: [] });
};
