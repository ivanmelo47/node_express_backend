const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploadMiddleware = (uploadPath) => {
  // Ensure upload directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  };

  return multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB limit
    }
  });
};

/**
 * Handles a single file upload.
 * Can accept either an existing multer instance or a destination path string.
 * Wraps the multer middleware in a Promise.
 * 
 * @param {Object|string} uploadOrPath - The multer instance OR a destination path string.
 * @param {string} fieldName - The name of the field in the form-data.
 * @param {Object} req - The express request object.
 * @param {Object} res - The express response object.
 * @returns {Promise<void>}
 */
const handleSingleUpload = (uploadOrPath, fieldName, req, res) => {
  let upload = uploadOrPath;

  if (typeof uploadOrPath === 'string') {
    upload = createUploadMiddleware(uploadOrPath);
  }

  return new Promise((resolve, reject) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = {
  handleSingleUpload
};
