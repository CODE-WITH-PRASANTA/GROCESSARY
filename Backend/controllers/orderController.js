// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const crypto = require("crypto");
const DeliveryAddress = require("../models/DeliveryAddress");
const Cart = require("../models/Cart");
const Wallet = require("../models/Wallet");
const RewardPoints = require("../models/RewardPoints");
const TodayDiscount = require("../models/TodayDiscount");
const razorpay = require("../config/razorpay");
const rewards = require("../config/rewards");
const generateOrderNumber = require("../utils/generateOrderNumber");

const pointsController = require("./pointsController");
const referralController = require("./referralController");

// ======================================================
// DECREMENT STOCK (SAFE)
// ======================================================

const decrementStock = async (order) => {
  // Guard against null / malformed input
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return;
  }

  try {
    for (const item of order.items) {
      if (!item.product || !item.quantity) continue;

      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
    }
  } catch (err) {
    console.error("decrementStock error:", err);
  }
};

// ======================================================
// POST /api/orders/place
// Body: {
//   addressId,
//   items: [{ productId, quantity }],
//   useWallet: bool,
//   usePoints: bool,
//   paymentMethod: "razorpay" | "cod"
// }
// ======================================================

const placeOrder = async (req, res) => {
  try {
    const {
      addressId,
      items,
      useWallet = false,
      usePoints = false,
      paymentMethod = "razorpay",
    } = req.body;

    // ------------------------------------------------
    // 1. VALIDATE INPUT
    // ------------------------------------------------

    if (!addressId) {
      return res
        .status(400)
        .json({ success: false, message: "Delivery address is required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items in order." });
    }

    if (!["razorpay", "cod"].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported payment method." });
    }

    // ------------------------------------------------
    // 2. VALIDATE ADDRESS
    // ------------------------------------------------

    const address = await DeliveryAddress.findOne({
      _id: addressId,
      user: req.user._id,
    });

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery address not found." });
    }

    // ------------------------------------------------
    // 3. LOAD PRODUCTS (fresh from DB)
    // ------------------------------------------------

    const productIds = items.map((i) => i.productId);

    const products = await Product.find({ _id: { $in: productIds } }).populate(
      "unit",
      "name symbol",
    );

    if (products.length !== items.length) {
      return res
        .status(400)
        .json({ success: false, message: "Some products no longer exist." });
    }

    // ------------------------------------------------
    // 4. FETCH ACTIVE TODAY DISCOUNTS
    // ------------------------------------------------

    const now = new Date();

    const activeDiscounts = await TodayDiscount.find({
      product: { $in: productIds },
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();

    // Map: productId → discount doc
    const discountMap = new Map();
    for (const d of activeDiscounts) {
      discountMap.set(String(d.product), d);
    }

    // ------------------------------------------------
    // 5. BUILD ORDER ITEMS + VALIDATE STOCK
    // ------------------------------------------------

    const orderItems = [];
    let subtotal = 0;

    for (const line of items) {
      const product = products.find(
        (p) => String(p._id) === String(line.productId),
      );

      if (!product) {
        return res
          .status(400)
          .json({ success: false, message: "Product not found." });
      }

      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid quantity." });
      }

      if (Number(product.stockQuantity) < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} left for ${product.productName}.`,
        });
      }

      // ---- Effective price resolution ----
      // Priority:
      //   1. today discount (if active & lower than price)
      //   2. product.discountPrice (if > 0 and lower than price)
      //   3. product.price
      //   4. product.writtenPrice
      // -------------------------------------

      const basePrice = Number(product.price || 0);

      const productDiscountPrice = Number(product.discountPrice || 0);

      const todayDiscount = discountMap.get(String(product._id));
      const todayDiscountPrice = Number(todayDiscount?.discountPrice || 0);

      let effectivePrice = basePrice;

      // 1. today discount
      if (todayDiscountPrice > 0 && todayDiscountPrice < basePrice) {
        effectivePrice = todayDiscountPrice;
      }
      // 2. product.discountPrice
      else if (productDiscountPrice > 0 && productDiscountPrice < basePrice) {
        effectivePrice = productDiscountPrice;
      }
      // 3. base price
      else if (basePrice > 0) {
        effectivePrice = basePrice;
      }
      // 4. written price fallback
      else if (Number(product.writtenPrice) > 0) {
        effectivePrice = Number(product.writtenPrice);
      }

      const originalPrice = basePrice > 0 ? basePrice : effectivePrice;

      const unitLabel =
        product.unit && typeof product.unit === "object"
          ? `${product.unitNo || ""} ${product.unit.symbol || product.unit.name || ""}`.trim()
          : String(product.unitNo || "");

      const itemTotal = effectivePrice * quantity;

      orderItems.push({
        product: product._id,
        productName: product.productName,
        sku: product.sku || "",
        unit: unitLabel,
        price: effectivePrice,
        originalPrice,
        quantity,
        itemTotal,
        image: product.images?.[0] || "",
      });

      subtotal += itemTotal;
    }

    // ------------------------------------------------
    // 6. DELIVERY + TAX
    // ------------------------------------------------

    const FREE_DELIVERY_THRESHOLD = 199;
    const DELIVERY_CHARGE = 30;

    const deliveryCharge =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

    const taxAmount = 0;
    const totalAmount = subtotal + deliveryCharge + taxAmount;

    // ------------------------------------------------
    // 7. APPLY WALLET
    // ------------------------------------------------

    let walletUsed = 0;
    let walletDoc = null;

    if (useWallet) {
      walletDoc = await Wallet.findOne({ user: req.user._id });

      if (walletDoc && walletDoc.balance > 0) {
        const maxWallet = Math.min(
          walletDoc.balance,
          totalAmount * rewards.MAX_WALLET_USE_PERCENT,
        );
        walletUsed = Math.floor(maxWallet * 100) / 100;
      }
    }

    // ------------------------------------------------
    // 8. APPLY POINTS
    // ------------------------------------------------

    let pointsUsed = 0;
    let pointsValue = 0;
    let pointsDoc = null;

    if (usePoints) {
      pointsDoc = await RewardPoints.findOne({ user: req.user._id });

      if (pointsDoc && pointsDoc.availablePoints > 0) {
        const maxRedeemablePoints = Math.floor(
          (totalAmount * rewards.MAX_POINTS_REDEEM_PERCENT) /
            rewards.POINTS_REDEEM_RATE,
        );
        const usable = Math.min(pointsDoc.availablePoints, maxRedeemablePoints);

        if (usable >= rewards.MIN_POINTS_TO_REDEEM) {
          pointsUsed = usable;
          pointsValue = pointsUsed * rewards.POINTS_REDEEM_RATE;
        }
      }
    }

    // ------------------------------------------------
    // 9. FINAL PAYABLE
    // ------------------------------------------------

    const payableAmount = Math.max(0, totalAmount - walletUsed - pointsValue);

    // ------------------------------------------------
    // 10. CREATE ORDER
    // ------------------------------------------------

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      subtotal,
      deliveryCharge,
      taxAmount,
      totalAmount,
      walletUsed,
      pointsUsed,
      pointsValue,
      payableAmount,
      paymentMethod,
      paymentStatus: "pending",
      deliveryAddress: {
        name: address.name,
        mobile: address.mobile,
        address: address.address,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        addressType: address.addressType,
      },
      orderStatus: "pending",
      statusHistory: [{ status: "pending", note: "Order created" }],
    });

    // ------------------------------------------------
    // 11. DEBIT WALLET (only after order is saved)
    // ------------------------------------------------

    if (walletUsed > 0 && walletDoc) {
      walletDoc.balance -= walletUsed;
      walletDoc.transactions.unshift({
        type: "order_payment",
        amount: walletUsed,
        direction: "debit",
        balanceAfter: walletDoc.balance,
        reference: order.orderNumber,
        status: "success",
      });
      await walletDoc.save();
    }

    // ------------------------------------------------
    // 12. DEBIT POINTS
    // ------------------------------------------------

    if (pointsUsed > 0 && pointsDoc) {
      pointsDoc.availablePoints -= pointsUsed;
      pointsDoc.totalUsed += pointsUsed;
      pointsDoc.transactions.unshift({
        type: "redeemed_order",
        points: pointsUsed,
        direction: "debit",
        reference: order.orderNumber,
      });
      await pointsDoc.save();
    }

    // ------------------------------------------------
    // 13. COD → CONFIRM IMMEDIATELY + DECREMENT STOCK
    // ------------------------------------------------

    if (paymentMethod === "cod") {
      order.paymentStatus = "pending"; // paid on delivery
      order.orderStatus = "confirmed";
      order.statusHistory.push({
        status: "confirmed",
        note: "COD order confirmed",
      });
      await order.save();

      // Reserve stock at confirmation time
      await decrementStock(order);

      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } },
      );

      return res.status(201).json({
        success: true,
        message: "COD order placed successfully.",
        order,
        requiresPayment: false,
      });
    }

    // ------------------------------------------------
    // 14. RAZORPAY
    // ------------------------------------------------

    if (paymentMethod === "razorpay") {
      // Fully covered by wallet + points
      if (payableAmount <= 0) {
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.statusHistory.push({
          status: "confirmed",
          note: "Paid fully via wallet + points",
        });
        await order.save();

        // Reserve stock — order is effectively paid
        await decrementStock(order);

        await Cart.findOneAndUpdate(
          { user: req.user._id },
          { $set: { items: [] } },
        );

        return res.status(201).json({
          success: true,
          message: "Order placed using wallet and points.",
          order,
          requiresPayment: false,
        });
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(payableAmount * 100), // paise
        currency: "INR",
        receipt: order.orderNumber,
        notes: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          userId: String(req.user._id),
        },
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        message: "Order created. Complete payment to confirm.",
        order,
        requiresPayment: true,
        razorpay: {
          key: process.env.RAZORPAY_KEY_ID,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Grocery Sathi",
          description: `Order ${order.orderNumber}`,
          prefill: {
            name: address.name,
            contact: address.mobile,
            email: req.user.email || "",
          },
        },
      });
    }
  } catch (err) {
    console.error("placeOrder error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to place order." });
  }
};

// ======================================================
// POST /api/orders/verify
// Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
// ======================================================

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment details missing." });
    }

    // ------------------------------------------------
    // 1. VERIFY SIGNATURE
    // ------------------------------------------------

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature." });
    }

    // ------------------------------------------------
    // 2. FIND ORDER
    // ------------------------------------------------

    const order = await Order.findOne({
      razorpayOrderId,
      user: req.user._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // ------------------------------------------------
    // 3. IDEMPOTENCY — check BOTH flags
    // ------------------------------------------------

    if (
      order.paymentStatus === "paid" ||
      order.processedPaymentIds.includes(razorpayPaymentId)
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        order,
      });
    }

    // ------------------------------------------------
    // 4. MARK AS PAID
    // ------------------------------------------------

    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.orderStatus = "confirmed";
    order.statusHistory.push({
      status: "confirmed",
      note: "Payment verified",
    });
    order.processedPaymentIds.push(razorpayPaymentId);

    await order.save();

    // Reserve stock — order is now paid
    await decrementStock(order);

    // ------------------------------------------------
    // 5. CLEAR CART
    // ------------------------------------------------

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed.",
      order,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify payment." });
  }
};

// ======================================================
// POST /api/orders/webhook   (raw body — not JSON-parsed)
// ======================================================

const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const receivedSignature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    if (receivedSignature !== expectedSignature) {
      console.warn("Webhook signature mismatch");
      return res.status(400).json({ success: false });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // ==================================================
    // payment.captured
    // ==================================================

    if (event === "payment.captured") {
      const payment = payload?.payment?.entity;
      if (!payment) {
        return res.status(200).json({ received: true });
      }

      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      const order = await Order.findOne({ razorpayOrderId });

      // Guard — do nothing if order isn't ours
      if (!order) {
        return res.status(200).json({ received: true });
      }

      // Idempotency — don't process twice
      if (
        order.paymentStatus === "paid" ||
        order.processedPaymentIds.includes(razorpayPaymentId)
      ) {
        return res.status(200).json({ received: true });
      }

      order.paymentStatus = "paid";
      order.razorpayPaymentId = razorpayPaymentId;
      order.orderStatus = "confirmed";
      order.statusHistory.push({
        status: "confirmed",
        note: "Confirmed via webhook",
      });
      order.processedPaymentIds.push(razorpayPaymentId);

      await order.save();

      // Reserve stock — safe after successful order update
      await decrementStock(order);

      await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [] } },
      );
    }

    // ==================================================
    // payment.failed
    // ==================================================

    if (event === "payment.failed") {
      const payment = payload?.payment?.entity;
      if (!payment) {
        return res.status(200).json({ received: true });
      }

      const razorpayOrderId = payment.order_id;

      const order = await Order.findOne({ razorpayOrderId });

      if (order && order.paymentStatus === "pending") {
        order.paymentStatus = "failed";
        order.statusHistory.push({
          status: "pending",
          note: "Payment failed",
        });
        await order.save();

        // Refund wallet + points
        await refundWalletAndPoints(order, "Payment failed");
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("razorpayWebhook error:", err);
    return res.status(500).json({ success: false });
  }
};

// ======================================================
// REFUND WALLET + POINTS
// ======================================================

const refundWalletAndPoints = async (order, reason = "") => {
  try {
    if (!order) return;

    if (order.walletUsed > 0) {
      const wallet = await Wallet.findOne({ user: order.user });
      if (wallet) {
        wallet.balance += order.walletUsed;
        wallet.transactions.unshift({
          type: "refund",
          amount: order.walletUsed,
          direction: "credit",
          balanceAfter: wallet.balance,
          reference: order.orderNumber,
          meta: { reason },
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
          type: "admin_adjust",
          points: order.pointsUsed,
          direction: "credit",
          reference: order.orderNumber,
          note: `Refund: ${reason}`,
        });
        await points.save();
      }
    }
  } catch (err) {
    console.error("refundWalletAndPoints error:", err);
  }
};

// ======================================================
// PUT /api/orders/:id/status
// Body: { status, note }
// ======================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = "" } = req.body;

    const allowed = [
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const prevStatus = order.orderStatus;

    order.orderStatus = status;
    order.statusHistory.push({ status, note });

    // ------------------------------------------------
    // CANCEL / REFUND → refund wallet, points, and Razorpay
    // ------------------------------------------------

    if (status === "cancelled" || status === "refunded") {
      // Refund wallet + points
      await refundWalletAndPoints(order, `Order ${status}`);

      // Refund Razorpay if this was a paid razorpay order
      if (
        order.paymentMethod === "razorpay" &&
        order.paymentStatus === "paid" &&
        order.razorpayPaymentId
      ) {
        try {
          await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(order.payableAmount * 100),
            notes: {
              reason: `Order ${status}`,
              orderNumber: order.orderNumber,
            },
          });

          order.paymentStatus = "refunded";
          order.statusHistory.push({
            status,
            note: "Razorpay refund issued",
          });
        } catch (refundErr) {
          console.error("Razorpay refund error:", refundErr);
          // Log but don't fail the whole request
        }
      }
    }

    await order.save();

    // ------------------------------------------------
    // DELIVERED → award points + referral reward
    // ------------------------------------------------

    if (status === "delivered" && prevStatus !== "delivered") {
      // 1) Award points (5% of totalAmount)
      const earnedPoints = Math.floor(
        order.totalAmount * rewards.POINTS_EARN_RATE,
      );

      if (earnedPoints > 0) {
        await pointsController.creditPoints(
          order.user,
          earnedPoints,
          "earned_order",
          order.orderNumber,
        );
      }

      // 2) If FIRST delivered order, trigger referral reward
      const deliveredCount = await Order.countDocuments({
        user: order.user,
        orderStatus: "delivered",
      });

      if (deliveredCount === 1) {
        await referralController.rewardReferrerOnFirstOrder(
          order.user,
          order._id,
        );
      }

      // 3) COD → mark as paid
      if (order.paymentMethod === "cod" && order.paymentStatus === "pending") {
        order.paymentStatus = "paid";
        await order.save();
      }
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update status." });
  }
};

// ======================================================
// GET /api/orders/my
// ======================================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load orders." });
  }
};

// ======================================================
// GET /api/orders/:id
// ======================================================

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("getOrderById error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load order." });
  }
};

// ======================================================
// POST /api/orders/:id/abandon
// ======================================================

const abandonOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      paymentStatus: "pending",
      paymentMethod: "razorpay",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or already handled.",
      });
    }

    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      note: "Payment not completed",
    });
    await order.save();

    // Refund wallet + points
    await refundWalletAndPoints(order, "Payment cancelled");

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("abandonOrder error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to abandon order." });
  }
};



// ======================================================
// GET /api/orders  (ADMIN ONLY)
// ======================================================

const getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "deliveryAddress.name": { $regex: search, $options: "i" } },
        { "deliveryAddress.mobile": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "firstName lastName email mobile")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load orders." });
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  placeOrder,
  verifyPayment,
  razorpayWebhook,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
  refundWalletAndPoints,
  abandonOrder,
  getAllOrders
};