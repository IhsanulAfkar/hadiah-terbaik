const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const FSM = require('../utils/stateMachine');

/**
 * Verifier Service - Handles all verifier-related operations
 * Role: VERIFIKATOR_DUKCAPIL
 */

/**
 * Get verifier queue (submissions pending verification)
 * 
 * @param {string|string[]} status - Status filter (default: PENDING_VERIFICATION)
 * @param {number} page - Page number for pagination
 * @returns {Object} - Paginated list of submissions
 */
const getVerifierQueue = async (status = 'PENDING_VERIFICATION', page = 1) => {
    const limit = 10;
    const skip = (page - 1) * limit;

    // Normalize status to array
    const statuses = Array.isArray(status) ? status : [status];

    // Filter only statuses that verifiers can work with
    const validStatuses = ['PENDING_VERIFICATION', 'APPROVED', 'REJECTED'];
    const filteredStatuses = statuses.filter(s => validStatuses.includes(s));

    if (filteredStatuses.length === 0) {
        throw new AppError('Status tidak valid untuk verifier queue', 400);
    }

    const where = {
        status: {
            in: filteredStatuses
        }
    };

    const [submissions, total] = await Promise.all([
        prisma.permohonan.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                updated_at: 'asc' // Process oldest first
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        kecamatan: true
                    }
                },
                assignee: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true
                    }
                },
                data_pernikahan: true,
                dokumen: {
                    select: {
                        id: true,
                        doc_type: true,
                        file_name: true,
                        file_path: true,
                        uploaded_at: true
                    }
                },
                logs: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 5,
                    include: {
                        actor: {
                            select: {
                                id: true,
                                full_name: true,
                                role: true
                            }
                        }
                    }
                }
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
        }
    };
};

/**
 * Get submission detail (read-only for verifier)
 * 
 * @param {string} submissionId - Submission ID
 * @returns {Object} - Full submission details
 */
const getSubmissionDetail = async (submissionId) => {
    const submission = await prisma.permohonan.findUnique({
        where: { id: submissionId },
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    nip: true,
                    kecamatan: true
                }
            },
            assignee: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    nip: true
                }
            },
            data_pernikahan: true,
            dokumen: true,
            logs: {
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    actor: {
                        select: {
                            id: true,
                            full_name: true,
                            role: true
                        }
                    }
                }
            }
        }
    });

    if (!submission) {
        throw new AppError('Pengajuan tidak ditemukan', 404);
    }

    return submission;
};

/**
 * Approve submission
 * 
 * @param {string} submissionId - Submission ID
 * @param {string} verifierId - Verifier user ID
 * @param {string} notes - Optional approval notes
 * @returns {Object} - Updated submission
 */
const approveSubmission = async (submissionId, verifierId, notes = '') => {
    return await prisma.$transaction(async (tx) => {
        // Check if submission exists
        const submission = await tx.permohonan.findUnique({
            where: { id: submissionId }
        });

        if (!submission) {
            throw new AppError('Pengajuan tidak ditemukan', 404);
        }

        // Validate FSM transition
        FSM.validateTransition(submission.status, 'APPROVED', 'VERIFIKATOR_DUKCAPIL');

        // Update status to APPROVED
        const updated = await tx.permohonan.update({
            where: { id: submissionId },
            data: {
                status: 'APPROVED'
            },
            include: {
                creator: true,
                assignee: true,
                data_pernikahan: true
            }
        });

        // Create audit log
        await tx.statusLog.create({
            data: {
                permohonan_id: submissionId,
                actor_id: verifierId,
                previous_status: submission.status,
                new_status: 'APPROVED',
                notes: notes || 'Pengajuan disetujui oleh verifikator'
            }
        });

        logger.info(`Verifier ${verifierId} approved submission ${submissionId}`);

        return updated;
    });
};

/**
 * Reject submission
 * 
 * @param {string} submissionId - Submission ID
 * @param {string} verifierId - Verifier user ID
 * @param {string} reason - Rejection reason (REQUIRED)
 * @returns {Object} - Updated submission
 */
const rejectSubmission = async (submissionId, verifierId, reason) => {
    // Validate reason is provided
    if (!reason || reason.trim() === '') {
        throw new AppError('Alasan penolakan wajib diisi', 400);
    }

    // Check if submission exists
    const submission = await prisma.permohonan.findUnique({
        where: { id: submissionId }
    });

    if (!submission) {
        throw new AppError('Pengajuan tidak ditemukan', 404);
    }

    // Validate FSM transition
    FSM.validateTransition(submission.status, 'REJECTED', 'VERIFIKATOR_DUKCAPIL');

    // Update status to REJECTED
    const updated = await prisma.permohonan.update({
        where: { id: submissionId },
        data: {
            status: 'REJECTED'
        },
        include: {
            creator: true,
            assignee: true,
            data_pernikahan: true
        }
    });

    // Create audit log
    await prisma.statusLog.create({
        data: {
            permohonan_id: submissionId,
            actor_id: verifierId,
            previous_status: submission.status,
            new_status: 'REJECTED',
            notes: `Pengajuan ditolak. Alasan: ${reason}`
        }
    });

    logger.info(`Verifier ${verifierId} rejected submission ${submissionId}`);

    return updated;
};

/**
 * Get verifier performance reports
 * 
 * @param {string} verifierId - Verifier user ID
 * @param {string} period - Time period (week, month, year, all)
 * @returns {Object} - Performance statistics
 */
const getVerifierReports = async (verifierId, period = 'month') => {
    // Calculate date range based on period
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

    // Get submissions verified by this verifier
    const verifiedSubmissions = await prisma.statusLog.findMany({
        where: {
            actor_id: verifierId,
            new_status: {
                in: ['APPROVED', 'REJECTED']
            },
            created_at: {
                gte: startDate
            }
        },
        include: {
            permohonan: true
        }
    });

    // Calculate statistics
    const stats = {
        total_verified: verifiedSubmissions.length,
        approved: verifiedSubmissions.filter(log => log.new_status === 'APPROVED').length,
        rejected: verifiedSubmissions.filter(log => log.new_status === 'REJECTED').length,
        approval_rate: verifiedSubmissions.length > 0
            ? ((verifiedSubmissions.filter(log => log.new_status === 'APPROVED').length / verifiedSubmissions.length) * 100).toFixed(2)
            : 0,
        period,
        verifier_id: verifierId
    };

    return stats;
};

module.exports = {
    getVerifierQueue,
    getSubmissionDetail,
    approveSubmission,
    rejectSubmission,
    getVerifierReports
};
