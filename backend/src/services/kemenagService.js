const prisma = require('../config/database');
const AppError = require('../utils/AppError');

/**
 * Kemenag Service - Handles monitoring and statistics for Kemenag role
 * Role: KEMENAG (Read-only access)
 */

/**
 * Get statistics per KUA
 * 
 * @param {string} kuaId - Optional KUA user ID filter
 * @param {string} period - Time period (week, month, year, all)
 * @returns {Object} - KUA statistics
 */
const getKUAStatistics = async (kuaId = null, period = 'month') => {
    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = new Date(0); // All time
    }

    const where = {
        created_at: {
            gte: startDate
        }
    };

    if (kuaId) {
        where.user_id = kuaId;
    }

    // Get all submissions with grouping
    const submissions = await prisma.permohonan.findMany({
        where,
        include: {
            creator: {
                select: {
                    id: true,
                    full_name: true,
                    kecamatan: true
                }
            }
        }
    });

    // Group by status
    const byStatus = submissions.reduce((acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1;
        return acc;
    }, {});

    // Group by KUA
    const byKUA = submissions.reduce((acc, sub) => {
        const kuaName = sub.creator.full_name;
        if (!acc[kuaName]) {
            acc[kuaName] = {
                total: 0,
                approved: 0,
                rejected: 0,
                pending: 0,
                kecamatan: sub.creator.kecamatan?.nama || 'N/A'
            };
        }
        acc[kuaName].total++;
        if (sub.status === 'APPROVED') acc[kuaName].approved++;
        if (sub.status === 'REJECTED') acc[kuaName].rejected++;
        if (['SUBMITTED', 'PROCESSING', 'PENDING_VERIFICATION'].includes(sub.status)) {
            acc[kuaName].pending++;
        }
        return acc;
    }, {});

    return {
        period,
        total_submissions: submissions.length,
        by_status: byStatus,
        by_kua: byKUA
    };
};

/**
 * Get statistics per Kecamatan
 * 
 * @param {string} kecamatanId - Optional kecamatan ID filter
 * @param {string} period - Time period (week, month, year, all)
 * @returns {Object} - Kecamatan statistics
 */
const getKecamatanStatistics = async (kecamatanId = null, period = 'month') => {
    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = new Date(0); // All time
    }

    // Build where clause
    const where = {
        created_at: {
            gte: startDate
        }
    };

    if (kecamatanId) {
        where.creator = {
            kecamatan_id: kecamatanId
        };
    }

    // Get submissions with kecamatan info
    const submissions = await prisma.permohonan.findMany({
        where,
        include: {
            creator: {
                select: {
                    id: true,
                    full_name: true,
                    kecamatan: true
                }
            }
        }
    });

    // Group by kecamatan
    const byKecamatan = submissions.reduce((acc, sub) => {
        const kecamatanName = sub.creator.kecamatan?.nama || 'Tidak ada kecamatan';
        if (!acc[kecamatanName]) {
            acc[kecamatanName] = {
                total: 0,
                approved: 0,
                rejected: 0,
                pending: 0,
                processing: 0
            };
        }
        acc[kecamatanName].total++;
        if (sub.status === 'APPROVED') acc[kecamatanName].approved++;
        if (sub.status === 'REJECTED') acc[kecamatanName].rejected++;
        if (['SUBMITTED', 'NEEDS_REVISION'].includes(sub.status)) acc[kecamatanName].pending++;
        if (['PROCESSING', 'PENDING_VERIFICATION'].includes(sub.status)) acc[kecamatanName].processing++;
        return acc;
    }, {});

    return {
        period,
        total_submissions: submissions.length,
        by_kecamatan: byKecamatan
    };
};

/**
 * Get overall performance report
 * 
 * @param {string} period - Time period (week, month, year, all)
 * @param {string} format - Output format (json, summary)
 * @returns {Object} - Performance report
 */
const getPerformanceReport = async (period = 'month', format = 'json') => {
    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = new Date(0); // All time
    }

    // Get overall statistics
    const [totalSubmissions, byStatus, avgProcessingTime] = await Promise.all([
        // Total submissions
        prisma.permohonan.count({
            where: {
                created_at: { gte: startDate }
            }
        }),

        // Count by status
        prisma.permohonan.groupBy({
            by: ['status'],
            _count: {
                id: true
            },
            where: {
                created_at: { gte: startDate }
            }
        }),

        // Average processing time (from SUBMITTED to APPROVED/REJECTED)
        prisma.permohonan.findMany({
            where: {
                status: {
                    in: ['APPROVED', 'REJECTED']
                },
                created_at: { gte: startDate }
            },
            select: {
                created_at: true,
                updated_at: true
            }
        })
    ]);

    // Calculate average processing time
    const avgTime = avgProcessingTime.length > 0
        ? avgProcessingTime.reduce((acc, sub) => {
            const diff = sub.updated_at - sub.created_at;
            return acc + diff;
        }, 0) / avgProcessingTime.length
        : 0;

    const avgDays = Math.round(avgTime / (1000 * 60 * 60 * 24));

    // Format status counts
    const statusCounts = {};
    byStatus.forEach(({ status, _count }) => {
        statusCounts[status] = _count.id;
    });

    // Calculate completion rate
    const completed = (statusCounts.APPROVED || 0) + (statusCounts.REJECTED || 0);
    const completionRate = totalSubmissions > 0
        ? ((completed / totalSubmissions) * 100).toFixed(2)
        : 0;

    const report = {
        period,
        generated_at: new Date(),
        overview: {
            total_submissions: totalSubmissions,
            completed: completed,
            completion_rate: `${completionRate}%`,
            avg_processing_days: avgDays
        },
        by_status: statusCounts,
        performance_indicators: {
            approved: statusCounts.APPROVED || 0,
            rejected: statusCounts.REJECTED || 0,
            pending: (statusCounts.SUBMITTED || 0) + (statusCounts.NEEDS_REVISION || 0),
            in_process: (statusCounts.PROCESSING || 0) + (statusCounts.PENDING_VERIFICATION || 0)
        }
    };

    return report;
};

/**
 * Get all submissions (read-only for monitoring)
 * 
 * @param {Object} filters - Filter options (status, kecamatan, date range)
 * @param {number} page - Page number for pagination
 * @returns {Object} - Paginated list of submissions
 */
const getAllSubmissions = async (filters = {}, page = 1) => {
    const limit = 20;
    const skip = (page - 1) * limit;

    const where = {};

    // Apply filters
    if (filters.status) {
        where.status = Array.isArray(filters.status)
            ? { in: filters.status }
            : filters.status;
    }

    if (filters.kecamatan_id) {
        where.creator = {
            kecamatan_id: filters.kecamatan_id
        };
    }

    if (filters.start_date || filters.end_date) {
        where.created_at = {};
        if (filters.start_date) {
            where.created_at.gte = new Date(filters.start_date);
        }
        if (filters.end_date) {
            where.created_at.lte = new Date(filters.end_date);
        }
    }

    const [submissions, total] = await Promise.all([
        prisma.permohonan.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                created_at: 'desc'
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        full_name: true,
                        username: true,
                        kecamatan: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        full_name: true,
                        role: true
                    }
                },
                data_pernikahan: true
            }
        }),
        prisma.permohonan.count({ where })
    ]);

    return {
        data: submissions,
        pagination: {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_items: total,
            items_per_page: limit
        },
        filters: filters
    };
};

module.exports = {
    getKUAStatistics,
    getKecamatanStatistics,
    getPerformanceReport,
    getAllSubmissions
};
