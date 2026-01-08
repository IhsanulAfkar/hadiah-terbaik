const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { generateRandomPassword, logPasswordEvent } = require('../utils/passwordPolicy');

/**
 * Admin Service - Handles admin-specific operations
 * Role: ADMIN
 */

/**
 * Reset user password (Admin function)
 * 
 * @param {string} adminId - Admin user ID
 * @param {string} userId - Target user ID
 * @param {string} newPassword - New password (optional, auto-generate if not provided)
 * @returns {Object} - Success message and new password
 */
const resetUserPassword = async (adminId, userId, newPassword = null) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new AppError('User tidak ditemukan', 404);
    }

    // Generate secure random password if not provided
    const password = newPassword || generateRandomPassword(16);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and force user to change it on next login
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            must_change_password: true,
            password_changed_at: new Date(),
            failed_login_attempts: 0,
            locked_until: null
        }
    });

    logger.info(`Admin ${adminId} reset password for user ${userId} (${user.username})`);
    logPasswordEvent(userId, 'PASSWORD_RESET_BY_ADMIN', {
        adminId,
        username: user.username
    });

    return {
        message: 'Password berhasil direset',
        username: user.username,
        new_password: password,
        warning: 'PENTING: Simpan password ini dengan aman dan berikan kepada user. User WAJIB mengubah password saat login pertama kali.'
    };
};

/**
 * Update user role (Admin function)
 * 
 * @param {string} adminId - Admin user ID
 * @param {string} userId - Target user ID
 * @param {string} newRole - New role
 * @returns {Object} - Updated user
 */
const updateUserRole = async (adminId, userId, newRole) => {
    // Validate role
    const validRoles = ['KUA', 'OPERATOR_DUKCAPIL', 'VERIFIKATOR_DUKCAPIL', 'KEMENAG', 'ADMIN'];
    if (!validRoles.includes(newRole)) {
        throw new AppError(`Role tidak valid. Role yang diperbolehkan: ${validRoles.join(', ')}`, 400);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new AppError('User tidak ditemukan', 404);
    }

    const oldRole = user.role;

    // Update role
    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            role: newRole
        },
        select: {
            id: true,
            username: true,
            full_name: true,
            role: true,
            nip: true,
            kecamatan: true
        }
    });

    logger.info(`Admin ${adminId} updated user ${userId} role from ${oldRole} to ${newRole}`);

    return {
        message: 'Role berhasil diupdate',
        user: updated,
        changes: {
            old_role: oldRole,
            new_role: newRole
        }
    };
};

/**
 * Get system health status
 * 
 * @returns {Object} - System health information
 */
const getSystemHealth = async () => {
    const health = {
        status: 'healthy',
        timestamp: new Date(),
        checks: {}
    };

    try {
        // Check database connection
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const dbTime = Date.now() - dbStart;

        health.checks.database = {
            status: 'healthy',
            response_time_ms: dbTime
        };

        // Check database counts
        const [userCount, submissionCount, logCount] = await Promise.all([
            prisma.user.count(),
            prisma.permohonan.count(),
            prisma.statusLog.count()
        ]);

        health.checks.database.counts = {
            users: userCount,
            submissions: submissionCount,
            logs: logCount
        };

    } catch (error) {
        health.status = 'unhealthy';
        health.checks.database = {
            status: 'unhealthy',
            error: error.message
        };
    }

    // System info
    health.system = {
        node_version: process.version,
        platform: process.platform,
        uptime_seconds: Math.floor(process.uptime()),
        memory_usage: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
        }
    };

    return health;
};

module.exports = {
    resetUserPassword,
    updateUserRole,
    getSystemHealth
};
