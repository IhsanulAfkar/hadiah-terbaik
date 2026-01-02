
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
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

    // 5. Verify
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
        }
        // 6. Attach user to request
        req.user = decoded;
        next();
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
