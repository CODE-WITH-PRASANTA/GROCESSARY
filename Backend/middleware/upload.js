const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const sharp = require("sharp");

// ======================================================
// CONFIG
// ======================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const MAX_PRODUCT_IMAGES = 5;


// ======================================================
// ALLOWED MIME TYPES
// ======================================================

const allowedMimeTypes = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
};


// ======================================================
// GET FILE CATEGORY
// ======================================================

const getFileType = (file) => {
  if (!file || !file.mimetype) {
    return "others";
  }

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
//
// backend/
//    uploads/
//       images/
//       pdfs/
// ======================================================

const createUploadDirectory = (file) => {
  const fileCategory =
    getFileType(file);

  const uploadDirectory = path.join(
    __dirname,
    "..",
    "uploads",
    fileCategory
  );

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
      uploadDirectory,
      {
        recursive: true,
      }
    );
  }

  return {
    uploadDirectory,
    fileCategory,
  };
};


// ======================================================
// MULTER MEMORY STORAGE
// ======================================================

const storage =
  multer.memoryStorage();


// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    !allowedMimeTypes[
      file.mimetype
    ]
  ) {
    return cb(
      new Error(
        "Invalid file type. Only JPG, JPEG, PNG, WEBP, AVIF, and PDF are allowed."
      ),
      false
    );
  }

  cb(null, true);
};


// ======================================================
// MULTER CONFIGURATION
//
// Supports:
// - Single file
// - Multiple product images
// ======================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      MAX_FILE_SIZE,

    files:
      MAX_PRODUCT_IMAGES,
  },
});


// ======================================================
// SANITIZE FILE NAME
// ======================================================

const sanitizeFileName = (
  originalName
) => {
  const originalBaseName =
    path
      .basename(
        originalName,
        path.extname(
          originalName
        )
      )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      )
      .substring(
        0,
        50
      );

  return (
    originalBaseName ||
    "file"
  );
};


// ======================================================
// GENERATE UNIQUE FILE NAME
// ======================================================

const generateFileName = (
  originalName,
  extension
) => {
  const safeBaseName =
    sanitizeFileName(
      originalName
    );

  const timestamp =
    Date.now();

  const randomId =
    crypto
      .randomBytes(8)
      .toString("hex");

  return `${safeBaseName}-${timestamp}-${randomId}${extension}`;
};


// ======================================================
// PROCESS SINGLE FILE
// ======================================================

const processSingleFile =
  async (file) => {
    if (!file) {
      return null;
    }

    // ==================================================
    // CREATE DIRECTORY
    // ==================================================

    const {
      uploadDirectory,
      fileCategory,
    } =
      createUploadDirectory(
        file
      );


    // ==================================================
    // IMAGE
    // ==================================================

    if (
      fileCategory ===
      "images"
    ) {
      const fileName =
        generateFileName(
          file.originalname,
          ".webp"
        );

      const absolutePath =
        path.join(
          uploadDirectory,
          fileName
        );


      // ================================================
      // CONVERT IMAGE TO WEBP
      // ================================================

      await sharp(
        file.buffer
      )
        .resize(
          1920,
          1080,
          {
            fit: "inside",

            withoutEnlargement:
              true,
          }
        )
        .webp({
          quality: 80,
        })
        .toFile(
          absolutePath
        );


      // ================================================
      // RELATIVE PATH
      // ================================================

      const relativePath =
        `uploads/images/${fileName}`;


      // ================================================
      // UPDATE FILE OBJECT
      // ================================================

      file.filename =
        fileName;

      file.path =
        relativePath;

      file.absolutePath =
        absolutePath;

      file.mimetype =
        "image/webp";

      file.size =
        fs.statSync(
          absolutePath
        ).size;


      return file;
    }


    // ==================================================
    // PDF
    // ==================================================

    if (
      fileCategory ===
      "pdfs"
    ) {
      const extension =
        allowedMimeTypes[
          file.mimetype
        ] || ".pdf";


      const fileName =
        generateFileName(
          file.originalname,
          extension
        );


      const absolutePath =
        path.join(
          uploadDirectory,
          fileName
        );


      // ================================================
      // SAVE PDF
      // ================================================

      fs.writeFileSync(
        absolutePath,
        file.buffer
      );


      // ================================================
      // RELATIVE PATH
      // ================================================

      const relativePath =
        `uploads/pdfs/${fileName}`;


      file.filename =
        fileName;

      file.path =
        relativePath;

      file.absolutePath =
        absolutePath;

      file.size =
        fs.statSync(
          absolutePath
        ).size;


      return file;
    }


    // ==================================================
    // OTHER FILES
    // ==================================================

    const extension =
      allowedMimeTypes[
        file.mimetype
      ] || "";


    const fileName =
      generateFileName(
        file.originalname,
        extension
      );


    const absolutePath =
      path.join(
        uploadDirectory,
        fileName
      );


    fs.writeFileSync(
      absolutePath,
      file.buffer
    );


    const relativePath =
      `uploads/others/${fileName}`;


    file.filename =
      fileName;

    file.path =
      relativePath;

    file.absolutePath =
      absolutePath;


    file.size =
      fs.statSync(
        absolutePath
      ).size;


    return file;
  };


// ======================================================
// MIDDLEWARE
//
// IMPORTANT:
//
// Supports both:
//
// upload.single("logo")
// upload.array("images", 5)
//
// ======================================================

const convertToWebp =
  async (
    req,
    res,
    next
  ) => {
    try {

      // ==================================================
      // MULTIPLE FILES
      // ==================================================

      if (
        req.files &&
        Array.isArray(
          req.files
        )
      ) {

        // ================================================
        // MAX FILE CHECK
        // ================================================

        if (
          req.files.length >
          MAX_PRODUCT_IMAGES
        ) {
          return res.status(
            400
          ).json({
            success: false,

            message:
              `Maximum ${MAX_PRODUCT_IMAGES} files are allowed.`,
          });
        }


        // ================================================
        // PROCESS ALL FILES
        // ================================================

        const processedFiles =
          [];


        for (
          const file of req.files
        ) {
          const processedFile =
            await processSingleFile(
              file
            );

          if (
            processedFile
          ) {
            processedFiles.push(
              processedFile
            );
          }
        }


        // ================================================
        // REPLACE req.files
        // ================================================

        req.files =
          processedFiles;


        return next();
      }


      // ==================================================
      // SINGLE FILE
      //
      // Used by:
      //
      // upload.single("logo")
      // ==================================================

      if (req.file) {

        const processedFile =
          await processSingleFile(
            req.file
          );


        req.file =
          processedFile;


        return next();
      }


      // ==================================================
      // NO FILE
      // ==================================================

      return next();

    } catch (error) {

      console.error(
        "File Processing Error:",
        error
      );


      return res.status(
        500
      ).json({
        success: false,

        message:
          "Failed to process and save uploaded file",

        error:
          error.message,
      });
    }
  };


// ======================================================
// MAP SINGLE UPLOADED FILE
// ======================================================

const mapUploadedFile = (
  file,
  req = null
) => {

  if (!file) {
    return null;
  }


  if (!file.path) {
    throw new Error(
      "file.path is undefined. Ensure 'convertToWebp' middleware is executed before the controller."
    );
  }


  // ====================================================
  // URL
  // ====================================================

  let fullUrl =
    file.path;


  if (req) {
    const protocol =
      req.protocol;

    const host =
      req.get("host");

    fullUrl =
      `${protocol}://${host}/${file.path}`;
  } else {
    fullUrl =
      `/${file.path}`;
  }


  // ====================================================
  // RETURN
  // ====================================================

  return {
    originalName:
      file.originalname,

    fileName:
      file.filename,

    mimeType:
      file.mimetype,

    fileType:
      getFileType(file) ===
      "images"
        ? "image"
        : "pdf",

    size:
      file.size,

    sizeMB:
      Number(
        (
          file.size /
          (1024 * 1024)
        ).toFixed(2)
      ),

    path:
      file.path,

    url:
      fullUrl,
  };
};


// ======================================================
// MAP MULTIPLE FILES
// ======================================================

const mapUploadedFiles = (
  files,
  req = null
) => {

  if (
    !files ||
    !Array.isArray(files)
  ) {
    return [];
  }


  return files
    .map((file) =>
      mapUploadedFile(
        file,
        req
      )
    )
    .filter(Boolean);
};


// ======================================================
// DELETE UPLOADED FILE
// ======================================================

const deleteUploadedFile =
  (fileData) => {

    try {

      if (!fileData) {
        return false;
      }


      // ==================================================
      // GET TARGET PATH
      // ==================================================

      const targetPath =
        typeof fileData ===
        "string"
          ? fileData
          : fileData.path ||
            fileData.absolutePath;


      if (!targetPath) {
        return false;
      }


      // ==================================================
      // ROOT DIRECTORY
      // ==================================================

      const rootDir =
        path.resolve(
          __dirname,
          ".."
        );


      const uploadRoot =
        path.join(
          rootDir,
          "uploads"
        );


      // ==================================================
      // ABSOLUTE PATH
      // ==================================================

      let absolutePath;


      if (
        path.isAbsolute(
          targetPath
        )
      ) {
        absolutePath =
          path.resolve(
            targetPath
          );
      } else {

        // Remove leading slash
        const cleanPath =
          String(
            targetPath
          ).replace(
            /^[/\\]+/,
            ""
          );


        absolutePath =
          path.resolve(
            rootDir,
            cleanPath
          );
      }


      // ==================================================
      // SECURITY
      //
      // File must remain inside uploads
      // ==================================================

      const normalizedUploadRoot =
        path.resolve(
          uploadRoot
        );


      const normalizedFilePath =
        path.resolve(
          absolutePath
        );


      if (
        normalizedFilePath !==
          normalizedUploadRoot &&
        !normalizedFilePath.startsWith(
          normalizedUploadRoot +
            path.sep
        )
      ) {
        console.error(
          "Delete Blocked: Path is outside uploads directory"
        );

        return false;
      }


      // ==================================================
      // FILE DOES NOT EXIST
      // ==================================================

      if (
        !fs.existsSync(
          normalizedFilePath
        )
      ) {
        return false;
      }


      // ==================================================
      // DELETE
      // ==================================================

      fs.unlinkSync(
        normalizedFilePath
      );


      return true;

    } catch (error) {

      console.error(
        "File Deletion Error:",
        error.message
      );

      return false;
    }
  };


// ======================================================
// DELETE MULTIPLE FILES
// ======================================================

const deleteUploadedFiles =
  (files) => {

    if (
      !files ||
      !Array.isArray(
        files
      )
    ) {
      return 0;
    }


    let deletedCount =
      0;


    files.forEach(
      (file) => {

        if (
          deleteUploadedFile(
            file
          )
        ) {
          deletedCount++;
        }

      }
    );


    return deletedCount;
  };


// ======================================================
// ERROR HANDLER FOR MULTER
// ======================================================

const handleUploadError =
  (error, req, res, next) => {

    if (
      error instanceof
      multer.MulterError
    ) {

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "File size cannot exceed 10 MB.",
        });
      }


      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            `Maximum ${MAX_PRODUCT_IMAGES} files are allowed.`,
        });
      }


      if (
        error.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {
        return res.status(
          400
        ).json({
          success: false,

          message:
            "Unexpected file field or too many files.",
        });
      }


      return res.status(
        400
      ).json({
        success: false,

        message:
          error.message,
      });
    }


    if (error) {
      return res.status(
        400
      ).json({
        success: false,

        message:
          error.message ||
          "File upload failed.",
      });
    }


    next();
  };


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

  // Multer instance
  upload,

  // Main processing middleware
  convertToWebp,

  // Alias
  processAndSaveFile:
    convertToWebp,

  // Single file mapper
  mapUploadedFile,

  // Multiple file mapper
  mapUploadedFiles,

  // Delete single
  deleteUploadedFile,

  // Delete multiple
  deleteUploadedFiles,

  // Multer error handler
  handleUploadError,
};