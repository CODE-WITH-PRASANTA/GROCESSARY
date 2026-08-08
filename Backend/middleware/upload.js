const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const sharp = require("sharp");

// ======================================================
// CONFIG
// ======================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
};

// ======================================================
// GET FILE TYPE
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
// CREATE UPLOAD DIRECTORY
// ======================================================

const createUploadDirectory = (file) => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const fileType = getFileType(file);

  const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    fileType,
    year,
    month
  );

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
      recursive: true,
    });
  }

  return uploadDirectory;
};

// ======================================================
// STORAGE (Using memoryStorage to allow Sharp processing)
// ======================================================

const storage = multer.memoryStorage();

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes[file.mimetype]) {
    return cb(
      new Error("Only JPG, JPEG, PNG, WEBP, AVIF and PDF files are allowed."),
      false
    );
  }

  cb(null, true);
};

// ======================================================
// MULTER INSTANCE
// ======================================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// ======================================================
// CONVERT TO WEBP / SAVE FILE MIDDLEWARE
// ======================================================

const convertToWebp = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const fileType = getFileType(req.file);
    const directory = createUploadDirectory(req.file);

    const randomId = crypto.randomBytes(8).toString("hex");
    const timestamp = Date.now();

    const originalBaseName = path
      .basename(req.file.originalname, path.extname(req.file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

    const safeBaseName = originalBaseName || "uploaded-file";

    if (fileType === "images") {
      const fileName = `${safeBaseName}-${timestamp}-${randomId}.webp`;
      const absolutePath = path.join(directory, fileName);

      await sharp(req.file.buffer)
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(absolutePath);

      req.file.filename = fileName;
      req.file.path = absolutePath;
      req.file.destination = directory;
      req.file.mimetype = "image/webp";
      req.file.size = fs.statSync(absolutePath).size;

      console.log(`Image converted to WebP: ${fileName}`);
    } else {
      // Save PDFs directly from buffer
      const extension = allowedMimeTypes[req.file.mimetype];
      const fileName = `${safeBaseName}-${timestamp}-${randomId}${extension}`;
      const absolutePath = path.join(directory, fileName);

      fs.writeFileSync(absolutePath, req.file.buffer);

      req.file.filename = fileName;
      req.file.path = absolutePath;
      req.file.destination = directory;
      req.file.size = fs.statSync(absolutePath).size;

      console.log(`PDF saved: ${fileName}`);
    }

    next();
  } catch (error) {
    console.error("File processing & conversion error:", error);

    return res.status(500).json({
      success: false,
      message: "File processing & conversion error",
      error: error.message,
    });
  }
};

// ======================================================
// MAP UPLOADED FILE
// ======================================================

const mapUploadedFile = (file) => {
  if (!file) {
    return null;
  }

  const relativePath = path
    .relative(
      path.join(__dirname, ".."),
      file.path
    )
    .replace(/\\/g, "/");

  return {
    originalName: file.originalname,
    fileName: file.filename,
    mimeType: file.mimetype,
    fileType: getFileType(file) === "images" ? "image" : "pdf",
    size: file.size,
    sizeMB: Number((file.size / (1024 * 1024)).toFixed(2)),
    path: relativePath,
    url: file.path, // Adjust according to your server configuration if req is needed
  };
};

// ======================================================
// DELETE FILE
// ======================================================

const deleteUploadedFile = (fileData) => {
  try {
    if (!fileData) {
      return false;
    }

    const filePath =
      typeof fileData === "string"
        ? fileData
        : fileData.path;

    if (!filePath) {
      return false;
    }

    const uploadRoot = path.resolve(
      __dirname,
      "..",
      "uploads"
    );

    const absolutePath = path.resolve(
      __dirname,
      "..",
      filePath
    );

    // Security check against directory traversal
    if (
      absolutePath !== uploadRoot &&
      !absolutePath.startsWith(
        uploadRoot + path.sep
      )
    ) {
      console.error("Delete blocked: file is outside uploads directory");
      return false;
    }

    if (!fs.existsSync(absolutePath)) {
      return false;
    }

    fs.unlinkSync(absolutePath);
    return true;
  } catch (error) {
    console.error("File deletion error:", error.message);
    return false;
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  upload,
  processAndSaveFile: convertToWebp, // Alias for backward compatibility if needed
  convertToWebp,
  mapUploadedFile,
  deleteUploadedFile,
};