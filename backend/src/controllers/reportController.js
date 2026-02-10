const prisma = require('../config/database');
const reportService = require('../services/reportService');
const { getPeriodDate } = require('../utils/helper');
const logger = require('../utils/logger');
const kemenagService = require('../services/kemenagService')
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
const exportReportKemenag = async (req, res) => {
    try {
        const { format, period, kecamatan } = req.query; // format: 'pdf' | 'excel'
        const periodDate = getPeriodDate(period)
        const data = await prisma.permohonan.findMany({
            where: {
                created_at: {
                    gte: periodDate
                },
                ...(kecamatan ? {
                    creator: {
                        kecamatan_id: kecamatan
                    }
                } : {})
            },
            include: {
                data_pernikahan: true,
                creator: {
                    select: {
                        full_name: true,
                        kecamatan: { select: { nama: true } }
                    }
                },
                assignee: { select: { full_name: true } }
            },
            orderBy: { created_at: 'desc' }
        });

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
const exportKemenagSummary = async (req, res) => {
    try {
        const { format, period, kode_kecamatan } = req.query; // format: 	const period = req.query.period
        const output = await kemenagService.getSubmissionSummary({
            period,
            kode_kecamatan
        })
        if (format === 'pdf') {
            await reportService.generatePdfSummaryKemenag(output, res, period);
        } else if (format === 'excel') {
            await reportService.generateExcelSummaryKemenag(output, res, period);
        } else {
            res.status(400).json({ success: false, message: 'Invalid format. Use pdf or excel.' });
        }

    } catch (error) {
        logger.error('Export Report Error:', error);
        res.status(500).json({ success: false, message: 'Error generating report' });
    }
};

module.exports = {
    exportReport,
    exportReportKemenag,
    exportKemenagSummary
};
