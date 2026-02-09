const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const prisma = require('../config/database');

const getReportData = async (role, userId, period) => {
    const where = {};

    // Role Filter
    if (role === 'KUA') {
        // KUA: only their own submissions (all statuses)
        where.user_id = userId;
    } else if (role === 'DUKCAPIL') {
        // Dukcapil: only verified submissions
        where.status = {
            in: ['APPROVED', 'REJECTED', 'NEEDS_REVISION']
        };
    }
    // Admin: see all submissions (no additional filter)

    // Period Filter
    if (period && period !== 'all') {
        const now = new Date();
        const startDate = new Date();

        if (period === 'week') {
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        } else if (period === 'year') {
            startDate.setFullYear(now.getFullYear() - 1);
        }

        where.created_at = { gte: startDate };
    }

    return await prisma.permohonan.findMany({
        where,
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
};

const generatePdf = async (data, res, period = 'all') => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Pengajuan_${Date.now()}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Laporan Verifikasi Pernikahan', { align: 'center' });

    // Period info
    const periodLabels = {
        week: '7 Hari Terakhir',
        month: '30 Hari Terakhir',
        year: '1 Tahun Terakhir',
        all: 'Semua Data'
    };
    doc.fontSize(10).text(`Periode: ${periodLabels[period] || 'Semua Data'}`, { align: 'center' });
    doc.fontSize(12).text(`Total Data: ${data.length}`, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 150;
    const itemHeight = 30;

    let y = tableTop;

    doc.fontSize(10);
    doc.text('Tiket', 50, y);
    doc.text('Pasangan', 150, y);
    doc.text('Tanggal', 300, y);
    doc.text('Status', 450, y);

    y += 20;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Table Rows
    data.forEach(item => {
        if (y > 700) {
            doc.addPage();
            y = 50;
        }

        doc.text(item.ticket_number, 50, y);
        doc.text(`${item.data_pernikahan?.husband_name || '-'} & ${item.data_pernikahan?.wife_name || '-'}`, 150, y);
        doc.text(new Date(item.created_at).toLocaleDateString(), 300, y);
        doc.text(item.status, 450, y);

        y += itemHeight;
    });

    doc.end();
};

const generateExcel = async (data, res, period = 'all') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan');

    // Add title and period
    const periodLabels = {
        week: '7 Hari Terakhir',
        month: '30 Hari Terakhir',
        year: '1 Tahun Terakhir',
        all: 'Semua Data'
    };

    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'Laporan Verifikasi Pernikahan';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Periode: ${periodLabels[period] || 'Semua Data'} | Total: ${data.length} data`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Add empty row
    worksheet.addRow([]);

    worksheet.columns = [
        { header: 'No Tiket', key: 'ticket', width: 20 },
        { header: 'Suami', key: 'husband', width: 25 },
        { header: 'Istri', key: 'wife', width: 25 },
        { header: 'Tanggal Pengajuan', key: 'date', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Validator', key: 'validator', width: 20 },
    ];

    data.forEach(item => {
        worksheet.addRow({
            ticket: item.ticket_number,
            husband: item.data_pernikahan?.husband_name || '-',
            wife: item.data_pernikahan?.wife_name || '-',
            date: new Date(item.created_at).toLocaleDateString(),
            status: item.status,
            validator: item.current_assignee_id || '-'
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};

module.exports = {
    getReportData,
    generatePdf,
    generateExcel
};
