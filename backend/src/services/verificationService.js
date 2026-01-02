const prisma = require('../config/database');

const getQueue = async (status = 'SUBMITTED', page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    // Handle status array or single string
    const whereClause = {};
    if (Array.isArray(status)) {
        whereClause.status = { in: status };
    } else {
        whereClause.status = status;
    }

    const [total, data] = await prisma.$transaction([
        prisma.permohonan.count({
            where: whereClause
        }),
        prisma.permohonan.findMany({
            where: whereClause,
            include: {
                data_pernikahan: true,
                creator: { select: { full_name: true } }
            },
            orderBy: { created_at: 'desc' }, // Descending for history/queue usually better? or keep FIFO? 
            // Queue is FIFO (oldest first). History is LIFO (newest first).
            // For now let's keep it simple. If status is SUBMITTED, maybe FIFO.
            // If History, LIFO.
            // Let's stick to what it was or improve? 
            // The original code had: orderBy: { created_at: 'asc' }, // FIFO
            // For Queue (SUBMITTED), FIFO is correct (First In First Out).
            // For History, we usually want most recent.
            // Let's make it conditional?
            // "orderBy: Array.isArray(status) ? { created_at: 'desc' } : { created_at: 'asc' }"
            // Assuming array implies History.
            skip,
            take: limit
        })
    ]);

    return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};

const lockSubmission = async (id, userId) => {
    const submission = await prisma.permohonan.findUnique({ where: { id } });

    if (!submission) {throw new Error('Submission not found');}
    if (submission.status !== 'SUBMITTED') {throw new Error('Submission is not in SUBMITTED state');}
    if (submission.current_assignee_id && submission.current_assignee_id !== userId) {throw new Error('Submission is already locked by another operator');}

    // Update to PROCESSING and Assign
    return await prisma.$transaction([
        prisma.permohonan.update({
            where: { id },
            data: {
                status: 'PROCESSING',
                current_assignee_id: userId
            }
        }),
        prisma.statusLog.create({
            data: {
                permohonan_id: id,
                actor_id: userId,
                previous_status: 'SUBMITTED',
                new_status: 'PROCESSING',
                notes: 'Locked for verification'
            }
        })
    ]);
};

const verifySubmission = async (id, userId, decision, notes) => {
    // decision: APPROVED or REJECTED
    if (!['APPROVED', 'REJECTED'].includes(decision)) {throw new Error('Invalid decision');}

    const submission = await prisma.permohonan.findUnique({ where: { id } });
    if (!submission) {throw new Error('Submission not found');}
    if (submission.status !== 'PROCESSING') {throw new Error('Submission must be in PROCESSING state to verify');}
    if (submission.current_assignee_id !== userId) {throw new Error('You are not the assignee of this submission');}

    // Update Status
    const result = await prisma.$transaction([
        prisma.permohonan.update({
            where: { id },
            data: {
                status: decision,
                current_assignee_id: null // Release lock upon completion
            }
        }),
        prisma.statusLog.create({
            data: {
                permohonan_id: id,
                actor_id: userId,
                previous_status: 'PROCESSING',
                new_status: decision,
                notes: notes
            }
        })
    ]);

    return result[0];
};

module.exports = {
    getQueue,
    lockSubmission,
    verifySubmission
};
