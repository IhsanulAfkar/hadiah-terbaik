const prisma = require('../config/database');
const logger = require('../utils/logger');

const getDistricts = async (req, res) => {
    try {
        // Fallback static data if DB is empty
        const count = await prisma.kecamatan.count();
        if (count === 0) {
            return res.json({
                success: true,
                data: [
                    { kode: '35.19.01', nama: 'KEBONSARI' },
                    { kode: '35.19.02', nama: 'GEGER' },
                    { kode: '35.19.03', nama: 'DOLOPO' },
                    { kode: '35.19.04', nama: 'DAGANGAN' },
                    { kode: '35.19.05', nama: 'WUNGU' },
                    { kode: '35.19.06', nama: 'KARE' },
                    { kode: '35.19.07', nama: 'GEMARANG' },
                    { kode: '35.19.08', nama: 'SARADAN' },
                    { kode: '35.19.09', nama: 'PILANGKENCENG' },
                    { kode: '35.19.10', nama: 'MEJAYAN' },
                    { kode: '35.19.11', nama: 'WONOASRI' },
                    { kode: '35.19.12', nama: 'BALEREJO' },
                    { kode: '35.19.13', nama: 'MADIUN' },
                    { kode: '35.19.14', nama: 'SAWAHAN' },
                    { kode: '35.19.15', nama: 'JIWAN' }
                ]
            });
        }

        const districts = await prisma.kecamatan.findMany({
            orderBy: { nama: 'asc' }
        });

        res.json({ success: true, data: districts });
    } catch (error) {
        logger.error('Master Data Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching master data' });
    }
};

module.exports = {
    getDistricts
};
