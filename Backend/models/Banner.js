const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  subTitle: { type: String, trim: true, maxlength: 150 },
  linkType: { type: String, enum: ['Product', 'Category', 'Custom URL'], default: 'Product' },
  target: { type: String, trim: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  bannerUrl: { type: String, default: null },
  bgGradient: { type: String, default: 'linear-gradient(135deg, #054f31, #10b981)' }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);