const prisma = require('../config/database');

const getKuaStats = async (userId) => {
    // Group by status for specific user
    const groups = await prisma.permohonan.groupBy({
        by: ['status'],
        where: { user_id: userId },
        _count: {
            id: true
        }
    });

    const stats = {
        total: 0,
        pending: 0,
        rejected: 0,
        approved: 0
    };

    groups.forEach(group => {
        const count = group._count.id;
        const status = group.status;

        stats.total += count;

        if (['SUBMITTED', 'PROCESSING', 'DRAFT'].includes(status)) {
            stats.pending += count;
        } else if (['REJECTED', 'NEEDS_REVISION'].includes(status)) {
            stats.rejected += count;
        } else if (status === 'APPROVED') {
            stats.approved += count;
        }
    });

    return stats;
};

const getDukcapilStats = async () => {
    // Group by status globally
    const groups = await prisma.permohonan.groupBy({
        by: ['status'],
        _count: {
            id: true
        }
    });

    // Also get "Completed Today" count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = await prisma.permohonan.count({
        where: {
            status: { in: ['APPROVED', 'REJECTED'] },
            updated_at: { gte: today }
        }
    });

    const stats = {
        queue: 0,
        processing: 0,
        completedToday: completedToday
    };

    groups.forEach(group => {
        const count = group._count.id;
        const status = group.status;

        if (status === 'SUBMITTED') {
            stats.queue += count;
        } else if (status === 'PROCESSING') {
            stats.processing += count;
        }
    });

    return stats;
};

module.exports = {
    getKuaStats,
    getDukcapilStats
};
