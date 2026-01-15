const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// --- User Management ---

const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            AND: [
                role ? { role } : {},
                search ? {
                    OR: [
                        { username: { contains: search, mode: 'insensitive' } },
                        { full_name: { contains: search, mode: 'insensitive' } },
                        { nip: { contains: search, mode: 'insensitive' } }
                    ]
                } : {}
            ]
        };

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    nip: true,
                    role: true,
                    kecamatan: { select: { nama: true } },
                    created_at: true
                    // Exclude password
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Admin Get Users Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, full_name, nip, role, kecamatan_id } = req.body;

        // Basic validation
        if (!username || !password || !full_name || !role) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check duplicates
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    ...(nip ? [{ nip }] : [])
                ]
            }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Username or NIP already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                full_name,
                nip: nip || null,
                role,
                kecamatan_id: kecamatan_id || null
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPass } = newUser;

        res.status(201).json({ success: true, data: userWithoutPass });
    } catch (error) {
        logger.error('Admin Create User Error:', error);
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, role, kecamatan_id, password } = req.body;

        const dataToUpdate = { full_name, role, kecamatan_id };

        // If password provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            select: { id: true, username: true, full_name: true, role: true }
        });

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        logger.error('Admin Update User Error:', error);
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        logger.error('Admin Delete User Error:', error);
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
};

// --- Master Data (Kecamatan) ---

const createDistrict = async (req, res) => {
    try {
        const { kode, nama } = req.body;
        const district = await prisma.kecamatan.create({ data: { kode, nama } });
        res.status(201).json({ success: true, data: district });
    } catch (error) {
        logger.error('Create District Error:', error);
        res.status(500).json({ success: false, message: 'Error creating district' });
    }
};

const updateDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode, nama } = req.body;
        const district = await prisma.kecamatan.update({
            where: { id },
            data: { kode, nama }
        });
        res.json({ success: true, data: district });
    } catch (error) {
        logger.error('Update District Error:', error);
        res.status(500).json({ success: false, message: 'Error updating district' });
    }
};

const getDistricts = async (req, res) => {
    try {
        const districts = await prisma.kecamatan.findMany({
            orderBy: { nama: 'asc' }
        });
        res.json({ success: true, data: districts });
    } catch (error) {
        logger.error('Get Districts Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching districts' });
    }
};

const deleteDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.kecamatan.delete({ where: { id } });
        res.json({ success: true, message: 'District deleted' });
    } catch (error) {
        logger.error('Delete District Error:', error);
        res.status(500).json({ success: false, message: 'Error deleting district' });
    }
};

// --- System Logs ---

const getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, actor_id, search = '', role } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            AND: [
                actor_id ? { actor_id } : {},
                role ? { actor: { role: role } } : {},
                search ? {
                    OR: [
                        { notes: { contains: search, mode: 'insensitive' } },
                        { permohonan: { ticket_number: { contains: search, mode: 'insensitive' } } }
                    ]
                } : {}
            ]
        };

        const logs = await prisma.statusLog.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { created_at: 'desc' },
            include: {
                actor: { select: { username: true, full_name: true, role: true } },
                permohonan: { select: { id: true, ticket_number: true } }
            }
        });

        const total = await prisma.statusLog.count({ where });

        res.json({
            success: true,
            data: logs,
            pagination: { total, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        logger.error('Get Logs Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching logs' });
    }
};

/**
 * Reset user password
 * PUT /api/v1/admin/users/:id/reset-password
 */
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        const adminService = require('../services/adminService');
        const result = await adminService.resetUserPassword(req.user.id, id, new_password);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update user role
 * PUT /api/v1/admin/users/:id/role
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role wajib diisi'
            });
        }

        const adminService = require('../services/adminService');
        const result = await adminService.updateUserRole(req.user.id, id, role);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get system health
 * GET /api/v1/admin/system/health
 */
const getSystemHealth = async (req, res) => {
    try {
        const adminService = require('../services/adminService');
        const result = await adminService.getSystemHealth();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * DANGEROUS: Force delete all submission data
 * Useful for development cleanup
 */
const purgeSubmissions = async (req, res) => {
    try {
        // Since we have Cascade Delete in the schema, 
        // deleting Permohonan will delete DataPernikahan, Dokumen, and StatusLog
        const { count } = await prisma.permohonan.deleteMany({});

        logger.warn(`ADMIN ${req.user.id} PURGED ALL SUBMISSIONS: ${count} records deleted`);

        res.json({
            success: true,
            message: `Berhasil menghapus semua data pengajuan (${count} record)`,
            count
        });
    } catch (error) {
        logger.error('Purge Submissions Error:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data' });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    createDistrict,
    updateDistrict,
    getDistricts,
    deleteDistrict,
    getLogs,
    resetUserPassword,
    updateUserRole,
    getSystemHealth,
    purgeSubmissions
};
