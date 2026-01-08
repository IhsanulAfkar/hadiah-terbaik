const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// 1. Global Limiter (General API protection) - PRODUCTION GRADE
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Reduced from 1000 to 100 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Terlalu banyak permintaan dari IP ini. Silakan coba lagi setelah 1 menit'
    },
    handler: (req, res) => {
        logger.warn(`Global rate limit exceeded for IP: ${req.ip} - Path: ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Terlalu banyak permintaan dari IP ini. Silakan coba lagi setelah 1 menit'
        });
    }
});

// 2. Auth Limiter (Strict brute-force protection for Login)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // STRICT: Only 5 login attempts per 15 minutes (reduced from 100)
    skipSuccessfulRequests: true, // Only count failed login attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Terlalu banyak percobaan login. Akun Anda diblokir sementara selama 15 menit'
    },
    handler: (req, res) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip} - Potential brute force attack`);
        res.status(429).json({
            success: false,
            message: 'Terlalu banyak percobaan login. Akun Anda diblokir sementara selama 15 menit'
        });
    }
});

// 3. Upload Limiter (File upload protection)
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Batas upload file tercapai. Silakan coba lagi setelah 1 jam'
    },
    handler: (req, res) => {
        logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Batas upload file tercapai. Silakan coba lagi setelah 1 jam'
        });
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    uploadLimiter
};
