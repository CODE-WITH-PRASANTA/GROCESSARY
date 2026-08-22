const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment
} = require('../controllers/blogController');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed'));
  }
});

router.route('/')
  .get(getAllBlogs)
  .post(upload.single('featuredImage'), createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(upload.single('featuredImage'), updateBlog)
  .delete(deleteBlog);

router.route('/:id/comments').post(addComment);

module.exports = router;