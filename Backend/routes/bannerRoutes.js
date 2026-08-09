const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

// Import upload middleware properly (adjust file name if it's upload.js or uploadMiddleware.js)
const { upload, processAndSaveFile } = require('../middleware/upload'); 

// Routes
router.get('/', bannerController.getBanners);

router.post(
  '/', 
  upload.single('bannerImage'), 
  processAndSaveFile, 
  bannerController.createBanner
);

router.put(
  '/:id', 
  upload.single('bannerImage'), 
  processAndSaveFile, 
  bannerController.updateBanner
);

router.patch('/:id/status', bannerController.updateBannerStatus);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;