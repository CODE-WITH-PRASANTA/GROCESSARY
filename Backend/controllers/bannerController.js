const Banner = require('../models/Banner');
const fs = require('fs');
const path = require('path');

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const { title, subTitle, linkType, target, order, status } = req.body;
    let bannerUrl = null;

    if (req.file) {
      bannerUrl = `/uploads/${req.file.filename}`;
    }

    const newBanner = new Banner({
      title,
      subTitle: subTitle || 'Special Offer',
      linkType,
      target: target || 'New Target',
      order: order ? Number(order) : 0,
      status: status || 'Active',
      bannerUrl
    });

    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subTitle, linkType, target, order, status } = req.body;

    let updateData = {
      title,
      subTitle,
      linkType,
      target,
      order: Number(order),
      status
    };

    if (req.file) {
      updateData.bannerUrl = `/uploads/${req.file.filename}`;
      // Optional: Delete old image file from server if needed
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedBanner) return res.status(404).json({ error: 'Banner not found' });

    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update status only (for 3-dots action dropdown)
exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBanner = await Banner.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedBanner) return res.status(404).json({ error: 'Banner not found' });

    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) return res.status(404).json({ error: 'Banner not found' });

    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};