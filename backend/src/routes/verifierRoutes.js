const express = require('express');
const router = express.Router();
const verifierController = require('../controllers/verifierController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

/**
 * Verifier Routes
 * Base path: /api/v1/dukcapil/verifier
 * Role: VERIFIKATOR_DUKCAPIL only
 */

// All routes require authentication and VERIFIKATOR_DUKCAPIL role
router.use(verifyToken, authorizeRole(['VERIFIKATOR_DUKCAPIL']));

/**
 * Queue Management
 */
router.get('/queue', verifierController.getQueue);
router.get('/submissions/:id', verifierController.getDetail);

/**
 * Verification Actions
 */
router.post('/submissions/:id/approve', verifierController.approve);
router.post('/submissions/:id/reject', verifierController.reject);

/**
 * Reports
 */
router.get('/reports', verifierController.getReports);

module.exports = router;
