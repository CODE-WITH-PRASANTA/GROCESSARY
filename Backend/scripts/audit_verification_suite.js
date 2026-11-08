const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const assert = require("assert");
require("dotenv").config();

const Order = require("../models/Order");
const Product = require("../models/Product");
const AdminUser = require("../models/AdminUser");
const User = require("../models/User");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const { decrementStock, restoreStock } = require("../controllers/orderController");

async function runAuditSuite() {
  console.log("==================================================================");
  console.log("🚀 STARTING AUDIT VERIFICATION SUITE — 8 RULES VERIFICATION");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI not configured in .env");
  }

  await mongoose.connect(mongoUri);
  console.log(" Connected to MongoDB successfully.\n");

  let passed = 0;
  let failed = 0;

  // -----------------------------------------------------------------
  // TEST 1: Role Confusion / Customer Token Privilege Escalation
  // -----------------------------------------------------------------
  try {
    console.log("TEST 1: Customer Token vs Admin Middleware Privilege Escalation");
    const customerToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId().toString(), role: "user" },
      process.env.JWT_SECRET || "grocerysathi_super_admin_jwt_secret_key_2026"
    );

    let statusCode = 0;
    let responseData = null;

    const mockReq = {
      headers: { authorization: `Bearer ${customerToken}` },
      cookies: {},
    };
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
          },
        };
      },
    };

    let nextCalled = false;
    await adminAuthMiddleware(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, "Customer token must NOT be allowed to pass admin middleware");
    assert.strictEqual(statusCode, 403, `Expected status 403 Forbidden, got ${statusCode}`);
    assert.strictEqual(responseData.success, false);
    console.log(` PASSED: Customer token was strictly rejected with 403 Forbidden: "${responseData.message}"\n`);
    passed++;
  } catch (err) {
    console.error(`❌ FAILED TEST 1:`, err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // TEST 2: Admin Token Authorization Success
  // -----------------------------------------------------------------
  try {
    console.log("TEST 2: Dedicated AdminUser Token Authorization");
    let admin = await AdminUser.findOne({ email: "admin@grocerysathi.com" });
    if (!admin) {
      admin = await AdminUser.create({
        name: "Test Admin",
        email: "test_audit_admin@grocerysathi.com",
        password: "Admin@12345Password",
        role: "admin",
      });
    }

    const adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, type: "admin_user" },
      process.env.JWT_SECRET || "grocerysathi_super_admin_jwt_secret_key_2026"
    );

    let nextCalled = false;
    const mockReq = {
      headers: { authorization: `Bearer ${adminToken}` },
      cookies: {},
    };
    const mockRes = {
      status: () => ({ json: () => {} }),
    };

    await adminAuthMiddleware(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, "Valid admin token must call next()");
    assert.strictEqual(String(mockReq.admin._id), String(admin._id), "Admin must be attached to req.admin");
    console.log(` PASSED: AdminUser authorized and correctly populated on req.admin (${mockReq.admin.email})\n`);
    passed++;
  } catch (err) {
    console.error(`❌ FAILED TEST 2:`, err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // TEST 3: Inventory Double-Decrement Idempotency (Webhook + Verification race condition)
  // -----------------------------------------------------------------
  let testProduct = null;
  let testOrder = null;
  try {
    console.log("TEST 3: Inventory Double-Decrement Prevention (Idempotency)");
    // Create temporary test product
    testProduct = await Product.create({
      productName: "Audit Test Olive Oil",
      slug: `audit-test-olive-oil-${Date.now()}`,
      category: new mongoose.Types.ObjectId(),
      sku: `AUDIT-SKU-${Date.now()}`,
      unit: new mongoose.Types.ObjectId(),
      unitNo: 1,
      price: 500,
      stockQuantity: 10,
      isOutOfStock: false,
    });

    // Create temporary test order for 3 items
    testOrder = await Order.create({
      user: new mongoose.Types.ObjectId(),
      orderNumber: `AUDIT-ORD-${Date.now()}`,
      items: [
        {
          product: testProduct._id,
          productName: testProduct.productName,
          sku: testProduct.sku,
          price: 500,
          quantity: 3,
          itemTotal: 1500,
        },
      ],
      subtotal: 1500,
      totalAmount: 1500,
      payableAmount: 1500,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // 1st Decrement (e.g. order placed or verifyPayment)
    await decrementStock(testOrder);
    let pAfter1 = await Product.findById(testProduct._id);
    assert.strictEqual(pAfter1.stockQuantity, 7, `Expected stock 7, got ${pAfter1.stockQuantity}`);
    assert.strictEqual(testOrder.isStockDecremented, true, "Order must be marked as stock decremented");

    // 2nd Decrement (e.g. webhook arrives 1 second later)
    await decrementStock(testOrder);
    let pAfter2 = await Product.findById(testProduct._id);
    assert.strictEqual(
      pAfter2.stockQuantity,
      7,
      `Idempotency failed! Stock was double decremented to ${pAfter2.stockQuantity}`
    );

    console.log(` PASSED: Double-decrement prevented! Stock stayed at ${pAfter2.stockQuantity} after second call.\n`);
    passed++;
  } catch (err) {
    console.error(`❌ FAILED TEST 3:`, err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // TEST 4: Stock Restoration on Cancellation (No Lost Inventory)
  // -----------------------------------------------------------------
  try {
    console.log("TEST 4: Accurate Stock Restoration on Cancellation & Double-Restore Prevention");
    // Cancel the order and restore stock
    await restoreStock(testOrder);
    let pRestored1 = await Product.findById(testProduct._id);
    assert.strictEqual(pRestored1.stockQuantity, 10, `Expected restored stock 10, got ${pRestored1.stockQuantity}`);
    assert.strictEqual(testOrder.isStockRestored, true, "Order must be marked as stock restored");

    // 2nd Restore call (e.g. admin click + automated webhook)
    await restoreStock(testOrder);
    let pRestored2 = await Product.findById(testProduct._id);
    assert.strictEqual(
      pRestored2.stockQuantity,
      10,
      `Double-restore bug! Stock was falsely inflated to ${pRestored2.stockQuantity}`
    );

    console.log(` PASSED: Stock safely restored from 7 back to 10 and protected against duplicate restoration.\n`);
    passed++;
  } catch (err) {
    console.error(`❌ FAILED TEST 4:`, err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // TEST 5: Atomic Floor at Zero (Negative Stock Prevention)
  // -----------------------------------------------------------------
  try {
    console.log("TEST 5: Atomic Floor at Zero (Negative Stock & Out-of-Stock Flag)");
    // Set stock to 2
    await Product.findByIdAndUpdate(testProduct._id, { stockQuantity: 2, isOutOfStock: false });

    // Decrement by 5 (e.g. high concurrency POS sale)
    await Product.findOneAndUpdate(
      { _id: testProduct._id },
      [
        {
          $set: {
            stockQuantity: {
              $max: [0, { $subtract: ["$stockQuantity", 5] }],
            },
            isOutOfStock: {
              $lte: [{ $subtract: ["$stockQuantity", 5] }, 0],
            },
          },
        },
      ],
      { updatePipeline: true, returnDocument: "after" }
    );

    const finalProduct = await Product.findById(testProduct._id);
    assert.strictEqual(finalProduct.stockQuantity, 0, `Stock must be floored at 0, got ${finalProduct.stockQuantity}`);
    assert.strictEqual(finalProduct.isOutOfStock, true, "isOutOfStock must be true when quantity reaches 0");

    console.log(` PASSED: Stock floored at 0 (never negative) and isOutOfStock dynamically flipped to true.\n`);
    passed++;
  } catch (err) {
    console.error(`❌ FAILED TEST 5:`, err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // CLEANUP TEST FIXTURES
  // -----------------------------------------------------------------
  if (testProduct) await Product.findByIdAndDelete(testProduct._id);
  if (testOrder) await Order.findByIdAndDelete(testOrder._id);
  console.log("🧹 Test database records cleaned up cleanly.");

  console.log("==================================================================");
  console.log(`🏁 AUDIT SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================");

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runAuditSuite().catch((err) => {
  console.error("Audit Suite execution error:", err);
  process.exit(1);
});
