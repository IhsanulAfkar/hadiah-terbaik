const logger = require('./logger');

/**
 * Validate password complexity
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with valid flag and errors array
 */
const validatePassword = (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(password);

    const errors = [];

    if (!password || password.length < minLength) {
        errors.push(`Password minimal ${minLength} karakter`);
    }
    if (!hasUpperCase) {
        errors.push('Password harus mengandung minimal 1 huruf besar (A-Z)');
    }
    if (!hasLowerCase) {
        errors.push('Password harus mengandung minimal 1 huruf kecil (a-z)');
    }
    if (!hasNumbers) {
        errors.push('Password harus mengandung minimal 1 angka (0-9)');
    }
    if (!hasSpecialChar) {
        errors.push('Password harus mengandung minimal 1 karakter spesial (!@#$%^&*...)');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Check if password is in common password list
 * @param {string} password - Password to check
 * @returns {boolean} True if password is common
 */
const isCommonPassword = (password) => {
    const commonPasswords = [
        'password123', 'admin123', '12345678', 'qwerty123',
        'indonesia123', 'password', 'admin', 'administrator',
        '123456789', 'qwertyuiop', 'password1', 'admin1',
        'welcome123', 'Welcome123', 'Password123', 'Admin123',
        'dukcapil123', 'kua123', 'verifikator123'
    ];

    return commonPasswords.includes(password.toLowerCase());
};

/**
 * Check password strength and provide feedback
 * @param {string} password - Password to check
 * @returns {Object} Strength score and feedback
 */
const getPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    // Length scoring
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length >= 20) score += 1;

    // Complexity scoring
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(password)) score += 1;

    // Additional checks
    if (/(.)\1{2,}/.test(password)) {
        score -= 1;
        feedback.push('Hindari karakter berulang');
    }

    if (isCommonPassword(password)) {
        score = 0;
        feedback.push('Password terlalu umum');
    }

    // Determine strength level
    let strength = 'Sangat Lemah';
    if (score >= 7) strength = 'Sangat Kuat';
    else if (score >= 6) strength = 'Kuat';
    else if (score >= 4) strength = 'Sedang';
    else if (score >= 2) strength = 'Lemah';

    return {
        score,
        strength,
        feedback
    };
};

/**
 * Generate random password that meets complexity requirements
 * @param {number} length - Password length (default 16)
 * @returns {string} Generated password
 */
const generateRandomPassword = (length = 16) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_-+=[]{}';

    const all = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
};

/**
 * Check if password needs to be changed (based on age)
 * @param {Date} passwordChangedAt - Date when password was last changed
 * @param {number} maxAgeDays - Maximum age in days (default 90)
 * @returns {boolean} True if password needs to be changed
 */
const isPasswordExpired = (passwordChangedAt, maxAgeDays = 90) => {
    if (!passwordChangedAt) return true;

    const now = new Date();
    const passwordAge = Math.floor((now - passwordChangedAt) / (1000 * 60 * 60 * 24));

    return passwordAge >= maxAgeDays;
};

/**
 * Log password security events
 * @param {string} userId - User ID
 * @param {string} event - Event type
 * @param {Object} details - Event details
 */
const logPasswordEvent = (userId, event, details = {}) => {
    logger.info({
        category: 'PASSWORD_SECURITY',
        userId,
        event,
        timestamp: new Date().toISOString(),
        ...details
    });
};

module.exports = {
    validatePassword,
    isCommonPassword,
    getPasswordStrength,
    generateRandomPassword,
    isPasswordExpired,
    logPasswordEvent
};
