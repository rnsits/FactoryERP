const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/errors/app.error');
const { StatusCodes } = require('http-status-codes');

// Ensure upload directories exist
const ensureUploadDirsExist = () => {
    const imageDir = path.join(process.cwd(), 'uploads/images');
    const audioDir = path.join(process.cwd(), 'uploads/audio');
  
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }
  
    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }
};

// Create upload directories
ensureUploadDirsExist();

// Storage configurations
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads/images')); // Path for images
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads/audio')); // Path for audio
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter logic
const fileFilter = (allowedTypes) => (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                [`Invalid file type: ${file.mimetype}. Allowed types are ${allowedTypes.join(', ')}.`],
                StatusCodes.NOT_FOUND
            )
        );
    }
};

// Dynamic upload configurations
const imageUpload = (fieldName, allowedTypes = ['image/jpeg', 'image/png']) =>
    multer({
        storage: imageStorage,
        limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
        fileFilter: fileFilter(allowedTypes),
    }).single(fieldName);

const audioUpload = (fieldName, allowedTypes = ['audio/mpeg', 'audio/wav']) => 
    multer({
        storage: audioStorage,
        limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
        fileFilter: fileFilter(allowedTypes),
    }).single(fieldName);

// Middleware to handle errors and missing files dynamically
const multerMiddleware = (upload) => (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Handle Multer-specific errors
            return res.status(400).json({
                message: 'File upload error',
                error: err.message,
            });
        } else if (err instanceof AppError) {
            // Handle custom validation errors
            return res.status(err.statusCode || 400).json({
                message: err.message,
            });
        } else if (err) {
            // Handle other errors
            return next(err);
        }

        next(); // Proceed to the next middleware
    });
};

module.exports = {
    imageUpload,
    audioUpload,
    multerMiddleware,
};

