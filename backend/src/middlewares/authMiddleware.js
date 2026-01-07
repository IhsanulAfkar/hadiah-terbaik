
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const verifyToken = async (req, res, next) => {
    // 1. Get header
    const authHeader = req.headers['authorization'];

    let token = null;

    // 2. Extract from Header
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    // 3. Fallback to Query Param (for Download)
    else if (req.query.token) {
        token = req.query.token;
    }

    // 4. Validation
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // 5. Verify JWT
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Token expired or invalid' });
        }

        // 6. Validate session - check if token matches active session
        try {
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { active_session_token: true }
            });

            if (!user || user.active_session_token !== token) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired or login from another location'
                });
            }

            // 7. Attach user to request
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Session validation failed'
            });
        }
    });
};

const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak: Role tidak ditemukan'
            });
        }

        // Support both single role string and array of roles
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!rolesArray.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Akses ditolak: Role ${req.user.role} tidak memiliki akses ke endpoint ini`
            });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRole
};
