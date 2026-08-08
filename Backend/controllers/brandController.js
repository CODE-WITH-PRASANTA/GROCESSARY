const Brand = require('../models/Brand');
const fs = require('fs');
const path = require('path');

// Helper to remove orphaned image from server
const removeFile = (fileUrl) => {
  if (!fileUrl) return;
  const filePath = path.join(__dirname, '..', fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete file:', err);
    });
  }
};

// @desc    Get all brands with search & status filter
// @route   GET /api/brands
exports.getBrands = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const brands = await Brand.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new brand
// @route   POST /api/brands
exports.createBrand = async (req, res) => {
  try {
    const { name, tagline, slug, category, description, order, status, logoUrl } = req.body;

    const existingBrand = await Brand.findOne({ slug });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand slug already exists.' });
    }

    const brand = await Brand.create({
      name,
      tagline,
      slug,
      category: category || 'General',
      description,
      order: Number(order) || 0,
      status: status === 'true' || status === true ? 'Active' : 'Inactive',
      logoUrl: logoUrl || null,
    });

    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update existing brand
// @route   PUT /api/brands/:id
exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    const { name, tagline, slug, category, description, order, status, logoUrl } = req.body;

    if (logoUrl && brand.logoUrl && brand.logoUrl !== logoUrl) {
      removeFile(brand.logoUrl);
    }

    brand.name = name || brand.name;
    brand.tagline = tagline !== undefined ? tagline : brand.tagline;
    brand.slug = slug || brand.slug;
    brand.category = category || brand.category;
    brand.description = description !== undefined ? description : brand.description;
    brand.order = order !== undefined ? Number(order) : brand.order;
    brand.status = status !== undefined ? (status === 'true' || status === true ? 'Active' : 'Inactive') : brand.status;
    
    if (logoUrl) {
      brand.logoUrl = logoUrl;
    }

    const updatedBrand = await brand.save();
    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Brand Status Only
// @route   PATCH /api/brands/:id/status
exports.updateBrandStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    if (brand.logoUrl) {
      removeFile(brand.logoUrl);
    }

    await brand.deleteOne();
    res.status(200).json({ message: 'Brand deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};