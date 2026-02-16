const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * KUA Routes
 * Base path: /api/v1/kua
 * Role: KUA only
 */
router.get('/scenarios', verifyToken, authorizeRole(["OPERATOR_DUKCAPIL", "VERIFIKATOR_DUKCAPIL", 'KUA']), (req, res) => {
    const { getAllScenarios } = require('../utils/mouScenarios');
    res.json({ success: true, data: getAllScenarios() });
});
// All routes require authentication and KUA role
router.use(verifyToken, authorizeRole(['KUA']));

/**
 * Submissions
 */
router.post('/submissions', upload.any(), submissionController.create);
router.put('/submissions/:id', upload.any(), submissionController.update);
router.post('/submissions/:id/submit', submissionController.submitDraft);
router.get('/submissions', submissionController.listMy);
router.get('/submissions/:id', submissionController.detail);

/**
 * Documents
 */
router.post('/submissions/:id/documents', upload.any(), submissionController.update); // Reuse update for adding docs
router.delete('/documents/:id', submissionController.deleteDocument);

/**
 * MOU Scenarios (for dropdown)
 */


/**
 * Reports
 */
router.get('/reports/submissions', submissionController.listMy); // KUA reports = their own submissions

module.exports = router;
