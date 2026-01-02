const submissionService = require('../services/submissionService');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const create = async (req, res) => {
    try {
        // req.body.data_pernikahan might be a JSON string if sent via FormData
        let dataPernikahan = req.body.data_pernikahan;
        if (typeof dataPernikahan === 'string') {
            try {
                dataPernikahan = JSON.parse(dataPernikahan);
            } catch {
                return res.status(400).json({ success: false, message: 'Invalid JSON for data_pernikahan' });
            }
        }

        const files = req.files; // Array of files from Multer

        const result = await submissionService.createSubmission(req.user.id, dataPernikahan, files);

        res.status(201).json({
            success: true,
            message: 'Permohonan submitted successfully',
            data: result
        });
    } catch (error) {
        logger.error('Submission Create Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error creating submission' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        let dataPernikahan = req.body.data_pernikahan;
        if (typeof dataPernikahan === 'string') {
            try {
                dataPernikahan = JSON.parse(dataPernikahan);
            } catch {
                return res.status(400).json({ success: false, message: 'Invalid JSON for data_pernikahan' });
            }
        }

        const files = req.files;
        const result = await submissionService.updateSubmission(id, req.user.id, dataPernikahan, files);

        res.json({
            success: true,
            message: 'Submission updated successfully',
            data: result
        });
    } catch (error) {
        logger.error('Update Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error updating submission' });
    }
};

const listMy = async (req, res) => {
    try {
        const result = await submissionService.getMySubmissions(req.user.id);
        res.json({ success: true, data: result });
    } catch (error) {
        // Log the error but don't expose it
        logger.error('List Submissions Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching submissions' });
    }
};

const detail = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await submissionService.getSubmissionById(id);

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        // Security Check: Only Creator, Dukcapil, or Admin can view
        if (req.user.role !== 'DUKCAPIL' && req.user.role !== 'ADMIN' && submission.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, data: submission });
    } catch (error) {
        logger.error('Detail Submission Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching submission detail' });
    }
};

const download = async (req, res) => {
    try {
        const { filename } = req.params;

        // Define upload directory relative to root /app/uploads
        // Since WORKDIR is /app, and structure is src/controllers
        // We want /app/uploads
        const uploadDir = path.resolve('/app/uploads');
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            logger.error(`[Download] File not found at: ${filePath}`);
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        // Check if inline viewing is requested
        const inline = req.query.inline === 'true';

        if (inline) {
            // For inline viewing (preview in browser)
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
            res.sendFile(filePath, (err) => {
                if (err && !res.headersSent) {
                    logger.error('[Download] SendFile error:', err);
                    res.status(500).json({ success: false, message: 'Error sending file' });
                }
            });
        } else {
            // For download
            res.download(filePath, (err) => {
                if (err && !res.headersSent) {
                    res.status(500).json({ success: false, message: 'Error sending file' });
                }
            });
        }
    } catch (error) {
        logger.error('[Download] Exception:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during download' });
    }
};

/**
 * Submit draft
 * POST /api/v1/kua/submissions/:id/submit
 */
const submitDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await submissionService.submitDraft(id, req.user.id);
        res.json({
            success: true,
            message: 'Pengajuan berhasil disubmit',
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete document
 * DELETE /api/v1/kua/documents/:id
 */
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await submissionService.deleteDocument(id, req.user.id);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    create,
    update,
    listMy,
    detail,
    download,
    submitDraft,
    deleteDocument
};
