const rateLimit = require('express-rate-limit');

// 1. Global Limiter (General API protection)
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests per windowMs (generous for dev)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 1 minute'
    }
});

// 2. Auth Limiter (Brute-force protection for Login)
// 2. Auth Limiter (Brute-force protection for Login)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Relaxed limit for debugging
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes'
    }
});

module.exports = {
    globalLimiter,
    authLimiter
};
