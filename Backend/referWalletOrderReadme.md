# Grocery Sathi — Wallet, Points, Referral, Orders & Payments System

## Complete Architecture & Implementation Guide

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Backend Folder Structure](#3-backend-folder-structure)
- [4. Why Each File Exists](#4-why-each-file-exists)
- [5. Database Models](#5-database-models)
- [6. Business Logic & Rules](#6-business-logic--rules)
- [7. API Endpoints Reference](#7-api-endpoints-reference)
- [8. Complete User Workflows](#8-complete-user-workflows)
- [9. Frontend Integration](#9-frontend-integration)
- [10. Payment Gateway Flow](#10-payment-gateway-flow)
- [11. Setup & Deployment](#11-setup--deployment)
- [12. Testing Guide](#12-testing-guide)
- [Appendix A — Environment Variables](#appendix-a--environment-variables)
- [Appendix B — Common Errors & Fixes](#appendix-b--common-errors--fixes)
- [Appendix C — File Creation Order](#appendix-c--file-creation-order)
- [Summary](#summary)

---

## 1. Project Overview

### What We're Building
A complete e-commerce rewards ecosystem for Grocery Sathi with:

### System Purpose
- Wallet: Real money (₹) users can top-up, spend at checkout, or withdraw
- Reward Points: Loyalty currency earned on orders, convertible to ₹
- Referrals: Users earn rewards when friends join and place first order
- Orders: Product purchase lifecycle with status tracking
- Payments: Razorpay integration for online payments + COD

### Why These Systems Connect


User signs up with referral code
↓
Friend gets welcome bonus (₹20 + 100 pts)
↓
Referrer gets rewarded when friend's first order is delivered (₹30 + 50 pts)
↓
User places orders → earns 5% of order value as points
↓
Points can be redeemed at checkout (1 pt = ₹0.25)
↓
Wallet balance can be used at checkout (up to 50% of order)
↓
User can withdraw wallet balance to bank
```

---

## 2. System Architecture

### High-Level Flow

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                            │
│ ┌────────────┐ ┌─────────────┐ ┌──────────┐ ┌────────┐    │
│ │ Cart.jsx   │ │ Wallet      │ │ Refer    │ │ Orders│    │
│ │ + Checkout │ │ Points.jsx  │ │ Earn.jsx │ │ Page  │    │
│ └────────────┘ └─────────────┘ └──────────┘ └────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Node + Express)                                    │
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│ │ Controllers │→ │ Business     │→ │ Mongoose Models      │ │
│ │             │   │ Logic        │   │                      │ │
│ └─────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│ MongoDB Database                                            │
│ users · wallets · rewardpoints · referrals · orders         │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│ Razorpay Gateway                                            │
│ Orders API · Payments API · Webhooks                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Folder Structure


backend/
│
├── config/
│   ├── db.js                  # MongoDB connection
│   ├── rewards.js            # Business constants (₹30, 5%, etc.)
│   └── razorpay.js           # Razorpay SDK instance
│
├── middleware/
│   ├── authMiddleware.js     # JWT verification (protect)
│   └── adminMiddleware.js    # Admin-only routes
│
├── models/
│   ├── User.js               # + referralCode, referredBy
│   ├── Product.js            # Existing
│   ├── Category.js           # Existing
│   ├── Brand.js              # Existing
│   ├── Unit.js               # Existing
│   ├── TodayDiscount.js      # Active discounts
│   ├── Cart.js               # Existing
│   ├── Wishlist.js           # Existing
│   ├── DeliveryAddress.js    # Existing
│   ├── Wallet.js             # NEW — money ledger
│   ├── RewardPoints.js       # NEW — points ledger
│   ├── Referral.js           # NEW — referral tracking
│   └── Order.js              # NEW — order records
│
├── controllers/
│   ├── authController.js     # Register, login, SSO
│   ├── productController.js  # CRUD products
│   ├── cartController.js      # Cart operations
│   ├── wishlistController.js # Wishlist operations
│   ├── deliveryAddressController.js # Address operations
│   ├── todayDiscountController.js # Active discounts
│   ├── walletController.js    # NEW — wallet ops
│   ├── pointsController.js    # NEW — points ops
│   ├── referralController.js  # NEW — referral logic
│   ├── checkoutController.js  # NEW — checkout preview
│   └── orderController.js     # NEW — order + payments
│
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── userRoutes.js          # /api/users/*
│   ├── productRoutes.js       # /api/products/*
│   ├── categoryRoutes.js      # /api/categories/*
│   ├── brandRoutes.js         # /api/brands/*
│   ├── unitRoutes.js          # /api/units/*
│   ├── todayDiscountRoutes.js # /api/today-discounts/*
│   ├── cartRoutes.js          # /api/cart/*
│   ├── wishlistRoutes.js      # /api/wishlist/*
│   ├── deliveryAddressRoutes.js # /api/delivery-address/*
│   ├── walletRoutes.js        # NEW — /api/wallet/*
│   ├── pointsRoutes.js        # NEW — /api/points/*
│   ├── referralRoutes.js      # NEW — /api/referrals/*
│   ├── checkoutRoutes.js      # NEW — /api/checkout/*
│   └── orderRoutes.js         # NEW — /api/orders/*
│
├── utils/
│   ├── generateReferralCode.js # NEW — 8-char unique code
│   └── generateOrderNumber.js   # NEW — ORD12345678A1B2
│
├── scripts/
│   └── backfillReferralCodes.js # NEW — one-time migration
│
├── .env                 # Secrets (never commit)
├── server.js            # Express app + route mounting
└── package.json
```

---

## 4. Why Each File Exists

### `config/rewards.js`
Why: Centralizes every business rule. Change ₹30 bonus → ₹50 in one place, not in 15 files.

```js
module.exports = {
  REFERRER_WALLET_BONUS: 30,
  REFERRER_POINTS_BONUS: 50,
  FRIEND_WALLET_BONUS: 20,
  FRIEND_POINTS_BONUS: 100,
  POINTS_EARN_RATE: 0.05, // 5% of order
  POINTS_REDEEM_RATE: 0.25, // 1 pt = ₹0.25
  MAX_POINTS_REDEEM_PERCENT: 0.20,
  MIN_POINTS_TO_REDEEM: 100,
  MAX_WALLET_USE_PERCENT: 0.50,
  MIN_WALLET_BALANCE_TO_WITHDRAW: 100,
};
```

### `config/razorpay.js`
Why: One-time SDK initialization. Every controller imports from here instead of re-initializing.

```js
const Razorpay = require("razorpay");
module.exports = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
```

### `utils/generateReferralCode.js`
Why: Every user needs a unique short code. Uses their name + random hex.

Example:


Arjun Kumar → ARJU9F3B2A
```

Collision handled by loop in controller.

### `utils/generateOrderNumber.js`
Why: Orders need human-readable IDs for support tickets.


ORD1758432105A1B2
```

### `scripts/backfillReferralCodes.js`
Why: When you add referralCode to the User model, existing users don't have one. Run once.

### Model Summary

| Model | Why It Exists |
| --- | --- |
| Wallet | Stores ₹ balance + full transaction ledger (audit trail) |
| RewardPoints | Stores points balance + full transaction ledger |
| Referral | Links referrer↔referred, tracks status + reward |
| Order | Complete order record incl. payment info, addresses, status history |

### Controller Summary

| Controller | Responsibility |
| --- | --- |
| walletController | Get balance, add money, withdraw, convert points |
| pointsController | Get balance, credit/debit (internal helpers) |
| referralController | Apply code, reward referrer, list referrals, get link |
| checkoutController | Preview wallet+points applied to cart |
| orderController | Place order, verify payment, webhook, status updates |

### Route Note
Each route file maps HTTP verbs + paths to controller functions. One route file per domain keeps server.js clean.

---

## 5. Database Models

### Wallet Model

```js
{
  user: ObjectId (ref: User, unique),
  balance: Number (min: 0),
  currency: String (default: "INR"),
  transactions: [{
    type: enum[add_money, order_payment, refund, referral_bonus,
    cashback, withdrawal, admin_credit, admin_debit, points_conversion],
    amount: Number,
    direction: enum[credit, debit],
    balanceAfter: Number, // snapshot — helps audit
    reference: String, // order ID / method
    status: enum[pending, success, failed],
    createdAt: Date
  }]
}
```

> Why `balanceAfter`: If a bug ever miscalculates a balance, you can replay the ledger to find where it broke.

### RewardPoints Model

```js
{
  user: ObjectId (unique),
  availablePoints: Number,
  totalEarned: Number,
  totalUsed: Number,
  transactions: [{
    type: enum[earned_order, earned_referral, earned_welcome,
    redeemed_order, redeemed_wallet, expired, admin_adjust],
    points: Number,
    direction: enum[credit, debit],
    reference: String,
    note: String,
    createdAt: Date
  }]
}
```

### Referral Model

```js
{
  referrer: ObjectId (ref: User),
  referred: ObjectId (ref: User, unique), // one user can be referred once
  referralCode: String,
  status: enum[pending, completed, expired, cancelled],
  joinedAt: Date,
  firstOrderAt: Date,
  firstOrderId: ObjectId,
  rewardAmount: Number, // ₹ to referrer
  rewardPoints: Number, // pts to referrer
  friendRewardAmount: Number, // ₹ to friend
  friendRewardPoints: Number,
  rewarded: Boolean
}
```

### Order Model

```js
{
  user: ObjectId,
  orderNumber: String (unique),
  items: [{
    product: ObjectId,
    productName: String, // snapshot at time of order
    price: Number, // snapshot
    quantity: Number,
    itemTotal: Number,
    unit: String // "250 g"
  }],
  subtotal: Number,
  deliveryCharge: Number,
  taxAmount: Number,
  totalAmount: Number,
  walletUsed: Number,
  pointsUsed: Number,
  pointsValue: Number,
  payableAmount: Number, // what Razorpay charges
  paymentMethod: enum[razorpay, cod, wallet],
  paymentStatus: enum[pending, paid, failed, refunded],
  razorpayOrderId: String,
  razorpayPaymentId: String,
  deliveryAddress: Object (snapshot),
  orderStatus: enum[pending, confirmed, processing, shipped,
  out_for_delivery, delivered, cancelled, refunded],
  statusHistory: [{ status, note, at }],
  processedPaymentIds: [String] // idempotency
}
```

> Why snapshot prices/addresses: If a product's price changes later, the order must still reflect what the customer paid.

---

## 6. Business Logic & Rules

### Referral Rewards

| Event | Referrer Gets | Friend Gets |
| --- | --- | --- |
| Friend signs up | — | ₹20 wallet + 100 pts |
| Friend's first order delivered | ₹30 wallet + 50 pts | — |

### Points Rules

| Rule | Value |
| --- | --- |
| Earn rate | 5% of order value |
| Redeem rate | 1 pt = ₹0.25 |
| Max redeem | 20% of subtotal |
| Min redeem | 100 pts |

Example: Order ₹1000 → earn 50 pts. To redeem 50 pts → ₹12.50 off.

### Wallet Rules

| Rule | Value |
| --- | --- |
| Max wallet use | 50% of order total |
| Min withdraw | ₹100 |

### Payment Flow Priority
At checkout, deductions apply in this order:


1. Subtotal
2. − Wallet (max 50%)
3. − Points value (max 20%)
4. − Delivery charge
5. = Grand Total (charged via Razorpay or COD)
```

---

## 7. API Endpoints Reference

### Authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | /api/auth/register | — | Register (with optional referralCode) |
| POST | /api/auth/login | — | Login |
| POST | /api/auth/create-handoff | 🔒 | SSO code for Project 2 |
| POST | /api/auth/consume-handoff | — | Exchange code for JWT |

### Wallet

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | /api/wallet | 🔒 | Balance + transactions |
| POST | /api/wallet/add | 🔒 | Add money |
| POST | /api/wallet/withdraw | 🔒 | Send to bank |
| POST | /api/wallet/convert-points | 🔒 | Points → ₹ |

### Points

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | /api/points | 🔒 | Balance + history |

### Referrals

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | /api/referrals/me | 🔒 | List + summary |
| GET | /api/referrals/link | 🔒 | Get own referral link |

### Checkout

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | /api/checkout/preview | 🔒 | Preview wallet+points applied |

### Orders

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | /api/orders/place | 🔒 | Place order |
| POST | /api/orders/verify | 🔒 | Verify Razorpay payment |
| POST | /api/orders/webhook | — | Razorpay webhook |
| POST | /api/orders/:id/abandon | 🔒 | Cancel unpaid order |
| PUT | /api/orders/:id/status | 🔒 | admin Update status |
| GET | /api/orders/my | 🔒 | My orders |
| GET | /api/orders/:id | 🔒 | Order detail |

---

## 8. Complete User Workflows

### Workflow 1 — New User Signs Up With Referral


1. User A shares link: http://app.com/signup?ref=ARJU9F3B2A
2. User B opens link → signup form captures ?ref= code
3. User B submits: { name, email, password, referralCode: "ARJU9F3B2A" }
4. Backend:
   a. Generates User B's own referralCode (e.g. "USERB123")
   b. Creates User B
   c. applyReferralCode(B._id, "ARJU9F3B2A"):
      - Finds User A by code
      - Creates Referral { referrer: A, referred: B, status: pending }
      - Credits B's wallet: +₹20
      - Credits B's points: +100
5. Response: { user: B, token }
```

### Workflow 2 — Friend's First Order Completes


1. User B places order (see Workflow 3)
2. Admin marks order "delivered"
3. Backend updateOrderStatus:
   a. Credits B: 5% of order value as points
   b. Checks: is this B's FIRST delivered order?
   c. If yes → rewardReferrerOnFirstOrder(B._id, order._id):
      - Referral status: pending → completed
      - Credits User A's wallet: +₹30
      - Credits User A's points: +50
```

### Workflow 3 — Placing an Order


1. User opens cart → clicks Checkout
2. Popup shows addresses + items + wallet/points toggles
3. User toggles wallet/points → POST /api/checkout/preview
4. Backend responds:
   {
     subtotal: 500,
     walletBalance: 200,
     walletUsed: 200,
     pointsAvailable: 400,
     pointsUsed: 400,
     pointsValue: 100,
     grandTotal: 200
   }
5. User clicks "Confirm Order"
6. Frontend POSTs /api/orders/place:
   {
     addressId, items, useWallet: true, usePoints: true,
     paymentMethod: "razorpay"
   }
7. Backend:
   a. Validates stock
   b. Recalculates totals (never trusts client prices)
   c. Creates Order (paymentStatus: pending)
   d. Debits wallet + points
   e. Creates Razorpay order for ₹200
   f. Returns: { order, razorpay: { orderId, amount, key } }
8. Frontend opens Razorpay checkout modal
9. User pays → Razorpay returns 3 values
10. Frontend POSTs /api/orders/verify
11. Backend verifies HMAC signature → marks paid → clears cart
```

### Workflow 4 — Add Money to Wallet


1. User clicks "Add Money"
2. Modal opens → enters amount (500) → picks method (UPI - PhonePe)
3. Frontend POSTs /api/wallet/add { amount: 500, method: "UPI - PhonePe" }
4. Backend:
   - Wallet.balance += 500
   - Adds transaction { type: add_money, amount: 500, direction: credit }
5. Response: updated wallet
6. Frontend refetches wallet → balance shows ₹500
```

---

## 9. Frontend Integration

### Files That Need Backend Wiring

| File | Backend Endpoints Used |
| --- | --- |
| Cart.jsx | /cart, /delivery-address, /wallet, /points, /checkout/preview, /orders/place, /orders/verify, /orders/:id/abandon |
| WalletPoints.jsx | /wallet, /points, /wallet/add, /wallet/withdraw |
| ReferEarn.jsx | /referrals/me, /referrals/link |
| MyWishlist.jsx | /wishlist, /cart/add |
| CartSection.jsx (Project 1) | SSO + /auth/create-handoff |

### Axios Instance

```js
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Every request automatically carries the JWT.

---

## 10. Payment Gateway Flow

### Razorpay Integration Diagram


┌──────────┐   ┌──────────┐   ┌──────────┐
│ Frontend │   │ Backend  │   │ Razorpay │
└────┬─────┘   └────┬─────┘   └────┬─────┘
     │                │               │
     │ POST /orders/place
     ├────────────────────────────────────>│
     │                │ POST /v1/orders
     │                ├────────────────────▶│
     │                │               │
     │                │ { order_id }  │
     │                │◀──────────────│
     │ { order, razorpay }
     │◀────────────────────────────────────│
     │
     │ Open checkout modal
     ├────────────────────────────────────▶│
     │
     │ User pays
     │
     │ { 3 values }
     │◀────────────────────────────────────│
     │ POST /orders/verify
     ├────────────────────────────────────>│
     │                │ HMAC verify
     │                │
     │                │ { order: paid }
     │                │◀──────────────│
     │
     │ Webhook (backup)
     │◀────────────────────────────────────│
```

### Three Verification Layers
- Client-side handler — fast confirmation
- Server-side /verify — signature HMAC check
- Webhook — catches payments even if client never calls verify

### Signature Verification

```js
const body = `${razorpayOrderId}|${razorpayPaymentId}`;
const expected = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest("hex");

if (expected !== razorpaySignature) throw new Error("Invalid signature");
```

---

## 11. Setup & Deployment

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env
PORT=5000
MONGO_URI=mongodb://localhost:27017/grocery_sathi
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# 3. Run backfill (once)
node scripts/backfillReferralCodes.js

# 4. Start server
npm run dev
```

### Razorpay Setup
1. Sign up at razorpay.com
2. Dashboard → Settings → API Keys → Generate Test Key
3. Copy Key ID + Key Secret into `.env`
4. Dashboard → Webhooks → Add:
   - URL: `https://yourdomain.com/api/orders/webhook`
   - Events: `payment.captured`, `payment.failed`
5. Copy webhook secret into `.env`

### Deployment Checklist
- [ ] All env vars set in production
- [ ] MongoDB connection string points to production cluster
- [ ] FRONTEND_URL is your live domain
- [ ] Razorpay switched from Test to Live Mode
- [ ] Webhook URL is public HTTPS
- [ ] CORS origin list includes production domain
- [ ] `express.json({ verify })` preserves `rawBody`
- [ ] Admin-only routes protected by `adminMiddleware`
- [ ] Rate limit `/orders/place` and `/wallet/add`

---

## 12. Testing Guide

### Test 1 — Referral Signup


1. Login as User A → GET /referrals/link → copy link
2. Open link in incognito → signup as User B with ?ref=CODE
3. Check User B's wallet → should be ₹20
4. Check User B's points → should be 100
5. Check MongoDB referrals collection → 1 doc, status: pending
```

### Test 2 — Referral Reward on Delivery


1. User B places + receives an order
2. Admin: PUT /orders/:id/status { status: "delivered" }
3. Check User A's wallet → +₹30
4. Check User A's points → +50
5. Referral status → completed
```

### Test 3 — Wallet Top-Up


1. POST /wallet/add { amount: 500, method: "UPI" }
2. GET /wallet → balance increased, transaction logged
```

### Test 4 — Checkout with Wallet + Points


1. Add ₹300 to wallet, earn 400 points
2. Add item worth ₹500 to cart
3. POST /checkout/preview { useWallet: true, usePoints: true }
4. Response shows walletUsed, pointsUsed, pointsValue, grandTotal
5. POST /orders/place with same flags
6. Pay via Razorpay test card: 4111 1111 1111 1111
7. Order status → confirmed
```

### Test 5 — Points on Delivery


1. Complete an order
2. Admin marks delivered
3. GET /points → +5% of order value as points
```

### Test 6 — Withdraw


1. POST /wallet/withdraw { amount: 200 }
2. GET /wallet → balance decreased
3. Transaction log shows withdrawal
```

---

## Appendix A — Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/grocery_sathi

# Auth
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d

# Frontend URLs
FRONTEND_URL=http://localhost:5173
SSO_FRONTEND_URL=http://localhost:5175

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Appendix B — Common Errors & Fixes

| Error | Cause | Fix |
| --- | --- | --- |
| `Wallet.findOne is not a function` | Model file missing/broken | Ensure `module.exports = mongoose.model("Wallet", schema)` |
| `404 /api/referrals/link` | Route not mounted or user has no code | Mount route + run backfill |
| `useWallet is not defined` | Missing state in Cart.jsx | Add `const [useWallet, setUseWallet] = useState(false)` |
| `Invalid payment signature` | Wrong secret or body parse | Ensure `rawBody` preserved, check `.env` |
| `Only X items in stock` | Concurrent purchase | Expected — show user message |
| `Double-charge on webhook` | Webhook + verify both ran | Use `processedPaymentIds` array |

---

## Appendix C — File Creation Order

Follow this order when implementing from scratch:


1. config/rewards.js
2. config/razorpay.js
3. utils/generateReferralCode.js
4. utils/generateOrderNumber.js
5. models/Wallet.js
6. models/RewardPoints.js
7. models/Referral.js
8. models/Order.js
9. Extend models/User.js (referralCode, referredBy)
10. scripts/backfillReferralCodes.js
11. controllers/walletController.js
12. controllers/pointsController.js
13. controllers/referralController.js
14. controllers/checkoutController.js
15. controllers/orderController.js
16. Extend controllers/authController.js (generate code on signup)
17. Extend controllers/orderController.js (delivered hook)
18. routes/walletRoutes.js
19. routes/pointsRoutes.js
20. routes/referralRoutes.js
21. routes/checkoutRoutes.js
22. routes/orderRoutes.js
23. server.js — mount all routes
24. Frontend wiring (Cart, WalletPoints, ReferEarn)
25. End-to-end test
```

---

## Summary

You now have a complete rewards ecosystem:

- Wallet — real money with a full audit ledger
- Points — loyalty currency with conversion to ₹
- Referrals — viral growth loop with rewards on both sides
- Orders — full lifecycle with snapshots
- Payments — Razorpay integration with 3-layer verification

Every file exists for a specific reason, every rule is centralized, and every workflow is documented.

### Next steps after this doc:

- Implement in the order listed in Appendix C
- Test each workflow as you go
- Add admin dashboard for order status management
- Add email/SMS notifications on order status changes
- Add cron job to expire unused points after 12 months
