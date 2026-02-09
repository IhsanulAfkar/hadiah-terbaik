const prisma = require('../config/database');
const { validateH1Rule } = require('../utils/mouValidation');
const { validateDocumentsForScenario, getScenario } = require('../utils/mouScenarios');

const createSubmission = async (userId, dataPernikahan, files) => {
    // Start Transaction
    return await prisma.$transaction(async (tx) => {
        // 1. Generate Ticket Number (Format: SUB-YYYYMMDD-XXXX)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await tx.permohonan.count();
        const ticketNumber = `SUB-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

        // 2. Create Permohonan Header
        const permohonan = await tx.permohonan.create({
            data: {
                ticket_number: ticketNumber,
                user_id: userId,
                status: 'DRAFT', // Changed to DRAFT to allow document upload first
            }
        });

        // 3. Create Data Pernikahan
        // Ensure marriage_date is a Date object (received as string from JSON)
        const sanitizedData = {
            ...dataPernikahan,
            marriage_date: new Date(dataPernikahan.marriage_date)
        };

        // [NEW] Derive flags from mou_scenario if provided
        if (dataPernikahan.mou_scenario) {
            const scenario = getScenario(dataPernikahan.mou_scenario);
            sanitizedData.is_outside_district = scenario.outside_district;
            sanitizedData.kk_option = scenario.kk_option;
            sanitizedData.has_biodata_change = scenario.biodata_change;
        }

        await tx.dataPernikahan.create({
            data: {
                permohonan_id: permohonan.id,
                ...sanitizedData
            }
        });

        // 4. Create Dokumen Records
        if (files && files.length > 0) {
            const dokumenData = files.map(file => ({
                permohonan_id: permohonan.id,
                doc_type: file.fieldname.toUpperCase(), // Assumes fieldname matches ENUM (e.g., ktp_suami -> KTP_SUAMI)
                file_path: file.filename, // Store filename only, relative to uploads dir
                file_name: file.originalname,
                mime_type: file.mimetype,
                file_size: file.size
            }));

            await tx.dokumen.createMany({
                data: dokumenData
            });
        }

        // 5. Create Initial Log
        await tx.statusLog.create({
            data: {
                permohonan_id: permohonan.id,
                actor_id: userId,
                new_status: 'DRAFT',
                notes: 'Permohonan baru dibuat'
            }
        });

        return permohonan;
    });
};

const getMySubmissions = async (userId) => {
    return await prisma.permohonan.findMany({
        where: { user_id: userId },
        include: {
            data_pernikahan: true,
            dokumen: true,
            logs: true,
            creator: {
                include: {
                    kecamatan: true
                }
            }
        },
        orderBy: { created_at: 'desc' }
    });
};

const updateSubmission = async (id, userId, dataPernikahan, files) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Check existing submission
        const existing = await tx.permohonan.findUnique({
            where: { id },
            include: { data_pernikahan: true, dokumen: true }
        });

        if (!existing) { throw new Error('Submission not found'); }
        if (existing.user_id !== userId) { throw new Error('Unauthorized'); }

        // Allow update if DRAFT, REJECTED, or NEEDS_REVISION
        const editableStatuses = ['DRAFT', 'REJECTED', 'NEEDS_REVISION'];
        // Note: Currently we only use SUBMITTED, APPROVED, REJECTED, PROCESSING.
        // If REJECTED, we allow resubmit.
        if (!editableStatuses.includes(existing.status)) {
            // Throw specific error if locked
            throw new Error(`Cannot edit submission in status: ${existing.status}`);
        }

        // 2. Update Data Pernikahan
        // Ensure marriage_date is Date object
        const sanitizedData = {
            ...dataPernikahan,
            marriage_date: new Date(dataPernikahan.marriage_date)
        };

        // We update the EXISTING record, preserving ID.
        // DataPernikahan is 1:1, so we update where permohonan_id matches.
        await tx.dataPernikahan.update({
            where: { permohonan_id: id },
            data: sanitizedData
        });

        // 3. Handle Files (Only add NEW files, keep OLD if not replaced)
        // This logic depends on how frontend sends data. 
        // Generically, we just ADD new files here. Frontend should not send files if not changed.
        if (files && files.length > 0) {
            const dokumenData = files.map(file => ({
                permohonan_id: id,
                doc_type: file.fieldname.toUpperCase(),
                file_path: file.filename,
                file_name: file.originalname,
                mime_type: file.mimetype,
                file_size: file.size
            }));

            // For each new file, DELETE existing file of same doc_type?
            // Yes, strict replacement for types like KK_SUAMI.
            const newTypes = dokumenData.map(d => d.doc_type);
            await tx.dokumen.deleteMany({
                where: {
                    permohonan_id: id,
                    doc_type: { in: newTypes }
                }
            });

            await tx.dokumen.createMany({
                data: dokumenData
            });
        }

        // 4. Update Status to SUBMITTED (Resubmission)
        // If it was REJECTED, we reset to SUBMITTED so Dukcapil sees it again.
        const updatedPermohonan = await tx.permohonan.update({
            where: { id },
            data: {
                status: 'SUBMITTED',
                current_assignee_id: null // Clear any old locks
            } // Always reset to SUBMITTED on update
        });

        // 5. Audit Log
        await tx.statusLog.create({
            data: {
                permohonan_id: id,
                actor_id: userId,
                new_status: 'SUBMITTED',
                notes: 'Resubmitted with updates'
            }
        });

        return updatedPermohonan;
    });
};

const getSubmissionById = async (id) => {
    return await prisma.permohonan.findUnique({
        where: { id },
        include: {
            data_pernikahan: true,
            dokumen: true,
            assignee: {
                select: { full_name: true }
            },
            logs: {
                include: { actor: { select: { full_name: true, role: true } } },
                orderBy: { created_at: 'desc' }
            }
        }
    });
};

/**
 * Submit draft (change status from DRAFT to SUBMITTED)
 * 
 * @param {string} submissionId - Submission ID
 * @param {string} userId - User ID (KUA)
 * @returns {Object} - Updated submission
 */
const submitDraft = async (submissionId, userId) => {
    const AppError = require('../utils/AppError');
    const FSM = require('../utils/stateMachine');

    return await prisma.$transaction(async (tx) => {
        // Check if submission exists and belongs to user
        const submission = await tx.permohonan.findUnique({
            where: { id: submissionId },
            include: {
                data_pernikahan: true,
                dokumen: true
            }
        });

        if (!submission) {
            throw new AppError('Pengajuan tidak ditemukan', 404);
        }

        if (submission.user_id !== userId) {
            throw new AppError('Anda tidak memiliki akses untuk pengajuan ini', 403);
        }

        // [NEW] MOU Validation 1: H-1 Rule (marriage date must be >= tomorrow)
        validateH1Rule(
            submission.data_pernikahan.marriage_date,
            submission.created_at
        );

        // [NEW] MOU Validation 2: Scenario-based document validation
        if (submission.data_pernikahan.mou_scenario) {
            validateDocumentsForScenario(
                submission.data_pernikahan.mou_scenario,
                submission.dokumen
            );
        }

        // Validate FSM transition
        FSM.validateTransition(submission.status, 'SUBMITTED', 'KUA');

        // Update status
        const updated = await tx.permohonan.update({
            where: { id: submissionId },
            data: {
                status: 'SUBMITTED'
            },
            include: {
                data_pernikahan: true,
                dokumen: true
            }
        });

        // Create audit log
        await tx.statusLog.create({
            data: {
                permohonan_id: submissionId,
                actor_id: userId,
                previous_status: submission.status,
                new_status: 'SUBMITTED',
                notes: 'Pengajuan disubmit dari draft'
            }
        });

        return updated;
    });
};

/**
 * Delete document (only allowed for DRAFT submissions)
 * 
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID (KUA)
 * @returns {Object} - Success message
 */
const deleteDocument = async (documentId, userId) => {
    const AppError = require('../utils/AppError');

    return await prisma.$transaction(async (tx) => {
        // Get document with submission info
        const document = await tx.dokumen.findUnique({
            where: { id: documentId },
            include: {
                permohonan: true
            }
        });

        if (!document) {
            throw new AppError('Dokumen tidak ditemukan', 404);
        }

        // Check if user owns this submission
        if (document.permohonan.user_id !== userId) {
            throw new AppError('Anda tidak memiliki akses untuk dokumen ini', 403);
        }

        // Check if submission is in DRAFT status
        if (document.permohonan.status !== 'DRAFT') {
            throw new AppError(
                `Dokumen hanya dapat dihapus jika pengajuan masih DRAFT. Status saat ini: ${document.permohonan.status}`,
                400
            );
        }

        // Delete document
        await tx.dokumen.delete({
            where: { id: documentId }
        });

        // TODO: Delete physical file from filesystem
        // const fs = require('fs');
        // const path = require('path');
        // const filePath = path.join(__dirname, '../../uploads', document.file_path);
        // if (fs.existsSync(filePath)) {
        //     fs.unlinkSync(filePath);
        // }

        return {
            success: true,
            message: 'Dokumen berhasil dihapus'
        };
    });
};

module.exports = {
    createSubmission,
    updateSubmission,
    getMySubmissions,
    getSubmissionById,
    submitDraft,
    deleteDocument
};
