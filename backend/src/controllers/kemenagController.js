const kemenagService = require('../services/kemenagService');

/**
 * Kemenag Controller
 * Handles all monitoring and statistics endpoints for Kemenag role
 */

/**
 * Get KUA statistics
 * GET /api/v1/kemenag/statistics/kua
 */
const getKUAStats = async (req, res) => {
    try {
        const kuaId = req.query.kua_id || null;
        const period = req.query.period || 'month';

        const result = await kemenagService.getKUAStatistics(kuaId, period);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get Kecamatan statistics
 * GET /api/v1/kemenag/statistics/kecamatan
 */
const getKecamatanStats = async (req, res) => {
    try {
        const kecamatanId = req.query.kecamatan_id || null;
        const period = req.query.period || 'month';

        const result = await kemenagService.getKecamatanStatistics(kecamatanId, period);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get performance report
 * GET /api/v1/kemenag/reports/performance
 */
const getPerformanceReport = async (req, res) => {
    try {
        const period = req.query.period || 'month';
        const format = req.query.format || 'json';

        const result = await kemenagService.getPerformanceReport(period, format);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all submissions (read-only)
 * GET /api/v1/kemenag/submissions
 */
const getAllSubmissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const filters = {
            status: req.query.status || null,
            kecamatan_id: req.query.kecamatan_id || null,
            start_date: req.query.start_date || null,
            end_date: req.query.end_date || null
        };

        // Remove null filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === null || filters[key] === 'null') {
                delete filters[key];
            }
        });

        const result = await kemenagService.getAllSubmissions(filters, page);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getKUAStats,
    getKecamatanStats,
    getPerformanceReport,
    getAllSubmissions
};
