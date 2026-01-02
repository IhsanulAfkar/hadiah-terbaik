const verificationService = require('../services/verificationService');

const getQueue = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let status = req.query.status || 'SUBMITTED';

        // Support multiple statuses (e.g. ?status=APPROVED,REJECTED)
        if (status.includes(',')) {
            status = status.split(',');
        }

        const result = await verificationService.getQueue(status, page);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const lock = async (req, res) => {
    try {
        const { id } = req.params;
        await verificationService.lockSubmission(id, req.user.id);
        res.json({ success: true, message: 'Locked successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const processDecision = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision, notes } = req.body;

        if (!process.body && !decision) {return res.status(400).json({ message: "Decision required" });}

        const result = await verificationService.verifySubmission(id, req.user.id, decision, notes);
        res.json({ success: true, message: `Submission ${decision}`, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getQueue,
    lock,
    processDecision
};
