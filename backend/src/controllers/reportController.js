const reportService = require('../services/reportService');
const logger = require('../utils/logger');

const exportReport = async (req, res) => {
    try {
        const { format, period } = req.query; // format: 'pdf' | 'excel'
        const role = req.user.role;
        const userId = req.user.id;

        const data = await reportService.getReportData(role, userId, period);

        if (format === 'pdf') {
            await reportService.generatePdf(data, res, period);
        } else if (format === 'excel') {
            await reportService.generateExcel(data, res, period);
        } else {
            res.status(400).json({ success: false, message: 'Invalid format. Use pdf or excel.' });
        }

    } catch (error) {
        logger.error('Export Report Error:', error);
        res.status(500).json({ success: false, message: 'Error generating report' });
    }
};

module.exports = {
    exportReport
};
