// controllers/adminReturnController.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const RewardPoints = require("../models/RewardPoints");

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ======================================================
// GET /api/admin/returns
// Query: status, search, startDate, endDate, page, limit
// ======================================================
exports.listReturns = async (req, res) => {
  try {
    const {
      status,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query = { returnStatus: { $ne: "none" } };

    if (status && status !== "All") {
      query.returnStatus = status;
    }

    if (startDate || endDate) {
      query.returnRequestedAt = {};
      if (startDate) query.returnRequestedAt.$gte = new Date(startDate);
      if (endDate) query.returnRequestedAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "deliveryAddress.name": { $regex: search, $options: "i" } },
        { "deliveryAddress.mobile": { $regex: search, $options: "i" } },
        { "items.productName": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name firstName lastName email mobile")
        .populate("returnAssignedTo", "name email")
        .sort({ returnRequestedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    const returns = orders.map((o) => {
      const firstItem = o.items?.[0] || {};
      const qty = (o.items || []).reduce((s, i) => s + toNumber(i.quantity), 0);

      return {
        id: o._id,
        orderId: o._id,
        orderNumber: o.orderNumber || "",

        customer: {
          name:
            o.deliveryAddress?.name ||
            [o.user?.firstName, o.user?.lastName].filter(Boolean).join(" ") ||
            o.user?.name ||
            "Customer",
          phone: o.deliveryAddress?.mobile || o.user?.mobile || "",
          email: o.user?.email || "",
        },

        product: {
          name: firstItem.productName || "Product",
          img: firstItem.image || "",
          sku: firstItem.sku || "",
          price: toNumber(firstItem.price),
        },

        qty,
        reason: o.returnReason || "",
        note: o.returnNote || "",
        requestedAt: o.returnRequestedAt,
        resolvedAt: o.returnResolvedAt || null,
        type: o.returnType || "refund",
        amount: toNumber(o.returnAmount || o.totalAmount),
        status: o.returnStatus,

        assignedTo: o.returnAssignedTo
          ? o.returnAssignedTo.name || o.returnAssignedTo.email
          : "",
        assignedToId: o.returnAssignedTo?._id || null,

        // 👇 these were missing
        address: o.deliveryAddress
          ? [
              o.deliveryAddress.address,
              o.deliveryAddress.landmark,
              o.deliveryAddress.city,
              o.deliveryAddress.state,
              o.deliveryAddress.pincode,
            ]
              .filter(Boolean)
              .join(", ")
          : "",

        pickupDetails: o.pickupDetails || null,
        pickupProof: o.pickupProof || null,
        inspectionReport: o.inspectionReport || null,
      };
    });

    return res.json({
      success: true,
      data: returns,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("listReturns error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load returns." });
  }
};

// ======================================================
// GET /api/admin/returns/summary
// ======================================================
exports.returnsSummary = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRequests,
      pendingApproval,
      approved,
      rejected,
      refundCompleted,
      replacementPending,
      exchangeDone,
      valueAgg,
    ] = await Promise.all([
      Order.countDocuments({ returnStatus: { $ne: "none" } }),
      Order.countDocuments({ returnStatus: "requested" }),
      Order.countDocuments({
        returnStatus: { $in: ["approved", "picked", "inspection"] },
        returnRequestedAt: { $gte: monthStart },
      }),
      Order.countDocuments({
        returnStatus: "rejected",
        returnRequestedAt: { $gte: monthStart },
      }),
      Order.countDocuments({
        returnStatus: "refunded",
        returnResolvedAt: { $gte: monthStart },
      }),
      Order.countDocuments({
        returnStatus: { $in: ["approved", "pickup_scheduled", "picked"] },
        returnType: "replacement",
      }),
      Order.countDocuments({
        returnStatus: "replaced",
        returnResolvedAt: { $gte: monthStart },
      }),
      Order.aggregate([
        {
          $match: {
            returnStatus: { $ne: "none" },
            returnRequestedAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$returnAmount" } } },
      ]),
    ]);

    const totalValue = valueAgg?.[0]?.total || 0;

    return res.json({
      success: true,
      data: {
        totalRequests,
        pendingApproval,
        approved,
        rejected,
        refundCompleted,
        replacementPending,
        exchangeDone,
        totalValue,
      },
    });
  } catch (err) {
    console.error("returnsSummary error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load summary." });
  }
};

// ======================================================
// PUT /api/admin/returns/:orderId/status
// Body: { status, note?, amount?, type? }
// ======================================================
const ALLOWED_ADMIN_STATUSES = [
  "approved",
  "rejected",
  "pickup_scheduled",
  "picked",
  "inspection",
  "refunded",
  "replaced",
];

exports.updateReturnStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note = "", amount, type } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id." });
    }

    if (!ALLOWED_ADMIN_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid return status." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    if (!order.returnStatus || order.returnStatus === "none") {
      return res.status(400).json({
        success: false,
        message: "This order has no return request.",
      });
    }

    const terminalStatuses = ["rejected", "refunded", "replaced"];
    if (terminalStatuses.includes(order.returnStatus)) {
      return res.status(400).json({
        success: false,
        message: `Return is already ${order.returnStatus} and cannot be changed.`,
      });
    }

    order.returnStatus = status;

    if (typeof amount === "number" && amount >= 0) {
      order.returnAmount = amount;
    }
    if (type && ["refund", "replacement", "exchange"].includes(type)) {
      order.returnType = type;
    }

    if (["refunded", "replaced", "rejected"].includes(status)) {
      order.returnResolvedAt = new Date();
    }

    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: `return_${status}`,
      note: note || `Return ${status}`,
    });

    // Refund side-effects
    if (status === "refunded") {
      const refundAmount = toNumber(order.returnAmount || order.totalAmount);

      if (order.walletUsed > 0) {
        const wallet = await Wallet.findOne({ user: order.user });
        if (wallet) {
          wallet.balance += toNumber(order.walletUsed);
          wallet.transactions.unshift({
            type: "refund",
            amount: toNumber(order.walletUsed),
            direction: "credit",
            balanceAfter: wallet.balance,
            reference: order.orderNumber,
            meta: { reason: "Return refunded" },
          });
          await wallet.save();
        }
      }

      if (order.pointsUsed > 0) {
        const points = await RewardPoints.findOne({ user: order.user });
        if (points) {
          points.availablePoints += order.pointsUsed;
          points.totalUsed = Math.max(0, points.totalUsed - order.pointsUsed);
          points.transactions.unshift({
            type: "refund",
            points: order.pointsUsed,
            direction: "credit",
            reference: order.orderNumber,
            note: "Return refund",
          });
          await points.save();
        }
      }

      if (
        order.paymentMethod === "razorpay" &&
        order.paymentStatus === "paid" &&
        order.razorpayPaymentId &&
        refundAmount > 0
      ) {
        try {
          const razorpay = require("../config/razorpay");
          await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(refundAmount * 100),
            notes: {
              reason: "Return refunded",
              orderNumber: order.orderNumber,
            },
          });
          order.paymentStatus = "refunded";
        } catch (refundErr) {
          console.error("Razorpay return refund error:", refundErr);
        }
      }
    }

    await order.save();

    return res.json({
      success: true,
      message: `Return marked as ${status}.`,
      order,
    });
  } catch (err) {
    console.error("updateReturnStatus error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update return." });
  }
};

// ======================================================
// PUT /api/admin/returns/:orderId/assign
// Body: { staffId }
// ======================================================
exports.assignReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { staffId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id." });
    }
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid staff id." });
    }

    const staff = await User.findOne({ _id: staffId, role: "admin" });
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff member not found." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    order.returnAssignedTo = staff._id;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: "return_assigned",
      note: `Assigned to ${staff.name || staff.email}`,
    });

    await order.save();

    return res.json({
      success: true,
      message: "Return assigned.",
      order,
    });
  } catch (err) {
    console.error("assignReturn error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to assign return." });
  }
};

const crypto = require("crypto");

// ======================================================
// PUT /api/admin/returns/:orderId/schedule-pickup
// Body: { scheduledAt, slot, agent, agentPhone, address, instructions }
// ======================================================
exports.schedulePickup = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      scheduledAt,
      slot = "",
      agent = "",
      agentPhone = "",
      address = "",
      instructions = "",
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id." });
    }

    if (!scheduledAt) {
      return res
        .status(400)
        .json({ success: false, message: "Pickup date is required." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    if (["refunded", "replaced", "rejected"].includes(order.returnStatus)) {
      return res.status(400).json({
        success: false,
        message: "This return is already closed.",
      });
    }

    // Generate 4-digit OTP
    const otp = String(crypto.randomInt(1000, 9999));

    order.pickupDetails = {
      scheduledAt: new Date(scheduledAt),
      slot,
      agent,
      agentPhone,
      address: address || order.deliveryAddress?.address || "",
      instructions,
      otp,
      otpVerified: false,
      otpVerifiedAt: null,
    };

    order.returnStatus = "pickup_scheduled";
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: "return_pickup_scheduled",
      note: `Pickup scheduled for ${new Date(scheduledAt).toLocaleString()}`,
    });

    await order.save();

    return res.json({
      success: true,
      message: "Pickup scheduled. OTP sent to user.",
      order,
    });
  } catch (err) {
    console.error("schedulePickup error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule pickup.",
    });
  }
};

// ======================================================
// PUT /api/admin/returns/:orderId/inspection
// Body: { verdict, condition, note }
// ======================================================
exports.submitInspection = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { verdict = "", condition = "", note = "" } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    order.inspectionReport = {
      verdict,
      condition,
      note,
      inspectedAt: new Date(),
    };

    order.returnStatus = "inspection";
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: "return_inspection",
      note: `Inspection: ${verdict || "recorded"}`,
    });

    await order.save();

    return res.json({
      success: true,
      message: "Inspection recorded.",
      order,
    });
  } catch (err) {
    console.error("submitInspection error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to record inspection.",
    });
  }
};
