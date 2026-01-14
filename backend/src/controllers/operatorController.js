const operatorService = require('../services/operatorService');

/**
 * Operator Controller
 * Handles all operator-related endpoints
 */

/**
 * Get operator queue
 * GET /api/v1/dukcapil/operator/queue
 */
const getQueue = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let status = req.query.status || 'SUBMITTED';

        // Support multiple statuses (e.g. ?status=SUBMITTED,PROCESSING)
        if (status.includes(',')) {
            status = status.split(',');
        }

        const mine = req.query.mine === 'true';
        const assigneeId = mine ? req.user.id : null;

        const result = await operatorService.getQueue(status, page, assigneeId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Assign submission to operator
 * POST /api/v1/dukcapil/operator/submissions/:id/assign
 */
const assignSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await operatorService.assignSubmission(id, req.user.id, req.user.role);
        res.json({
            success: true,
            message: 'Pengajuan berhasil diklaim',
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
 * Get submission detail
 * GET /api/v1/dukcapil/operator/submissions/:id
 */
const getDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const submissionService = require('../services/submissionService');
        const result = await submissionService.getSubmissionById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Pengajuan tidak ditemukan'
            });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Process submission
 * PUT /api/v1/dukcapil/operator/submissions/:id/process
 */
const processSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const result = await operatorService.processSubmission(id, req.user.id, data);
        res.json({
            success: true,
            message: 'Pengajuan berhasil diproses',
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
 * Return submission to KUA
 * POST /api/v1/dukcapil/operator/submissions/:id/return
 */
const returnToKUA = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Alasan pengembalian wajib diisi'
            });
        }

        const result = await operatorService.returnToKUA(id, req.user.id, reason);
        res.json({
            success: true,
            message: 'Pengajuan dikembalikan ke KUA',
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
 * Send to verification
 * POST /api/v1/dukcapil/operator/submissions/:id/send-verification
 */
const sendToVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const result = await operatorService.sendToVerification(id, req.user.id, notes);
        res.json({
            success: true,
            message: 'Pengajuan dikirim ke verifikator',
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
 * Get operator reports
 * GET /api/v1/dukcapil/operator/reports
 */
const getReports = async (req, res) => {
    try {
        const period = req.query.period || 'month';
        const result = await operatorService.getOperatorReports(req.user.id, period);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getQueue,
    assignSubmission,
    getDetail,
    processSubmission,
    returnToKUA,
    sendToVerification,
    getReports
};
