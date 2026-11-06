// config/razorpay.js
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4").trim(),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN").trim(),
});

module.exports = razorpay;
