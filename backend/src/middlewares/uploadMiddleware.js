const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const logger = require('../utils/logger');

// Whitelist of allowed MIME types
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

// File size limit: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum files per upload
const MAX_FILES = 10;

/**
 * Secure file storage configuration
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';

        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate secure random filename to prevent path traversal
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();

        // Sanitize extension - only allow whitelisted extensions
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
        if (!allowedExtensions.includes(ext)) {
            return cb(new Error('Ekstensi file tidak diizinkan'));
        }

        const secureFilename = `${timestamp}_${uniqueId}${ext}`;
        cb(null, secureFilename);
    }
});

/**
 * File filter with strict validation
 */
const fileFilter = (req, file, cb) => {
    // Log upload attempt
    if (logger && logger.info) {
        logger.info({
            category: 'FILE_UPLOAD',
            userId: req.user?.id,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size
        });
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        if (logger && logger.warn) {
            logger.warn({
                category: 'FILE_UPLOAD_REJECTED',
                reason: 'Invalid MIME type',
                mimeType: file.mimetype,
                userId: req.user?.id
            });
        }

        return cb(new Error(`Tipe file tidak diizinkan: ${file.mimetype}`), false);
    }

    // Validate file extension matches MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeToExt = {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/jpg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    };

    const validExtensions = mimeToExt[file.mimetype] || [];
    if (!validExtensions.includes(ext)) {
        if (logger && logger.warn) {
            logger.warn({
                category: 'FILE_UPLOAD_REJECTED',
                reason: 'Extension does not match MIME type',
                extension: ext,
                mimeType: file.mimetype,
                userId: req.user?.id
            });
        }

        return cb(new Error('Ekstensi file tidak sesuai dengan tipe file'), false);
    }

    cb(null, true);
};

/**
 * Multer upload configuration
 */
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES
    }
});

/**
 * Simple upload middleware for backwards compatibility
 * Use this for existing routes that expect simple upload behavior
 */
const simpleUpload = upload;

/**
 * Enhanced upload middleware with additional security (optional)
 * For new routes that want extra validation
 */
const secureUpload = (fieldName, maxCount = 1) => {
    return (req, res, next) => {
        const uploadHandler = maxCount === 1 ? upload.single(fieldName) : upload.array(fieldName, maxCount);

        uploadHandler(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB`
                    });
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: `Terlalu banyak file. Maksimal ${MAX_FILES} file`
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: 'Upload error: ' + err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            if (logger && logger.info) {
                const files = req.files || (req.file ? [req.file] : []);
                files.forEach(file => {
                    logger.info({
                        category: 'FILE_UPLOAD_SUCCESS',
                        filename: file.filename,
                        originalName: file.originalname,
                        size: file.size,
                        mimeType: file.mimetype,
                        userId: req.user?.id
                    });
                });
            }

            next();
        });
    };
};

// Safe import of uploadLimiter with fallback
let uploadLimiter;
try {
    uploadLimiter = require('./rateLimit').uploadLimiter;
} catch (e) {
    // Fallback if rateLimit module doesn't have uploadLimiter yet
    uploadLimiter = (req, res, next) => next();
}

// Export both simple and secure upload
// IMPORTANT: Export 'upload' as the actual multer instance to maintain backwards compatibility
// This ensures routes can use upload.single(), upload.array(), upload.any(), etc.
module.exports = upload;           // Default export - full multer instance with all methods
module.exports.upload = upload;    // Named export for clarity
module.exports.simpleUpload = simpleUpload;     // Alias for upload - backwards compatible  
module.exports.secureUpload = secureUpload;     // Enhanced with error handling
module.exports.uploadLimiter = uploadLimiter;   // Rate limiter
