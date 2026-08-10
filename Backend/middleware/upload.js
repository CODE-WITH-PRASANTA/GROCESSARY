const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const sharp = require("sharp");

// ======================================================
// CONFIG & ALLOWED MIME TYPES
// ======================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const allowedMimeTypes = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
};

// ======================================================
// HELPER: GET FILE CATEGORY
// ======================================================

const getFileType = (file) => {
  if (file.mimetype.startsWith("image/")) {
    return "images";
  }
  if (file.mimetype === "application/pdf") {
    return "pdfs";
  }
  return "others";
};

// ======================================================
// HELPER: CREATE SIMPLE UPLOAD DIRECTORY
// Output structure: backend/uploads/{images|pdfs}
// ======================================================

const createUploadDirectory = (file) => {
  const fileCategory = getFileType(file);

  const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    fileCategory
  );

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  return { uploadDirectory, fileCategory };
};

// ======================================================
// MULTER MEMORY STORAGE & FILTER
// ======================================================

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes[file.mimetype]) {
    return cb(
      new Error(
        "Invalid file type. Only JPG, JPEG, PNG, WEBP, AVIF, and PDF are allowed."
      ),
      false
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// ======================================================
// MIDDLEWARE: CONVERT TO WEBP & SAVE TO DISK
// ======================================================

const convertToWebp = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const { uploadDirectory, fileCategory } = createUploadDirectory(req.file);

    const randomId = crypto.randomBytes(8).toString("hex");
    const timestamp = Date.now();

    // Sanitize original filename
    const originalBaseName = path
      .basename(req.file.originalname, path.extname(req.file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

    const safeBaseName = originalBaseName || "file";

    if (fileCategory === "images") {
      const fileName = `${safeBaseName}-${timestamp}-${randomId}.webp`;
      const absolutePath = path.join(uploadDirectory, fileName);

      // Compress and convert image to WebP using Sharp
      await sharp(req.file.buffer)
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(absolutePath);

      // Simple relative path without dates
      const relativePath = `uploads/images/${fileName}`;

      req.file.filename = fileName;
      req.file.path = relativePath;
      req.file.absolutePath = absolutePath;
      req.file.mimetype = "image/webp";
      req.file.size = fs.statSync(absolutePath).size;
    } else {
      // Save PDF directly from memory buffer
      const extension = allowedMimeTypes[req.file.mimetype] || ".pdf";
      const fileName = `${safeBaseName}-${timestamp}-${randomId}${extension}`;
      const absolutePath = path.join(uploadDirectory, fileName);

      fs.writeFileSync(absolutePath, req.file.buffer);

      // Simple relative path without dates
      const relativePath = `uploads/pdfs/${fileName}`;

      req.file.filename = fileName;
      req.file.path = relativePath;
      req.file.absolutePath = absolutePath;
      req.file.size = fs.statSync(absolutePath).size;
    }

    next();
  } catch (error) {
    console.error("File Processing Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process and save uploaded file",
      error: error.message,
    });
  }
};

// ======================================================
// MAP UPLOADED FILE
// ======================================================

const mapUploadedFile = (file, req = null) => {
  if (!file) return null;

  if (!file.path) {
    throw new Error(
      "file.path is undefined. Ensure 'convertToWebp' middleware is executed before the controller."
    );
  }

  let fullUrl = file.path;
  if (req) {
    const protocol = req.protocol;
    const host = req.get("host");
    fullUrl = `${protocol}://${host}/${file.path}`;
  } else {
    fullUrl = `/${file.path}`;
  }

  return {
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    fileType: getFileType(file) === "images" ? "image" : "pdf",
    size: file.size,
    sizeMB: Number((file.size / (1024 * 1024)).toFixed(2)),
    path: file.path, // e.g. "uploads/images/my-list-17182928.webp"
    url: fullUrl,   // e.g. "https://backend.grocerysathi.com/uploads/images/my-list-17182928.webp"
  };
};

// ======================================================
// DELETE UPLOADED FILE
// ======================================================

const deleteUploadedFile = (fileData) => {
  try {
    if (!fileData) return false;

    const targetPath =
      typeof fileData === "string"
        ? fileData
        : fileData.path || fileData.absolutePath;

    if (!targetPath) return false;

    const rootDir = path.resolve(__dirname, "..");
    const uploadRoot = path.join(rootDir, "uploads");

    const absolutePath = path.isAbsolute(targetPath)
      ? targetPath
      : path.join(rootDir, targetPath);

    // Prevent directory traversal attacks
    if (
      absolutePath !== uploadRoot &&
      !absolutePath.startsWith(uploadRoot + path.sep)
    ) {
      console.error("Delete Blocked: Path is outside uploads directory");
      return false;
    }

    if (!fs.existsSync(absolutePath)) {
      return false;
    }

    fs.unlinkSync(absolutePath);
    return true;
  } catch (error) {
    console.error("File Deletion Error:", error.message);
    return false;
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  upload,
  convertToWebp,
  processAndSaveFile: convertToWebp,
  mapUploadedFile,
  deleteUploadedFile,
};