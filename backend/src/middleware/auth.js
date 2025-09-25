const jwt = require('jsonwebtoken');
const { getPool, SCHEMA_INFO } = require('../config/database');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Xác minh user vẫn tồn tại và đang hoạt động
        const pool = getPool();
        const result = await pool.request()
            .input('userId', decoded.userId)
            .query(`
                SELECT ${SCHEMA_INFO.COLUMNS.USERS.ID}, 
                       ${SCHEMA_INFO.COLUMNS.USERS.EMAIL}, 
                       ${SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME}, 
                       ${SCHEMA_INFO.COLUMNS.USERS.LAST_NAME},
                       ${SCHEMA_INFO.COLUMNS.USERS.IS_ACTIVE}
                FROM ${SCHEMA_INFO.TABLES.USERS} 
                WHERE ${SCHEMA_INFO.COLUMNS.USERS.ID} = @userId 
                AND ${SCHEMA_INFO.COLUMNS.USERS.IS_ACTIVE} = 1
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found'
            });
        }

        req.user = {
            id: result.recordset[0][SCHEMA_INFO.COLUMNS.USERS.ID],
            email: result.recordset[0][SCHEMA_INFO.COLUMNS.USERS.EMAIL],
            firstName: result.recordset[0][SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME],
            lastName: result.recordset[0][SCHEMA_INFO.COLUMNS.USERS.LAST_NAME]
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const generateTokens = (userId, email) => {
    const accessToken = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
};

module.exports = {
    authenticateToken,
    generateTokens
};