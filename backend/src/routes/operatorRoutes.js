const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

/**
 * Operator Routes
 * Base path: /api/v1/dukcapil/operator
 * Role: OPERATOR_DUKCAPIL only
 */

// All routes require authentication and OPERATOR_DUKCAPIL role
router.use(verifyToken, authorizeRole(['OPERATOR_DUKCAPIL']));

/**
 * Queue Management
 */
router.get('/queue', operatorController.getQueue);
router.post('/submissions/:id/assign', operatorController.assignSubmission);

/**
 * Processing
 */
router.get('/submissions/:id', operatorController.getDetail);
router.put('/submissions/:id/process', operatorController.processSubmission);
router.post('/submissions/:id/return', operatorController.returnToKUA);
router.post('/submissions/:id/send-verification', operatorController.sendToVerification);

/**
 * Reports
 */
router.get('/reports', operatorController.getReports);

module.exports = router;
