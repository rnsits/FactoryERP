// const multer = require('multer');
// const path = require('path');
// const AppError = require('../utils/errors/app.error');

// // Memory storage for storing files in memory
// const storage = multer.memoryStorage();
// const imageStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, path.join(process.cwd(), '/uploads/images')); // Updated path
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });
  
// const audioStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       const uploadPath = path.join(__dirname, 'uploads/audio');
//       cb(null, uploadPath); // Updated path
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });
  

// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'];
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         console.error(`Unsupported file type: ${file.mimetype}`);
//         cb(new AppError(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, MP3, and WAV are allowed.`));
//     }
// };

// // Multer configuration
// const upload = multer({
//     storage,
//     limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//     fileFilter,
// });

// const imageUpload = multer({
//     storage: imageStorage,
//     limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//     fileFilter,
//   });
  
//   const audioUpload = multer({
//     storage: audioStorage,
//     limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
//     fileFilter,
//   });
  

// module.exports = {
//     upload,
//     imageUpload,
//     audioUpload
// };


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

// Memory storage for storing files in memory
const storage = multer.memoryStorage();

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the image directory exists
        ensureUploadDirsExist();
        cb(null, path.join(process.cwd(), 'uploads/images')); // Path for images
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the audio directory exists
        ensureUploadDirsExist();
        cb(null, path.join(process.cwd(), 'uploads/audio')); // Path for audio
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Validate the file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.error(`Unsupported file type: ${file.mimetype}`);
        cb(new AppError(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, MP3, and WAV are allowed.`));
    }
};

// Multer configuration for file uploads
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
    fileFilter,
});

// Multer configuration for image uploads
const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
    fileFilter,
});

// Multer configuration for audio uploads
const audioUpload = multer({
    storage: audioStorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 20MB
    fileFilter,
});

module.exports = {
    upload,
    imageUpload,
    audioUpload
};
