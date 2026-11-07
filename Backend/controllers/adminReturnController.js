// controllers/adminReturnController.js
const mongoose = require("mongoose");
const crypto = require("crypto");
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
        photos: (o.returnPhotos && o.returnPhotos.length > 0) ? o.returnPhotos : (o.pickupProof?.images || []),
        damagePhotos: (o.returnPhotos && o.returnPhotos.length > 0) ? o.returnPhotos : (o.pickupProof?.images || []),
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

    if (status === "picked" && order.pickupDetails) {
      order.pickupDetails.otpVerified = true;
      order.pickupDetails.otpVerifiedAt = new Date();
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

    const order = await Order.findById(orderId).populate("user", "name email mobile");
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

    const targetAddress =
      address ||
      order.deliveryAddress?.address ||
      (order.deliveryAddress
        ? `${order.deliveryAddress.street || ""} ${order.deliveryAddress.city || ""} ${order.deliveryAddress.pincode || ""}`.trim()
        : "");

    order.pickupDetails = {
      scheduledAt: new Date(scheduledAt),
      slot,
      agent,
      agentPhone,
      address: targetAddress,
      instructions,
      otp,
      otpVerified: false,
      otpVerifiedAt: null,
    };

    order.returnStatus = "pickup_scheduled";
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: "return_pickup_scheduled",
      note: `Pickup scheduled for ${new Date(scheduledAt).toLocaleString()}${slot ? ` (${slot})` : ""}. Agent: ${agent || "Assigned"}`,
    });

    await order.save();

    // Send Email Notification to Customer with Pickup OTP & Schedule Details
    try {
      const customerEmail = order.user?.email || order.deliveryAddress?.email;
      const customerName = order.deliveryAddress?.name || order.user?.name || "Customer";
      const formattedDate = new Date(scheduledAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (customerEmail) {
        const { sendMail } = require("../utils/sendOtp");
        await sendMail({
          to: customerEmail,
          subject: `Return Pickup Scheduled - Order #${order.orderNumber || order._id} [OTP: ${otp}]`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
              <div style="background: #0f2a4a; padding: 22px 24px; text-align: center; color: #ffffff;">
                <h2 style="margin: 0; font-size: 22px; font-weight: 800;">Grocery Sathi</h2>
                <p style="margin: 4px 0 0; font-size: 13.5px; opacity: 0.9;">Return Pickup Scheduled</p>
              </div>
              <div style="padding: 24px;">
                <p style="font-size: 15px; color: #1e293b; margin: 0 0 14px;">Hello <strong>${customerName}</strong>,</p>
                <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 18px;">
                  Your return request for Order <strong>#${order.orderNumber || String(order._id).slice(-8).toUpperCase()}</strong> has been approved and a pickup has been scheduled.
                </p>

                <!-- OTP BOX -->
                <div style="background: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
                  <span style="font-size: 12px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Your Return Pickup OTP</span>
                  <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #047857; font-family: monospace;">
                    ${otp}
                  </div>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #065f46;">
                    🔒 Share this 4-digit OTP with the delivery executive only when they arrive to collect the package.
                  </p>
                </div>

                <!-- PICKUP DETAILS -->
                <div style="background: #f8fafc; border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                  <div style="margin-bottom: 6px;"><strong>Scheduled Date:</strong> ${formattedDate}</div>
                  ${slot ? `<div style="margin-bottom: 6px;"><strong>Time Slot:</strong> ${slot}</div>` : ""}
                  ${agent ? `<div style="margin-bottom: 6px;"><strong>Pickup Agent:</strong> ${agent} ${agentPhone ? `(${agentPhone})` : ""}</div>` : ""}
                  ${targetAddress ? `<div style="margin-bottom: 6px;"><strong>Pickup Address:</strong> ${targetAddress}</div>` : ""}
                  ${instructions ? `<div><strong>Instructions:</strong> ${instructions}</div>` : ""}
                </div>

                <p style="font-size: 13px; color: #64748b; margin: 0;">
                  Once verified and inspected, your refund will be processed promptly.
                </p>
              </div>
            </div>
          `,
        });
      }
    } catch (mailErr) {
      console.warn("Could not send pickup notification email:", mailErr.message);
    }

    return res.json({
      success: true,
      message: `Pickup scheduled successfully! Customer OTP is ${otp}.`,
      order,
    });
  } catch (err) {
    console.error("schedulePickup error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule pickup: " + (err.message || "Unknown error"),
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


// ======================================================
// GET /api/admin/returns/:orderId
// Get full details for an individual return case
// ======================================================
exports.getReturnDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const order = await Order.findById(orderId).populate("user", "name email mobile");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const items = order.items || [];
    const firstItem = items[0] || {};
    const prod = firstItem.product && typeof firstItem.product === "object" ? firstItem.product : {};

    const customerAddress = order.deliveryAddress
      ? `${order.deliveryAddress.street || ""} ${order.deliveryAddress.city || ""} ${order.deliveryAddress.state || ""} ${order.deliveryAddress.pincode || ""}`.trim()
      : "";

    const returnData = {
      id: order._id,
      orderId: order._id,
      orderNumber: order.orderNumber || order._id,
      orderDate: order.createdAt,
      requestedAt: order.returnRequestedAt || order.updatedAt,
      resolvedAt: order.returnResolvedAt || null,
      status: order.returnStatus || "requested",
      type: order.returnType || "refund",
      reason: order.returnReason || "",
      note: order.returnNote || "",
      amount: order.returnAmount || order.payableAmount || order.totalAmount || 0,
      customer: {
        id: order.user?._id,
        name: order.deliveryAddress?.name || order.user?.name || "Customer",
        phone: order.deliveryAddress?.mobile || order.user?.mobile || "",
        email: order.deliveryAddress?.email || order.user?.email || "",
      },
      deliveryAddress: customerAddress || order.deliveryAddress?.address || "",
      pickupAddress: order.pickupDetails?.address || customerAddress || "",
      product: {
        name: firstItem.productName || prod.productName || prod.name || "Grocery Item",
        sku: prod.sku || String(prod._id || firstItem._id || "").slice(-6).toUpperCase(),
        qty: firstItem.quantity || firstItem.qty || 1,
        price: firstItem.price || 0,
        total: firstItem.itemTotal || firstItem.total || 0,
        image: prod.image || firstItem.image || "",
      },
      items: items.map((it) => ({
        name: it.productName || it.name || "Item",
        qty: it.quantity || it.qty || 1,
        price: it.price || 0,
        total: it.itemTotal || it.total || 0,
      })),
      photos:
        order.returnPhotos && order.returnPhotos.length > 0
          ? order.returnPhotos
          : order.pickupProof?.images || [],
      damagePhotos:
        order.returnPhotos && order.returnPhotos.length > 0
          ? order.returnPhotos
          : order.pickupProof?.images || [],
      pickupDetails: order.pickupDetails || null,
      pickupProof: order.pickupProof || null,
      inspectionReport: order.inspectionReport || null,
      statusHistory: order.statusHistory || [],
    };

    return res.json({ success: true, data: returnData });
  } catch (err) {
    console.error("getReturnDetails error:", err);
    return res.status(500).json({ success: false, message: "Failed to load return details." });
  }
};
