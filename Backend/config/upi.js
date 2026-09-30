// config/upi.js
module.exports = {
  // Your merchant UPI ID — this is what the customer pays to
  // Linked directly to the admin's bank account
  MERCHANT_VPA: process.env.UPI_MERCHANT_VPA || "grocerysathi@okicici",
  MERCHANT_NAME: process.env.UPI_MERCHANT_NAME || "Grocery Sathi",
  MERCHANT_MCC: "5411", // grocery store category
  CURRENCY: "INR",
};