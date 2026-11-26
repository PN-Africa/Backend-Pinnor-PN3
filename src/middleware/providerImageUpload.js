
import multer from "multer";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },

  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error(
        "Only JPEG, PNG and WebP images are allowed"
      );

      error.statusCode = 400;
      error.code = "INVALID_IMAGE_TYPE";

      return callback(error);
    }

    callback(null, true);
  }
});

export const uploadProviderImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        const statusCode =
          error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

        return res.status(statusCode).json({
          success: false,
          error: error.code,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Image must not exceed 5MB"
              : error.message
        });
      }

      return res.status(error.statusCode || 400).json({
        success: false,
        error: error.code || "IMAGE_UPLOAD_ERROR",
        message: error.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "IMAGE_REQUIRED",
        message: "Please select a provider image"
      });
    }

    next();
  });
};
