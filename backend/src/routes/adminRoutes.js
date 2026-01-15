const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrator Management API
 */

// Global Middleware: Only ADMIN
router.use(verifyToken, authorizeRole(['ADMIN']));

// --- User Management ---

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List All Users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by username, name, or NIP
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', adminController.getUsers);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create New User
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, full_name, role, nip]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *               full_name: { type: string }
 *               nip: { type: string }
 *               role: { type: string, enum: [KUA, OPERATOR_DUKCAPIL, VERIFIKATOR_DUKCAPIL, KEMENAG, ADMIN] }
 *               kecamatan_id: { type: string }
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/users', adminController.createUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update User
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               role: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete User
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', adminController.deleteUser);

// --- Master Data ---

/**
 * @swagger
 * /admin/master/districts:
 *   post:
 *     summary: Create District
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kode, nama]
 *             properties:
 *               kode: { type: string }
 *               nama: { type: string }
 *     responses:
 *       201:
 *         description: District created
 */
router.post('/master/districts', adminController.createDistrict);

/**
 * @swagger
 * /admin/master/districts/{id}:
 *   put:
 *     summary: Update District
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: District updated
 */
router.put('/master/districts/:id', adminController.updateDistrict);

/**
 * @swagger
 * /admin/master/districts:
 *   get:
 *     summary: List Districts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of districts
 */
router.get('/master/districts', adminController.getDistricts);

/**
 * @swagger
 * /admin/master/districts/{id}:
 *   delete:
 *     summary: Delete District
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: District deleted
 */
router.delete('/master/districts/:id', adminController.deleteDistrict);

/**
 * @swagger
 * /admin/users/{id}/reset-password:
 *   put:
 *     summary: Reset User Password
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_password: { type: string }
 *     responses:
 *       200:
 *         description: Password reset
 */
router.put('/users/:id/reset-password', adminController.resetUserPassword);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   put:
 *     summary: Update User Role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [KUA, OPERATOR_DUKCAPIL, VERIFIKATOR_DUKCAPIL, KEMENAG, ADMIN] }
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put('/users/:id/role', adminController.updateUserRole);

// --- Logs ---

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: View System Logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System logs
 */
router.get('/logs', adminController.getLogs);

/**
 * @swagger
 * /admin/system/health:
 *   get:
 *     summary: Get System Health Status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health information
 */
router.get('/system/health', adminController.getSystemHealth);

/**
 * @swagger
 * /admin/system/purge-submissions:
 *   delete:
 *     summary: Force Delete All Submission Data (DANGEROUS)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All submissions purged
 */
router.delete('/system/purge-submissions', adminController.purgeSubmissions);

module.exports = router;
