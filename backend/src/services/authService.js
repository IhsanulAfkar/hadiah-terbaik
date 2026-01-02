const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const login = async (username, password) => {
    // 1. Find user
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            kecamatan: true  // Include kecamatan data for KUA users
        }
    });

    if (!user) {
        throw new Error('User not found'); // In prod, use generic message
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // 3. Generate Token
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Short-lived in real prod
    );

    // Return user info (excluding password)
    const { password: _, ...userInfo } = user;

    return { token, user: userInfo };
};

const getMe = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            kecamatan: true
        }
    });
    if (!user) { throw new Error('User not found'); }
    const { password: _, ...userInfo } = user;
    return userInfo;
};

/**
 * Logout user (Client-side token removal)
 * For JWT, we typically handle logout client-side by removing the token
 * This function can be extended to implement token blacklisting with Redis
 * 
 * @param {string} userId - User ID
 * @param {string} token - JWT token (optional, for blacklisting)
 * @returns {Object} - Success message
 */
const logout = async (userId, token = null) => {
    // For now, just return success message
    // In production, you might want to:
    // 1. Add token to Redis blacklist
    // 2. Set expiry matching token's remaining lifetime

    // TODO: Implement token blacklisting if needed
    // await redis.set(`blacklist:${token}`, '1', 'EX', remaining_ttl);

    return {
        success: true,
        message: 'Logout berhasil'
    };
};

/**
 * Change password
 * 
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} - Success message
 */
const changePassword = async (userId, oldPassword, newPassword) => {
    // Get user
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('User tidak ditemukan');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new Error('Password lama tidak sesuai');
    }

    // Validate new password
    if (newPassword.length < 6) {
        throw new Error('Password baru minimal 6 karakter');
    }

    if (oldPassword === newPassword) {
        throw new Error('Password baru harus berbeda dengan password lama');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword
        }
    });

    return {
        success: true,
        message: 'Password berhasil diubah'
    };
};

module.exports = {
    login,
    getMe,
    logout,
    changePassword
};
