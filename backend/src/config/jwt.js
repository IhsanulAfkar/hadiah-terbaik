const jwt = require('jsonwebtoken');
const prisma = require('./database');
const logger = require('../utils/logger');

// JWT Configuration
const JWT_CONFIG = {
    accessTokenExpiry: '15m',  // 15 minutes for access token
    refreshTokenExpiry: '7d',   // 7 days for refresh token
    issuer: 'kua-dukcapil-system',
    audience: 'kua-dukcapil-users'
};

/**
 * Generate access and refresh token pair
 * @param {Object} payload - User data to encode in token
 * @returns {Object} Object containing accessToken and refreshToken
 */
const generateTokenPair = (payload) => {
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: JWT_CONFIG.accessTokenExpiry,
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience
        }
    );

    const refreshToken = jwt.sign(
        { id: payload.id, type: 'refresh' },
        process.env.JWT_SECRET,
        {
            expiresIn: JWT_CONFIG.refreshTokenExpiry,
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience
        }
    );

    return { accessToken, refreshToken };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            issuer: JWT_CONFIG.issuer,
            audience: JWT_CONFIG.audience
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token telah kadaluarsa');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token tidak valid');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Valid refresh token
 * @returns {string} New access token
 */
const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = verifyToken(refreshToken);

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                role: true,
                full_name: true
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate new access token
        const accessToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                full_name: user.full_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: JWT_CONFIG.accessTokenExpiry,
                issuer: JWT_CONFIG.issuer,
                audience: JWT_CONFIG.audience
            }
        );

        return accessToken;
    } catch (error) {
        logger.error('Refresh token error:', error);
        throw error;
    }
};

/**
 * Blacklist a token (revoke it)
 * @param {string} token - Token to blacklist
 * @param {string} userId - User ID who owns the token
 */
const blacklistToken = async (token, userId) => {
    try {
        const decoded = verifyToken(token);

        // For now, we invalidate by clearing active_session_token
        // In production, consider using Redis for token blacklist
        await prisma.user.update({
            where: { id: userId },
            data: { active_session_token: null }
        });

        logger.info(`Token blacklisted for user: ${userId}`);
    } catch (error) {
        logger.error('Token blacklist error:', error);
        throw error;
    }
};

/**
 * Check if token is blacklisted
 * @param {string} token - Token to check
 * @param {string} userId - User ID
 * @returns {boolean} True if blacklisted
 */
const isTokenBlacklisted = async (token, userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { active_session_token: true }
        });

        // If active_session_token doesn't match, token is effectively blacklisted
        return !user || user.active_session_token !== token;
    } catch (error) {
        logger.error('Token blacklist check error:', error);
        return true; // Fail secure
    }
};

module.exports = {
    JWT_CONFIG,
    generateTokenPair,
    verifyToken,
    refreshAccessToken,
    blacklistToken,
    isTokenBlacklisted
};
