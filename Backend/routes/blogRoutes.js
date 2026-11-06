const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  addComment,
} = require("../controllers/blogController");

// Ensure root upload directory exists: Backend/uploads/
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer memory storage to allow Sharp WebP conversion
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|avif|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files (JPG, PNG, WEBP, AVIF, GIF) are allowed"));
  },
});

// Middleware to convert uploaded image buffer to WebP and save directly to Backend/uploads/
const processBlogImageToWebp = async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next();
  }

  try {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `blog-${uniqueSuffix}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Populate req.file details with new webp file info
    req.file.filename = filename;
    req.file.path = outputPath;
    req.file.mimetype = "image/webp";
    next();
  } catch (error) {
    console.error("Sharp WebP conversion error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to convert uploaded image to WebP format",
    });
  }
};

// Primary Routes
router
  .route("/")
  .get(getAllBlogs)
  .post(upload.single("featuredImage"), processBlogImageToWebp, createBlog);

router
  .route("/:id")
  .get(getBlogById)
  .put(upload.single("featuredImage"), processBlogImageToWebp, updateBlog)
  .delete(deleteBlog);

// Status Update Route (Used by Admin Blog Management)
router.patch("/:id/status", updateBlogStatus);

// Comments Route
router.post("/:id/comments", addComment);

module.exports = router;
