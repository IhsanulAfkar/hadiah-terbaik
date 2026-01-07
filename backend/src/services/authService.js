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

    // 3. Generate Token with configurable expiry
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    // 4. Update user with new active session (invalidates old session automatically)
    await prisma.user.update({
        where: { id: user.id },
        data: {
            active_session_token: token,
            last_login_at: new Date()
        }
    });

    // Return user info (excluding password and session token)
    const { password: _, active_session_token: __, ...userInfo } = user;

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
 * Logout user
 * Clears active session token from database
 * 
 * @param {string} userId - User ID
 * @returns {Object} - Success message
 */
const logout = async (userId) => {
    // Clear active session token
    await prisma.user.update({
        where: { id: userId },
        data: {
            active_session_token: null
        }
    });

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
