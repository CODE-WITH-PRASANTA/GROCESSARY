const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    subCategory: {
      type: String,
      default: '',
    },
    brand: {
      type: String,
      default: '',
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
    },
    tags: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    fullDescription: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 0,
    },
    lowStockAlert: {
      type: Number,
      default: 5,
    },
    tax: {
      type: Number,
      default: 0,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    images: [
      {
        type: String, // Stores relative paths like '/uploads/filename.jpg'
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);