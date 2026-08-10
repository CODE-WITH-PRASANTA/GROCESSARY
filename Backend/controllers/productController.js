const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const bodyData = req.body;

    // Check SKU Uniqueness
    if (bodyData.sku) {
      const existingSku = await Product.findOne({ sku: bodyData.sku.trim() });
      if (existingSku) {
        return res.status(400).json({ message: 'Product with this SKU already exists.' });
      }
    }

    // Handle Image File Paths from Multer
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const newProduct = await Product.create({
      ...bodyData,
      price: Number(bodyData.price) || 0,
      discountPrice: Number(bodyData.discountPrice) || 0,
      costPrice: Number(bodyData.costPrice) || 0,
      stockQuantity: Number(bodyData.stockQuantity) || 0,
      lowStockAlert: Number(bodyData.lowStockAlert) || 0,
      tax: Number(bodyData.tax) || 0,
      isOutOfStock: bodyData.isOutOfStock === 'true' || bodyData.isOutOfStock === true,
      images: imagePaths,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const bodyData = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Handle Image Updates
    let updatedImages = product.images;
    if (req.files && req.files.length > 0) {
      // Append newly uploaded images
      const newPaths = req.files.map((file) => `/uploads/${file.filename}`);
      updatedImages = [...updatedImages, ...newPaths];
    }

    // Process retained images if stringified array is passed
    if (bodyData.existingImages) {
      try {
        updatedImages = JSON.parse(bodyData.existingImages);
      } catch (e) {
        // Fallback if plain string
        updatedImages = [bodyData.existingImages];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...bodyData,
        price: bodyData.price !== undefined ? Number(bodyData.price) : product.price,
        discountPrice: bodyData.discountPrice !== undefined ? Number(bodyData.discountPrice) : product.discountPrice,
        stockQuantity: bodyData.stockQuantity !== undefined ? Number(bodyData.stockQuantity) : product.stockQuantity,
        isOutOfStock: bodyData.isOutOfStock !== undefined ? (bodyData.isOutOfStock === 'true' || bodyData.isOutOfStock === true) : product.isOutOfStock,
        images: updatedImages,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// @desc    Delete product & remove associated images from server disk
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Clean up associated local images
    if (product.images && product.images.length > 0) {
      product.images.forEach((imgRelPath) => {
        const fullPath = path.join(__dirname, '..', imgRelPath);
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting file ${fullPath}:`, err);
          });
        }
      });
    }

    res.status(200).json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};