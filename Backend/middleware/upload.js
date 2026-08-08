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
// STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const directory = createUploadDirectory(file);

      cb(null, directory);
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    try {
      const randomId = crypto
        .randomBytes(8)
        .toString("hex");

      const timestamp = Date.now();

      const extension =
        allowedMimeTypes[file.mimetype];

      const originalBaseName = path
        .basename(
          file.originalname,
          path.extname(file.originalname)
        )
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 50);

      const safeBaseName =
        originalBaseName || "grocery-list";

      const fileName =
        `${safeBaseName}-${timestamp}-${randomId}${extension}`;

      cb(null, fileName);
    } catch (error) {
      cb(error);
    }
  },
});

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes[file.mimetype]) {
    return cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP, AVIF and PDF files are allowed."
      ),
      false
    );
  }

  cb(null, true);
};

// ======================================================
// MULTER
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
// CONVERT IMAGE TO WEBP
// ======================================================

const convertToWebp = async (req, res, next) => {
  try {
    // No file uploaded
    if (!req.file) {
      return next();
    }

    // PDF -> don't convert
    if (req.file.mimetype === "application/pdf") {
      return next();
    }

    const oldFilePath = req.file.path;
    const oldFileName = req.file.filename;

    const directory = path.dirname(oldFilePath);

    const originalName = path
      .basename(
        req.file.originalname,
        path.extname(req.file.originalname)
      )
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

    const safeBaseName =
      originalName || "grocery-list";

    const randomId = crypto
      .randomBytes(8)
      .toString("hex");

    const webpFileName =
      `${safeBaseName}-${Date.now()}-${randomId}.webp`;

    const webpPath = path.join(
      directory,
      webpFileName
    );

    // Convert to WebP
    await sharp(oldFilePath)
      .webp({
        quality: 85,
      })
      .toFile(webpPath);

    // Delete original JPG/PNG/AVIF/etc.
    if (
      fs.existsSync(oldFilePath) &&
      oldFilePath !== webpPath
    ) {
      fs.unlinkSync(oldFilePath);
    }

    // Update req.file
    req.file.filename = webpFileName;

    req.file.path = webpPath;

    req.file.destination = directory;

    req.file.mimetype = "image/webp";

    req.file.originalname =
      req.file.originalname;

    // Recalculate size
    const stats = fs.statSync(webpPath);

    req.file.size = stats.size;

    console.log(
      `Image converted: ${oldFileName} -> ${webpFileName}`
    );

    next();
  } catch (error) {
    console.error(
      "WebP conversion error:",
      error
    );

    // Delete uploaded original if conversion failed
    if (
      req.file &&
      req.file.path &&
      fs.existsSync(req.file.path)
    ) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error(
          "Failed to delete uploaded file:",
          deleteError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Image conversion to WebP failed",
      error: error.message,
    });
  }
};

// ======================================================
// MAP UPLOADED FILE
// ======================================================

const mapUploadedFile = (file, req) => {
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

    fileType:
      getFileType(file) === "images"
        ? "image"
        : "pdf",

    size: file.size,

    sizeMB: Number(
      (file.size / (1024 * 1024)).toFixed(2)
    ),

    path: relativePath,

    url:
      `${req.protocol}://${req.get("host")}/${relativePath}`,
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

    // Security check
    if (
      absolutePath !== uploadRoot &&
      !absolutePath.startsWith(
        uploadRoot + path.sep
      )
    ) {
      console.error(
        "Delete blocked: file is outside uploads directory"
      );

      return false;
    }

    if (!fs.existsSync(absolutePath)) {
      console.log(
        "File does not exist:",
        absolutePath
      );

      return false;
    }

    fs.unlinkSync(absolutePath);

    console.log(
      "Old uploaded file deleted:",
      absolutePath
    );

    return true;
  } catch (error) {
    console.error(
      "File deletion error:",
      error.message
    );

    return false;
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  upload,
  convertToWebp,
  mapUploadedFile,
  deleteUploadedFile,
};