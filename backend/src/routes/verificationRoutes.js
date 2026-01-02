const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: Dukcapil Verification API
 */

// Middleware for all routes: Only Dukcapil
router.use(verifyToken, authorizeRole(['DUKCAPIL']));

/**
 * @swagger
 * /verifications/queue:
 *   get:
 *     summary: Get Verification Queue
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Comma separated statuses (e.g. SUBMITTED,PROCESSING)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Queue list
 */
router.get('/queue', verificationController.getQueue);

/**
 * @swagger
 * /verifications/{id}/lock:
 *   post:
 *     summary: Lock Submission
 *     description: Lock a submission for processing by the current user
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Locked successfully
 */
router.post('/:id/lock', verificationController.lock);

/**
 * @swagger
 * /verifications/{id}/verify:
 *   post:
 *     summary: Process Verification Decision
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [APPROVED, REJECTED, NEEDS_REVISION]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Decision processed
 */
router.post('/:id/verify', verificationController.processDecision);

module.exports = router;
