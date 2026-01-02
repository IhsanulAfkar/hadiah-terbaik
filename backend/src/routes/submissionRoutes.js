const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Marriage Submission Management
 */

/**
 * @swagger
 * /submissions:
 *   post:
 *     summary: Create New Submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data_pernikahan:
 *                 type: string
 *                 description: JSON string of marriage details
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Submission created successfully
 */
router.post('/',
    verifyToken,
    authorizeRole(['KUA']),
    upload.any(), // Accepts multiple files
    submissionController.create
);

/**
 * @swagger
 * /submissions/{id}:
 *   put:
 *     summary: Update Submission (Revision)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data_pernikahan:
 *                  type: string
 *     responses:
 *       200:
 *         description: Submission updated
 */
router.put('/:id',
    verifyToken,
    authorizeRole(['KUA']),
    upload.any(),
    submissionController.update
);

/**
 * @swagger
 * /submissions/my:
 *   get:
 *     summary: Get My Submissions
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user submissions
 */
router.get('/my',
    verifyToken,
    authorizeRole(['KUA']),
    submissionController.listMy
);

/**
 * @swagger
 * /submissions/{id}:
 *   get:
 *     summary: Get Submission Detail
 *     tags: [Submissions]
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
 *         description: Submission details
 */
router.get('/:id',
    verifyToken,
    submissionController.detail
);

/**
 * @swagger
 * /submissions/document/{filename}:
 *   get:
 *     summary: Download Document
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 */
router.get('/document/:filename',
    verifyToken,
    submissionController.download
);

module.exports = router;
