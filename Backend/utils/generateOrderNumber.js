// utils/generateOrderNumber.js
const crypto = require("crypto");

function generateOrderNumber() {
  const ts = Date.now().toString().slice(-8);
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ORD${ts}${rand}`;   // e.g. ORD12345678A1B2
}

module.exports = generateOrderNumber;