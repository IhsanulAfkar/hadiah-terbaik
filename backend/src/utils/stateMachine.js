/**
 * Finite State Machine (FSM) for Submission Status Transitions
 * 
 * This module implements state-driven workflow validation as per UPDATE.MD specification.
 * It ensures that status transitions are valid based on current status and user role.
 */

const AppError = require('./AppError');

/**
 * Valid state transitions based on current status and role
 * Structure: { currentStatus: { role: [allowedNextStatuses] } }
 */
const TRANSITIONS = {
    DRAFT: {
        KUA: ['SUBMITTED']
    },
    SUBMITTED: {
        OPERATOR_DUKCAPIL: ['PROCESSING', 'NEEDS_REVISION'],
        VERIFIKATOR_DUKCAPIL: ['PROCESSING', 'NEEDS_REVISION']
    },
    NEEDS_REVISION: {
        KUA: ['SUBMITTED']
    },
    PROCESSING: {
        OPERATOR_DUKCAPIL: ['PENDING_VERIFICATION', 'NEEDS_REVISION'],
        VERIFIKATOR_DUKCAPIL: ['PENDING_VERIFICATION', 'NEEDS_REVISION']
    },
    PENDING_VERIFICATION: {
        VERIFIKATOR_DUKCAPIL: ['APPROVED', 'REJECTED']
    },
    APPROVED: {
        // Terminal state - no transitions allowed
    },
    REJECTED: {
        // Terminal state - no transitions allowed
    }
};

/**
 * Status descriptions for logging and error messages
 */
const STATUS_DESCRIPTIONS = {
    DRAFT: 'Draft',
    SUBMITTED: 'Diajukan',
    NEEDS_REVISION: 'Perlu Perbaikan',
    PROCESSING: 'Sedang Diproses',
    PENDING_VERIFICATION: 'Menunggu Verifikasi',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak'
};

/**
 * Check if a status transition is valid for a given role
 * 
 * @param {string} currentStatus - Current submission status
 * @param {string} newStatus - Proposed new status
 * @param {string} role - User role attempting the transition
 * @returns {boolean} - True if transition is allowed, false otherwise
 */
function canTransition(currentStatus, newStatus, role) {
    // Same status is always allowed (no-op)
    if (currentStatus === newStatus) {
        return true;
    }

    // Check if current status exists in transition rules
    if (!TRANSITIONS[currentStatus]) {
        return false;
    }

    // Check if role has any allowed transitions
    if (!TRANSITIONS[currentStatus][role]) {
        return false;
    }

    // Check if new status is in the allowed list
    return TRANSITIONS[currentStatus][role].includes(newStatus);
}

/**
 * Get all valid next statuses for a given current status and role
 * 
 * @param {string} currentStatus - Current submission status
 * @param {string} role - User role
 * @returns {string[]} - Array of allowed next statuses
 */
function getNextValidStatuses(currentStatus, role) {
    if (!TRANSITIONS[currentStatus]) {
        return [];
    }

    if (!TRANSITIONS[currentStatus][role]) {
        return [];
    }

    return TRANSITIONS[currentStatus][role];
}

/**
 * Validate a status transition and throw error if invalid
 * 
 * @param {string} currentStatus - Current submission status
 * @param {string} newStatus - Proposed new status
 * @param {string} role - User role attempting the transition
 * @throws {AppError} - If transition is not allowed
 */
function validateTransition(currentStatus, newStatus, role) {
    if (!canTransition(currentStatus, newStatus, role)) {
        const currentDesc = STATUS_DESCRIPTIONS[currentStatus] || currentStatus;
        const newDesc = STATUS_DESCRIPTIONS[newStatus] || newStatus;

        const validStatuses = getNextValidStatuses(currentStatus, role);
        const validDesc = validStatuses.map(s => STATUS_DESCRIPTIONS[s] || s).join(', ');

        let message = `Transisi status tidak valid: "${currentDesc}" → "${newDesc}" untuk role ${role}.`;

        if (validStatuses.length > 0) {
            message += ` Status yang diperbolehkan: ${validDesc}`;
        } else {
            message += ` Tidak ada transisi yang diperbolehkan dari status "${currentDesc}" untuk role ${role}.`;
        }

        throw new AppError(message, 400);
    }
}

/**
 * Check if a status is a terminal state (no further transitions)
 * 
 * @param {string} status - Status to check
 * @returns {boolean} - True if status is terminal
 */
function isTerminalState(status) {
    return status === 'APPROVED' || status === 'REJECTED';
}

/**
 * Get the workflow path description for a given status
 * 
 * @param {string} status - Current status
 * @returns {string} - Human-readable workflow description
 */
function getWorkflowDescription(status) {
    const descriptions = {
        DRAFT: 'Pengajuan masih dalam draft, belum diajukan',
        SUBMITTED: 'Pengajuan telah diajukan, menunggu operator Dukcapil',
        NEEDS_REVISION: 'Pengajuan dikembalikan ke KUA untuk perbaikan',
        PROCESSING: 'Pengajuan sedang diproses oleh operator Dukcapil',
        PENDING_VERIFICATION: 'Pengajuan menunggu verifikasi dari verifikator',
        APPROVED: 'Pengajuan telah disetujui dan selesai',
        REJECTED: 'Pengajuan ditolak oleh verifikator'
    };

    return descriptions[status] || 'Status tidak dikenal';
}

/**
 * Get all statuses that can be viewed by a role
 * Used for filtering queues and lists
 * 
 * @param {string} role - User role
 * @returns {string[]} - Array of viewable statuses
 */
function getViewableStatuses(role) {
    const viewable = {
        KUA: ['DRAFT', 'SUBMITTED', 'NEEDS_REVISION', 'PROCESSING', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'],
        OPERATOR_DUKCAPIL: ['SUBMITTED', 'PROCESSING', 'PENDING_VERIFICATION'],
        VERIFIKATOR_DUKCAPIL: ['PROCESSING', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'],
        KEMENAG: ['DRAFT', 'SUBMITTED', 'NEEDS_REVISION', 'PROCESSING', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'],
        ADMIN: ['DRAFT', 'SUBMITTED', 'NEEDS_REVISION', 'PROCESSING', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED']
    };

    return viewable[role] || [];
}

module.exports = {
    TRANSITIONS,
    STATUS_DESCRIPTIONS,
    canTransition,
    getNextValidStatuses,
    validateTransition,
    isTerminalState,
    getWorkflowDescription,
    getViewableStatuses
};
