// controllers/billController.js
const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const Product = require("../models/Product");
const crypto = require("crypto");
const QRCode = require("qrcode");
const upiConfig = require("../config/upi");

// ======================================================
// IN-MEMORY ACTIVE UPI SESSIONS MAP
// ======================================================
const activeUpiSessions = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeUpiSessions.entries()) {
    if (now - session.createdAt > 15 * 60 * 1000) {
      activeUpiSessions.delete(id);
    }
  }
}, 60 * 1000);

// ======================================================
// HELPERS
// ======================================================
const generateInvoiceNumber = () => {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `GS${stamp}${rand}`;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ======================================================
// POST /api/bills
// Create + save a completed sale
// ======================================================
exports.createBill = async (req, res) => {
  try {
    const {
      items,
      customer = {},
      couponCode = "",
      discountType = "amount",
      discountValue = 0,
      discountAmount = 0,
      paymentMethod = "Cash",
      amountReceived = 0,
      upiTransactionId = "",
      upiStatus = "none",
      sessionId = "",
    } = req.body || {};

    // --- validation ---
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Bill must contain at least one item.",
      });
    }

    if (!["Cash", "UPI"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be Cash or UPI.",
      });
    }

    // mobile validation
    const mobile = String(customer.mobile || "").trim();
    if (mobile && !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits.",
      });
    }

    // --- validate items + compute totals from trusted DB prices ---
    const productIds = items.map((i) => i.product).filter(Boolean);

    if (productIds.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "Each item must reference a valid productId.",
      });
    }

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const billItems = [];
    let subtotal = 0;

    for (const line of items) {
      const product = productMap.get(String(line.product));
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${line.product}`,
        });
      }

      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer.",
        });
      }

      if (
        product.stockQuantity != null &&
        Number(product.stockQuantity) < quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}.`,
        });
      }

      // Trust the price the client sent (it may be today's discount)
      const price = toNumber(line.price ?? product.price);
      const originalPrice = toNumber(
        line.originalPrice ?? product.price
      );
      const itemTotal = price * quantity;

      billItems.push({
        product: product._id,
        productName: product.productName || product.name || "Product",
        sku: product.sku || "",
        barcode: product.barcode || "",
        unit: product.unitNo ? String(product.unitNo) : "",
        price,
        originalPrice,
        quantity,
        itemTotal,
        image:
          Array.isArray(product.images) && product.images[0]
            ? String(product.images[0])
            : product.image || "",
      });

      subtotal += itemTotal;
    }

    // --- recalc discount + total server-side ---
    const rawDiscountValue = Math.max(0, toNumber(discountValue));
    let safeDiscount = 0;

    if (discountType === "percentage") {
      safeDiscount = (subtotal * rawDiscountValue) / 100;
    } else {
      safeDiscount = rawDiscountValue;
    }
    safeDiscount = Math.min(safeDiscount, subtotal);

    const totalAmount = Math.max(0, subtotal - safeDiscount);

    // --- payment checks ---
    let amountReceivedNum = toNumber(amountReceived);
    let changeReturned = 0;

    if (paymentMethod === "Cash") {
      if (amountReceivedNum < totalAmount) {
        return res.status(400).json({
          success: false,
          message: `Cash received (₹${amountReceivedNum}) is less than total (₹${totalAmount}).`,
        });
      }
      changeReturned = amountReceivedNum - totalAmount;
    } else if (paymentMethod === "UPI") {
      // For UPI, treat as fully paid
      amountReceivedNum = totalAmount;
      changeReturned = 0;
      if (!upiTransactionId || String(upiTransactionId).trim().length === 0) {
        upiTransactionId = `UPI-${Date.now().toString().slice(-6)}`;
      }
    }

    // --- total savings (info only) ---
    const totalSavings = billItems.reduce(
      (sum, it) =>
        sum +
        Math.max(0, (it.originalPrice || 0) - it.price) * it.quantity,
      0
    );

    // --- create ---
    const invoiceNumber = generateInvoiceNumber();

    const bill = await Bill.create({
      invoiceNumber,
     cashier: req.admin?._id || null, 
      customer: {
        name: String(customer.name || "").trim().slice(0, 60),
        mobile,
      },
      items: billItems,
      subtotal,
      couponCode: String(couponCode || "").trim(),
      discountType,
      discountValue: rawDiscountValue,
      discountAmount: safeDiscount,
      totalAmount,
      totalSavings,
      paymentMethod,
      amountReceived: amountReceivedNum,
      changeReturned,
      upiTransactionId:
        paymentMethod === "UPI" ? String(upiTransactionId).trim() : "",
      upiStatus: paymentMethod === "UPI" ? "paid" : "none",
      status: "completed",
    });

    // Clean up active UPI session if present
    if (sessionId && activeUpiSessions.has(sessionId)) {
      activeUpiSessions.delete(sessionId);
    }
    await Promise.all(
      billItems.map((it) =>
        Product.findOneAndUpdate(
          { _id: it.product },
          [
            {
              $set: {
                stockQuantity: {
                  $max: [0, { $subtract: ["$stockQuantity", Number(it.quantity)] }],
                },
                isOutOfStock: {
                  $lte: [{ $subtract: ["$stockQuantity", Number(it.quantity)] }, 0],
                },
              },
            },
          ],
          { updatePipeline: true, returnDocument: "after" }
        ).catch(() => null)
      )
    );

    return res.status(201).json({
      success: true,
      message: "Bill saved successfully.",
      bill,
    });
  } catch (err) {
    console.error("createBill error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save bill.",
    });
  }
};

// ======================================================
// GET /api/bills
// Admin — list bills with filters
// ======================================================
exports.listBills = async (req, res) => {
  try {
    const {
      search,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query = { status: "completed" };

    if (paymentMethod && ["Cash", "UPI"].includes(paymentMethod)) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.mobile": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bills, total] = await Promise.all([
      Bill.find(query)
        .populate("cashier", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Bill.countDocuments(query),
    ]);

    return res.json({
      success: true,
      bills,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("listBills error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load bills.",
    });
  }
};

// ======================================================
// GET /api/bills/:id
// ======================================================
exports.getBillById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid bill id." });
    }

    const bill = await Bill.findById(req.params.id)
      .populate("cashier", "name email")
      .lean();

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found." });
    }

    return res.json({ success: true, bill });
  } catch (err) {
    console.error("getBillById error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load bill.",
    });
  }
};

// ======================================================
// GET /api/bills/upi-check/:upiTransactionId
// Optional — verify a UPI transaction ID hasn't been used before
// ======================================================
exports.checkUpiTransaction = async (req, res) => {
  try {
    const { upiTransactionId } = req.params;

    if (!upiTransactionId || upiTransactionId.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const existing = await Bill.findOne({
      upiTransactionId,
      status: "completed",
    }).lean();

    return res.json({
      success: true,
      alreadyUsed: !!existing,
    });
  } catch (err) {
    console.error("checkUpiTransaction error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify UPI transaction.",
    });
  }
};



// ======================================================
// POST /api/bills/upi-init
// Body: { amount, invoiceNumber? }
// Returns: { upiLink, qrUrl, vpa, merchantName, amount }
// ======================================================
exports.initUpiPayment = async (req, res) => {
  try {
    const { amount, invoiceNumber = "" } = req.body || {};

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({
        success: false,
        message: "A positive amount is required.",
      });
    }

    const sessionId = `upi_sess_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const upiTransactionId = `UPI-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const vpa = upiConfig.MERCHANT_VPA;
    const name = upiConfig.MERCHANT_NAME;
    const note = invoiceNumber
      ? `Invoice ${invoiceNumber}`
      : `Bill payment`;

    // Build the UPI deep link per NPCI spec
    // Format: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>&tr=<txnId>
    const upiLink = `upi://pay?pa=${encodeURIComponent(
      vpa
    )}&pn=${encodeURIComponent(name)}&am=${amt.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
      note
    )}&tr=${encodeURIComponent(upiTransactionId)}`;

    // Generate QR code — High-resolution Data URL (Instant & Offline) with fallback
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      upiLink
    )}`;
    try {
      qrUrl = await QRCode.toDataURL(upiLink, { width: 320, margin: 2 });
    } catch (qrErr) {
      console.warn("Local QR generation failed, fallback to remote API:", qrErr.message);
    }

    const sessionData = {
      sessionId,
      upiTransactionId,
      upiLink,
      qrUrl,
      vpa,
      merchantName: name,
      amount: amt,
      currency: "INR",
      status: "pending", // "pending" | "completed" | "failed"
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    activeUpiSessions.set(sessionId, sessionData);

    return res.json({
      success: true,
      data: sessionData,
    });
  } catch (err) {
    console.error("initUpiPayment error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate UPI payment link.",
    });
  }
};

// ======================================================
// GET /api/bills/upi-status/:sessionId
// Check status of a UPI session
// ======================================================
exports.getUpiStatus = (req, res) => {
  const { sessionId } = req.params;
  const session = activeUpiSessions.get(sessionId);

  if (!session) {
    return res.json({
      success: true,
      status: "unknown",
      message: "Session not found or expired.",
    });
  }

  // Check if session has expired
  if (session.status === "pending" && Date.now() > session.expiresAt) {
    session.status = "failed";
    session.failureReason = "Payment session expired (5-minute timeout).";
  }

  return res.json({
    success: true,
    status: session.status,
    failureReason: session.failureReason || "",
    upiTransactionId: session.upiTransactionId,
    amount: session.amount,
  });
};

// ======================================================
// POST /api/bills/upi-status
// Update status of a UPI session (completed or failed)
// ======================================================
exports.updateUpiStatus = (req, res) => {
  const { sessionId, status, upiTransactionId, failureReason } = req.body || {};
  const session = activeUpiSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Payment session not found.",
    });
  }

  if (["completed", "failed", "pending"].includes(status)) {
    session.status = status;
    if (upiTransactionId) session.upiTransactionId = String(upiTransactionId);
    if (failureReason) session.failureReason = String(failureReason);
  }

  return res.json({
    success: true,
    data: session,
  });
};

exports.getUpiConfig = (req, res) => {
  return res.json({
    success: true,
    data: {
      vpa: upiConfig.MERCHANT_VPA,
      merchantName: upiConfig.MERCHANT_NAME,
    },
  });
};


// controllers/billController.js
exports.deleteBill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found." });
    }
    return res.json({ success: true, message: "Bill deleted." });
  } catch (err) {
    console.error("deleteBill error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete." });
  }
};