const mongoose = require("mongoose");
const Order = require("../models/Order");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");
const ColdLead = require("../models/ColdLead");
require("../models/Admin");
require("../models/AdminUser");

// ======================================================
// Helper: Safe number
// ======================================================
const toNum = (val, fallback = 0) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

// ======================================================
// Helper: Calculate Date Ranges
// ======================================================
const getDateRange = (range = "all") => {
  const now = new Date();
  let start = null;
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (range.toLowerCase()) {
    case "today": {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      break;
    }
    case "week": {
      // Last 7 days
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "month": {
      // 1st of current month
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    }
    case "year": {
      // 1st of current year
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;
    }
    case "all":
    default: {
      start = new Date(0); // Epoch
      break;
    }
  }

  return { start, end };
};

// ======================================================
// GET /api/admin/dashboard-stats
// ======================================================
const getAdminDashboardStats = async (req, res) => {
  try {
    const range = String(req.query.range || "all").toLowerCase();
    const { start, end } = getDateRange(range);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEnd = new Date(todayStart.getTime() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    // Date filters for queries
    const rangeDateFilter = range === "all" ? {} : { createdAt: { $gte: start, $lte: end } };

    // ==================================================
    // 1. ORDERS REVENUE & COUNTS (Online)
    // ==================================================
    const [
      ordersAgg,
      ordersTodayAgg,
      ordersYesterdayAgg,
      ordersMonthAgg,
      orderStatusCountsAgg,
      recentOrders,
    ] = await Promise.all([
      // Filtered range
      Order.aggregate([
        {
          $match: {
            ...rangeDateFilter,
            orderStatus: { $ne: "cancelled" },
            paymentStatus: { $in: ["paid", "pending"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            paidRevenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
              },
            },
          },
        },
      ]),

      // Today orders
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lte: end },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      // Yesterday orders
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      // This Month orders
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lte: end },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      // Order status counts in selected range
      Order.aggregate([
        { $match: rangeDateFilter },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),

      // Latest 6 online orders
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("user", "name firstName lastName email phone")
        .select(
          "orderNumber totalAmount orderStatus paymentStatus paymentMethod items createdAt user"
        )
        .lean(),
    ]);

    // ==================================================
    // 2. POS BILLS REVENUE & COUNTS (Counter Billing)
    // ==================================================
    const [
      billsAgg,
      billsTodayAgg,
      billsYesterdayAgg,
      billsMonthAgg,
      billsPaymentAgg,
      recentBills,
    ] = await Promise.all([
      // Filtered range
      Bill.aggregate([
        {
          $match: {
            ...rangeDateFilter,
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: { $ifNull: ["$totalAmount", "$grandTotal"] },
            },
            billCount: { $sum: 1 },
          },
        },
      ]),

      // Today bills
      Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lte: end },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: { $ifNull: ["$totalAmount", "$grandTotal"] },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // Yesterday bills
      Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: { $ifNull: ["$totalAmount", "$grandTotal"] },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // Month bills
      Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lte: end },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: { $ifNull: ["$totalAmount", "$grandTotal"] },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // POS Payment method breakdown in range
      Bill.aggregate([
        {
          $match: {
            ...rangeDateFilter,
            status: "completed",
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            revenue: {
              $sum: { $ifNull: ["$totalAmount", "$grandTotal"] },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // Latest 6 POS bills
      Bill.find({ status: "completed" })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("cashier", "name email")
        .select(
          "invoiceNumber totalAmount grandTotal paymentMethod customer cashier items createdAt"
        )
        .lean(),
    ]);

    // ==================================================
    // 3. INVENTORY & PRODUCT HEALTH
    // ==================================================
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      stockValueAgg,
      lowStockProducts,
      outOfStockCount,
      categoriesCount,
      categoriesList,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "inactive" }),

      // Total stock quantity & retail valuation
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStockQuantity: { $sum: "$stockQuantity" },
            totalStockValue: {
              $sum: { $multiply: ["$stockQuantity", "$price"] },
            },
          },
        },
      ]),

      // Products needing restock: stockQuantity <= lowStockAlert (or <= 5)
      Product.find({
        $expr: {
          $and: [
            { $gt: ["$stockQuantity", 0] },
            {
              $lte: [
                "$stockQuantity",
                { $ifNull: ["$lowStockAlert", 5] },
              ],
            },
          ],
        },
      })
        .sort({ stockQuantity: 1 })
        .limit(6)
        .select("productName sku price stockQuantity lowStockAlert images")
        .lean(),

      // Out of stock
      Product.countDocuments({
        $or: [{ stockQuantity: { $lte: 0 } }, { isOutOfStock: true }],
      }),

      Category.countDocuments({}),
      Category.find({}).select("name slug").lean(),
    ]);

    // ==================================================
    // 4. USERS, COLD LEADS & RETURNS
    // ==================================================
    const [
      totalUsers,
      totalColdLeads,
      activeUsers,
      returnsAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      ColdLead.countDocuments({}),
      User.countDocuments({ isActive: { $ne: false } }),

      // Returns in range
      Order.aggregate([
        {
          $match: {
            ...rangeDateFilter,
            returnStatus: { $ne: "none" },
          },
        },
        {
          $group: {
            _id: "$returnStatus",
            count: { $sum: 1 },
            amount: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    // Category distribution (products per category)
    const categoryDistributionAgg = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
          totalStock: { $sum: "$stockQuantity" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      { $sort: { productCount: -1 } },
      { $limit: 6 },
    ]);

    // ==================================================
    // 5. REVENUE TREND (Last 7 or 14 Days)
    // ==================================================
    const trendDays = range === "today" ? 1 : range === "week" ? 7 : range === "month" ? 30 : 14;
    const trendStartDate = new Date(now.getTime() - (trendDays - 1) * 24 * 60 * 60 * 1000);
    trendStartDate.setHours(0, 0, 0, 0);

    const [dailyOrdersAgg, dailyBillsAgg] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: trendStartDate, $lte: end },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Bill.aggregate([
        {
          $match: {
            createdAt: { $gte: trendStartDate, $lte: end },
            status: "completed",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: {
              $sum: { $ifNull: ["$totalAmount", "$grandTotal"] },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Map into continuous date series
    const dateMap = {};
    for (let i = 0; i < trendDays; i++) {
      const d = new Date(trendStartDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      dateMap[key] = {
        dateKey: key,
        label,
        onlineRevenue: 0,
        posRevenue: 0,
        totalRevenue: 0,
        orders: 0,
        bills: 0,
      };
    }

    dailyOrdersAgg.forEach((item) => {
      if (dateMap[item._id]) {
        dateMap[item._id].onlineRevenue = toNum(item.revenue);
        dateMap[item._id].orders = item.count;
      }
    });

    dailyBillsAgg.forEach((item) => {
      if (dateMap[item._id]) {
        dateMap[item._id].posRevenue = toNum(item.revenue);
        dateMap[item._id].bills = item.count;
      }
    });

    const revenueTrend = Object.values(dateMap).map((d) => ({
      ...d,
      totalRevenue: Math.round((d.onlineRevenue + d.posRevenue) * 100) / 100,
    }));

    // ==================================================
    // COMPILE TOTALS & METRICS
    // ==================================================
    const onlineRev = toNum(ordersAgg[0]?.totalRevenue);
    const onlineOrdersCount = toNum(ordersAgg[0]?.orderCount);

    const posRev = toNum(billsAgg[0]?.totalRevenue);
    const posBillsCount = toNum(billsAgg[0]?.billCount);

    const grossRevenue = Math.round((onlineRev + posRev) * 100) / 100;
    const totalTransactions = onlineOrdersCount + posBillsCount;
    const avgOrderValue =
      totalTransactions > 0
        ? Math.round(grossRevenue / totalTransactions)
        : 0;

    const todayRev =
      toNum(ordersTodayAgg[0]?.revenue) + toNum(billsTodayAgg[0]?.revenue);
    const todayOrdersCount =
      toNum(ordersTodayAgg[0]?.count) + toNum(billsTodayAgg[0]?.count);

    const yesterdayRev =
      toNum(ordersYesterdayAgg[0]?.revenue) +
      toNum(billsYesterdayAgg[0]?.revenue);

    const monthRev =
      toNum(ordersMonthAgg[0]?.revenue) + toNum(billsMonthAgg[0]?.revenue);

    // Calculate growth today vs yesterday
    let dailyGrowth = 0;
    if (yesterdayRev > 0) {
      dailyGrowth = Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100);
    } else if (todayRev > 0) {
      dailyGrowth = 100;
    }

    // Status breakdown for Orders
    const statusMap = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };
    orderStatusCountsAgg.forEach((item) => {
      if (item._id && statusMap[item._id] !== undefined) {
        statusMap[item._id] = item.count;
      }
    });

    // Returns breakdown
    let totalReturnsCount = 0;
    let totalReturnsAmount = 0;
    const returnStatusMap = {};
    returnsAgg.forEach((item) => {
      totalReturnsCount += item.count;
      totalReturnsAmount += toNum(item.amount);
      returnStatusMap[item._id] = item.count;
    });

    // Payment method breakdown
    const paymentMethods = [];
    let cashTotal = 0;
    let upiTotal = 0;
    billsPaymentAgg.forEach((bp) => {
      if (bp._id === "Cash") cashTotal += bp.revenue;
      if (bp._id === "UPI") upiTotal += bp.revenue;
    });
    // Add online orders to payment distribution
    paymentMethods.push({
      name: "In-Store UPI",
      amount: Math.round(upiTotal),
      count: billsPaymentAgg.find((b) => b._id === "UPI")?.count || 0,
    });
    paymentMethods.push({
      name: "Cash Counter",
      amount: Math.round(cashTotal),
      count: billsPaymentAgg.find((b) => b._id === "Cash")?.count || 0,
    });
    paymentMethods.push({
      name: "Online Orders",
      amount: Math.round(onlineRev),
      count: onlineOrdersCount,
    });

    // Format recent online orders
    const formattedRecentOrders = recentOrders.map((o) => {
      const custName =
        o.user?.name ||
        [o.user?.firstName, o.user?.lastName].filter(Boolean).join(" ") ||
        "Walk-in / App User";
      return {
        id: o._id,
        orderNumber: o.orderNumber || String(o._id).slice(-8).toUpperCase(),
        customer: custName,
        phone: o.user?.phone || "",
        amount: toNum(o.totalAmount),
        itemsCount: (o.items || []).length,
        status: o.orderStatus || "pending",
        paymentStatus: o.paymentStatus || "pending",
        paymentMethod: o.paymentMethod || "Online",
        date: o.createdAt,
      };
    });

    // Format recent bills
    const formattedRecentBills = recentBills.map((b) => ({
      id: b._id,
      invoiceNumber: b.invoiceNumber || String(b._id).slice(-8).toUpperCase(),
      customer: b.customer?.name || "Walk-in Customer",
      phone: b.customer?.mobile || b.customer?.phone || "",
      cashier: b.cashier?.name || "Counter Cashier",
      amount: toNum(b.totalAmount || b.grandTotal),
      itemsCount: (b.items || []).length,
      paymentMethod: b.paymentMethod || "Cash",
      date: b.createdAt,
    }));

    return res.status(200).json({
      success: true,
      range,
      financials: {
        grossRevenue,
        onlineRevenue: Math.round(onlineRev * 100) / 100,
        posRevenue: Math.round(posRev * 100) / 100,
        totalTransactions,
        onlineOrdersCount,
        posBillsCount,
        avgOrderValue,
        todayRevenue: Math.round(todayRev * 100) / 100,
        todayOrdersCount,
        yesterdayRevenue: Math.round(yesterdayRev * 100) / 100,
        monthRevenue: Math.round(monthRev * 100) / 100,
        dailyGrowth,
      },
      ordersPipeline: {
        total: onlineOrdersCount,
        pending: statusMap.pending,
        processing: statusMap.processing + statusMap.confirmed,
        outForDelivery: statusMap.shipped + statusMap.out_for_delivery,
        delivered: statusMap.delivered,
        cancelled: statusMap.cancelled,
      },
      inventory: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        totalStockUnits: toNum(stockValueAgg[0]?.totalStockQuantity),
        totalStockValue: Math.round(toNum(stockValueAgg[0]?.totalStockValue)),
        outOfStockCount,
        lowStockCount: lowStockProducts.length,
        lowStockItems: lowStockProducts,
        categoriesCount,
      },
      customers: {
        totalUsers,
        activeUsers,
        totalColdLeads,
      },
      returns: {
        totalReturnsCount,
        totalReturnsAmount: Math.round(totalReturnsAmount),
        statusMap: returnStatusMap,
      },
      paymentMethods,
      categoryDistribution: categoryDistributionAgg.map((c) => ({
        id: c._id,
        name: c.cat?.name || "Uncategorized",
        productCount: c.productCount,
        totalStock: c.totalStock,
      })),
      revenueTrend,
      recentActivity: {
        orders: formattedRecentOrders,
        bills: formattedRecentBills,
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate dashboard analytics.",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboardStats,
};
