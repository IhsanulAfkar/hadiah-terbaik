const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
    // Standardize Multer errors
    if (err.name === 'MulterError') {
        err.statusCode = 400;
        err.isOperational = true;
        if (err.code === 'LIMIT_FILE_SIZE') err.message = 'Ukuran file terlalu besar (Maks 5MB)';
        if (err.code === 'LIMIT_FILE_COUNT') err.message = 'Terlalu banyak file yang diunggah (Maks 20)';
        if (err.code === 'LIMIT_UNEXPECTED_FILE') err.message = 'Terdapat field file yang tidak dikenali';
    }

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // Production: don't leak stack traces
        if (err.isOperational) {
            // Trusted operational error: send message to client
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            // Programming or other unknown error: don't leak details
            logger.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
};

module.exports = errorHandler;
