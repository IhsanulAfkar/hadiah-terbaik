const { Status } = require('@prisma/client');
const prisma = require('../config/database');
const kemenagService = require('../services/kemenagService');
const { getPeriodDate } = require('../utils/helper');

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
		const kecamatanKode = (req.query.kode_kecamatan ?? '')
			.toString()
			.split(',')
			.map(id => id.trim())
			.filter(Boolean)
		const result = await kemenagService.getPerformanceReport(period, format, kecamatanKode);
		console.log(result)
		res.json({ success: true, data: result });
	} catch (error) {
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message
		});
	}
};
const getReport = async (req, res) => {
	try {
		const period = req.query.period
		const kecamatanKode = (req.query.kode_kecamatan ?? '')
			.toString()
			.split(',')
			.map(id => id.trim())
			.filter(Boolean)
		const periodDate = getPeriodDate(period)
		const kecamatans = await prisma.kecamatan.findMany({
			where: kecamatanKode.length
				? {
					kode: {
						in: kecamatanKode
					}
				}
				: undefined,
			select: {
				id: true,
				nama: true
			},
			orderBy: {
				nama: 'asc'
			}
		})

		const result = await prisma.permohonan.groupBy({
			by: ['user_id', 'status'],
			_count: {
				_all: true
			},
			where: {
				created_at: {
					gte: periodDate
				},
			},

		})
		const creatorIds = [...new Set(result.map(g => g.user_id))]

		const users = await prisma.user.findMany({
			where: {
				id: { in: creatorIds }
			},
			select: {
				id: true,
				kecamatan: {
					select: {
						id: true,
						nama: true
					}
				}
			}
		})
		const userKecamatanMap = Object.fromEntries(
			users
				.filter(u => u.kecamatan)
				.map(u => [u.id, u.kecamatan])
		)
		const statuses = Object.values(Status)

		const resultMap = {}

		for (const kec of kecamatans) {
			resultMap[kec.id] = {
				kecamatan_id: kec.id,
				kecamatan_name: kec.nama,
				total: 0
			}

			statuses.forEach(status => {
				resultMap[kec.id][status.toLowerCase()] = 0
			})
		}

		for (const row of result) {
			const kecamatan = userKecamatanMap[row.user_id]
			if (!kecamatan) continue

			const data = resultMap[kecamatan.id]
			// console.log('tes', row.status, data)
			if (data) {
				data[row?.status?.toLowerCase()] += row._count._all
				data.total += row._count._all
			}
		}
		const output = Object.values(resultMap)

		res.json({ success: true, data: output });
	} catch (error) {
		console.error(error)
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message
		});
	}
}

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
	getAllSubmissions,
	getReport
};
