const dashboardService = require('../services/dashboardService');
const logger = require('../utils/logger');

const getStats = async (req, res) => {
    try {
        let stats;
        const role = req.user.role;

        if (role === 'KUA') {
            stats = await dashboardService.getKuaStats(req.user.id);
        } else if (role === 'DUKCAPIL') {
            stats = await dashboardService.getDukcapilStats();
        } else {
            return res.status(403).json({ success: false, message: 'Role not supported for dashboard stats' });
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        logger.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
    }
};

module.exports = {
    getStats
};
