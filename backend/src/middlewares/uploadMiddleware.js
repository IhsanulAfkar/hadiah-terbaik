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
 * Validate file type by checking magic numbers (file signature)
 * This provides additional security beyond MIME type checking
 */
const validateFileSignature = (filePath, mimeType) => {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const hex = buffer.toString('hex').toUpperCase();

    // File signatures (magic numbers)
    const signatures = {
        'application/pdf': ['25504446'], // %PDF
        'image/jpeg': ['FFD8FF'],
        'image/png': ['89504E47'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504B0304'], // ZIP-based (DOCX)
        'application/msword': ['D0CF11E0A1B11AE1'] // DOC
    };

    const validSignatures = signatures[mimeType];
    if (!validSignatures) return false;

    return validSignatures.some(sig => hex.startsWith(sig));
};

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
    logger.info({
        category: 'FILE_UPLOAD',
        userId: req.user?.id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
    });

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        logger.warn({
            category: 'FILE_UPLOAD_REJECTED',
            reason: 'Invalid MIME type',
            mimeType: file.mimetype,
            userId: req.user?.id
        });

        return cb(new Error(`Tipe file tidak diizinkan: ${file.mimetype}. Hanya PDF, JPG, PNG, DOC, dan DOCX yang diperbolehkan.`), false);
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
        logger.warn({
            category: 'FILE_UPLOAD_REJECTED',
            reason: 'Extension does not match MIME type',
            extension: ext,
            mimeType: file.mimetype,
            userId: req.user?.id
        });

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
 * Enhanced upload middleware with post-upload validation
 */
const secureUpload = (fieldName, maxCount = 1) => {
    return async (req, res, next) => {
        // Handle upload
        const uploadHandler = maxCount === 1 ? upload.single(fieldName) : upload.array(fieldName, maxCount);

        uploadHandler(req, res, async (err) => {
            // Handle multer errors
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
                } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        message: 'Field name tidak sesuai'
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

            // Post-upload validation: Check file signatures
            const files = req.files || (req.file ? [req.file] : []);

            for (const file of files) {
                try {
                    // Validate file signature (magic numbers)
                    const isValidSignature = validateFileSignature(file.path, file.mimetype);

                    if (!isValidSignature) {
                        // Delete the file
                        fs.unlinkSync(file.path);

                        logger.warn({
                            category: 'FILE_UPLOAD_REJECTED',
                            reason: 'Invalid file signature',
                            filename: file.filename,
                            mimeType: file.mimetype,
                            userId: req.user?.id
                        });

                        return res.status(400).json({
                            success: false,
                            message: 'File tidak valid atau telah dimodifikasi. Signature file tidak sesuai dengan tipe file.'
                        });
                    }

                    // Additional security: Check for suspicious content (basic check)
                    // In production, integrate with antivirus scanning (ClamAV, VirusTotal API)

                    logger.info({
                        category: 'FILE_UPLOAD_SUCCESS',
                        filename: file.filename,
                        originalName: file.originalname,
                        size: file.size,
                        mimeType: file.mimetype,
                        userId: req.user?.id
                    });

                } catch (validationError) {
                    // Delete file on validation error
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }

                    logger.error({
                        category: 'FILE_VALIDATION_ERROR',
                        error: validationError.message,
                        filename: file.filename,
                        userId: req.user?.id
                    });

                    return res.status(400).json({
                        success: false,
                        message: 'Validasi file gagal'
                    });
                }
            }

            next();
        });
    };
};

/**
 * Middleware to apply upload rate limiting
 * Import and use uploadLimiter from rateLimit.js
 */
const { uploadLimiter } = require('./rateLimit');

module.exports = {
    upload,
    secureUpload,
    uploadLimiter
};
