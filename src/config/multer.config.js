// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const AppError = require('../utils/errors/app.error');

// // Ensure upload directories exist
// const ensureUploadDirsExist = () => {
//     const imageDir = path.join(process.cwd(), 'uploads/images');
//     const audioDir = path.join(process.cwd(), 'uploads/audio');
  
//     if (!fs.existsSync(imageDir)) {
//         fs.mkdirSync(imageDir, { recursive: true });
//     }
  
//     if (!fs.existsSync(audioDir)) {
//         fs.mkdirSync(audioDir, { recursive: true });
//     }
// };

// // Memory storage for storing files in memory
// const storage = multer.memoryStorage();

// const imageStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Ensure the image directory exists
//         ensureUploadDirsExist();
//         cb(null, path.join(process.cwd(), 'uploads/images')); // Path for images
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const audioStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Ensure the audio directory exists
//         ensureUploadDirsExist();
//         cb(null, path.join(process.cwd(), 'uploads/audio')); // Path for audio
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// // Validate the file type
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'];
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         console.error(`Unsupported file type: ${file.mimetype}`);
//         cb(new AppError(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, MP3, and WAV are allowed.`));
//     }
// };

// // Multer configuration for file uploads
// const upload = multer({
//     storage,
//     limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//     fileFilter,
// });

// // Multer configuration for image uploads
// const imageUpload = multer({
//     storage: imageStorage,
//     limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//     fileFilter,
// });

// // Multer configuration for audio uploads
// const audioUpload = multer({
//     storage: audioStorage,
//     limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//     fileFilter,
// });

// module.exports = {
//     upload,
//     imageUpload,
//     audioUpload
// };


// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const AppError = require('../utils/errors/app.error');

// // Ensure upload directories exist
// const ensureUploadDirsExist = () => {
//     const imageDir = path.join(process.cwd(), 'uploads/images');
//     const audioDir = path.join(process.cwd(), 'uploads/audio');
  
//     if (!fs.existsSync(imageDir)) {
//         fs.mkdirSync(imageDir, { recursive: true });
//     }
  
//     if (!fs.existsSync(audioDir)) {
//         fs.mkdirSync(audioDir, { recursive: true });
//     }
// };

// // Create upload directories
// ensureUploadDirsExist();

// // Storage configurations
// const imageStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(process.cwd(), 'uploads/images')); // Path for images
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const audioStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(process.cwd(), 'uploads/audio')); // Path for audio
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// // File filter logic
// const fileFilter = (allowedTypes) => (req, file, cb) => {
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(
//             new AppError(
//                 `Invalid file type: ${file.mimetype}. Allowed types are ${allowedTypes.join(', ')}.`,
//                 400
//             )
//         );
//     }
// };

// // Multer upload configurations
// // const imageUpload = multer({
// //     storage: imageStorage,
// //     limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
// //     fileFilter: fileFilter(['image/jpeg', 'image/png']),
// // }).single('product_image');

// // Dynamic image upload middleware
// const imageUpload = (fieldName, allowedTypes = ['image/jpeg', 'image/png']) =>
//     multer({
//         storage: imageStorage,
//         limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//         fileFilter: fileFilter(allowedTypes),
//     }).single(fieldName);

// const audioUpload = (fieldName, allowedTypes = ['audio/mpeg', 'audio/wav']) => 
//     multer({
//         storage: audioStorage,
//         limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//         fileFilter: fileFilter(allowedTypes),
//     }).single(fieldName);

// // Middleware to handle errors and missing files
// const multerMiddleware = (upload) => (req, res, next) => {
//     upload(req, res, (err) => {
//         if (err instanceof multer.MulterError) {
//             // Handle Multer-specific errors
//             return res.status(400).json({
//                 message: 'File upload error',
//                 error: err.message,
//             });
//         } else if (err instanceof AppError) {
//             // Handle custom validation errors
//             return res.status(err.statusCode || 400).json({
//                 message: err.message,
//             });
//         } else if (err) {
//             // Handle other errors
//             return next(err);
//         }

//         // Ensure a file was uploaded
//         if (!req.file) {
//             return res.status(400).json({
//                 message: 'File upload error',
//                 error: 'No file uploaded. Please provide a valid file.',
//             });
//         }

//         next(); // Proceed to the next middleware
//     });
// };

// module.exports = {
//     imageUploadMiddleware: multerMiddleware(imageUpload),
//     audioUploadMiddleware: multerMiddleware(audioUpload),
// };


// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const AppError = require('../utils/errors/app.error');

// // Ensure upload directories exist
// const ensureUploadDirsExist = () => {
//     const imageDir = path.join(process.cwd(), 'uploads/images');
//     if (!fs.existsSync(imageDir)) {
//         fs.mkdirSync(imageDir, { recursive: true });
//     }
// };

// // Ensure the upload directory exists on initialization
// ensureUploadDirsExist();

// const imageStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(process.cwd(), 'uploads/images')); // Path for images
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// // Dynamic file filter
// const fileFilter = (allowedTypes) => (req, file, cb) => {
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new AppError(`Invalid file type: ${file.mimetype}. Allowed types are: ${allowedTypes.join(', ')}`));
//     }
// };

// // Dynamic image upload middleware
// const imageUpload = (fieldName, allowedTypes = ['image/jpeg', 'image/png']) =>
//     multer({
//         storage: imageStorage,
//         limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//         fileFilter: fileFilter(allowedTypes),
//     }).single(fieldName);

// module.exports = { imageUpload };



const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/errors/app.error');

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
                `Invalid file type: ${file.mimetype}. Allowed types are ${allowedTypes.join(', ')}.`,
                400
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

        // Ensure a file was uploaded
        // if (req.file) {
        //     return res.status(400).json({
        //         message: 'File upload error',
        //         error: 'No file uploaded. Please provide a valid file.',
        //     });
        // }

        next(); // Proceed to the next middleware
    });
};

module.exports = {
    imageUpload,
    audioUpload,
    multerMiddleware,
};

