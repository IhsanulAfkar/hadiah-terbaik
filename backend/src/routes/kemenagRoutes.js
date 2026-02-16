const express = require('express');
const router = express.Router();
const kemenagController = require('../controllers/kemenagController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

/**
 * Kemenag Routes
 * Base path: /api/v1/kemenag
 * Role: KEMENAG only
 */

// All routes require authentication and KEMENAG role
router.use(verifyToken, authorizeRole(['KEMENAG', 'ADMIN']));

/**
 * Statistics
 */
router.get('/statistics/kua', kemenagController.getKUAStats);
router.get('/statistics/kecamatan', kemenagController.getKecamatanStats);

/**
 * Reports
 */
router.get('/reports', kemenagController.getReport);
router.get('/reports/daily', kemenagController.getDailyStats);
router.get('/reports/performance', kemenagController.getPerformanceReport);
router.get('/reports/:id', kemenagController.getReportDetail);

/**
 * Submissions (Read-only)
 */
router.get('/submissions', kemenagController.getAllSubmissions);

module.exports = router;
