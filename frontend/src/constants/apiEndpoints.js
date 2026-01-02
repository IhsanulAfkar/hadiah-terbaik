export const ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    ME: '/auth/me',

    // Submissions
    SUBMISSIONS: '/submissions',
    MY_SUBMISSIONS: '/submissions/my',
    SUBMISSION_DETAIL: (id) => `/submissions/${id}`,
    SUBMISSION_DOCUMENT: (filename) => `/submissions/document/${filename}`,

    // Verifications (Dukcapil)
    VERIFICATION_QUEUE: '/verifications/queue',
    LOCK_SUBMISSION: (id) => `/verifications/${id}/lock`,
    VERIFY_SUBMISSION: (id) => `/verifications/${id}/verify`,

    // Dashboard & Reports
    DASHBOARD_STATS: '/dashboard/stats',
    REPORT_EXPORT: '/reports/export',

    // Master Data
    DISTRICTS: '/master/districts',

    // Admin
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_DETAIL: (id) => `/admin/users/${id}`,
    ADMIN_DISTRICTS: '/admin/master/districts',
    ADMIN_DISTRICT_DETAIL: (id) => `/admin/master/districts/${id}`,
    ADMIN_LOGS: '/admin/logs'
};
