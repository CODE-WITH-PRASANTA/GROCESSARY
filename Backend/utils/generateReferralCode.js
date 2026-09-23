// utils/generateReferralCode.js
const crypto = require("crypto");

function generateReferralCode(name = "USER") {
  const base = String(name).replace(/\s+/g, "").slice(0, 4).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${base}${rand}`; // e.g. ARJU9F3B2A
}

module.exports = generateReferralCode;