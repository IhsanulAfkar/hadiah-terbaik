const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const reportController = require('../controllers/reportController');
const masterController = require('../controllers/masterController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard Statistics
 *   - name: Reports
 *     description: Report Exporting
 *   - name: Master
 *     description: Master Data
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get Dashboard Statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard/stats', verifyToken, dashboardController.getStats);

/**
 * @swagger
 * /reports/export:
 *   get:
 *     summary: Export Report to PDF/Excel
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *         required: true
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *     responses:
 *       200:
 *         description: Binary file
 */
router.get('/reports/export', verifyToken, reportController.exportReport);
router.get('/reports/export/kemenag', verifyToken, authorizeRole(['KEMENAG', 'ADMIN']), reportController.exportReportKemenag);
router.get('/reports/export/kemenag/summary', verifyToken, authorizeRole(['KEMENAG', 'ADMIN']), reportController.exportKemenagSummary);

/**
 * @swagger
 * /master/districts:
 *   get:
 *     summary: Get All Districts (Kecamatan)
 *     tags: [Master]
 *     responses:
 *       200:
 *         description: List of districts
 */
router.get('/master/districts', masterController.getDistricts);

module.exports = router;
