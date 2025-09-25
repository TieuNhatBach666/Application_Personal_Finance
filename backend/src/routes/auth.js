const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getPool, SCHEMA_INFO } = require('../config/database');
const { generateTokens, authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Đăng ký người dùng mới
router.post('/register', validate('register'), asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phoneNumber } = req.validatedData;

    const pool = getPool();

    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await pool.request()
        .input('email', email)
        .query(`
            SELECT ${SCHEMA_INFO.COLUMNS.USERS.ID} 
            FROM ${SCHEMA_INFO.TABLES.USERS} 
            WHERE ${SCHEMA_INFO.COLUMNS.USERS.EMAIL} = @email
        `);
    
    if (existingUser.recordset.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Email đã được sử dụng'
        });
    }
    
    // Mã hóa mật khẩu
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const userId = uuidv4();
    await pool.request()
        .input('userId', userId)
        .input('email', email)
        .input('passwordHash', passwordHash)
        .input('firstName', firstName)
        .input('lastName', lastName)
        .input('phoneNumber', phoneNumber || null)
        .query(`
            INSERT INTO ${SCHEMA_INFO.TABLES.USERS} (
                ${SCHEMA_INFO.COLUMNS.USERS.ID},
                ${SCHEMA_INFO.COLUMNS.USERS.EMAIL},
                ${SCHEMA_INFO.COLUMNS.USERS.PASSWORD_HASH},
                ${SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME},
                ${SCHEMA_INFO.COLUMNS.USERS.LAST_NAME},
                ${SCHEMA_INFO.COLUMNS.USERS.PHONE},
                ${SCHEMA_INFO.COLUMNS.USERS.CURRENCY},
                ${SCHEMA_INFO.COLUMNS.USERS.LANGUAGE},
                ${SCHEMA_INFO.COLUMNS.USERS.TIMEZONE},
                ${SCHEMA_INFO.COLUMNS.USERS.IS_ACTIVE}
            ) VALUES (
                @userId, @email, @passwordHash, @firstName, @lastName, @phoneNumber,
                'VND', 'vi-VN', 'Asia/Ho_Chi_Minh', 1
            )
        `);
    
    // Sao chép các danh mục mặc định cho user mới
    await pool.request()
        .input('userId', userId)
        .input('defaultUserId', SCHEMA_INFO.DEFAULT_CATEGORIES_USER_ID)
        .query(`
            INSERT INTO ${SCHEMA_INFO.TABLES.CATEGORIES} (
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE}
            )
            SELECT 
                NEWID(),
                @userId,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR},
                1
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID} = @defaultUserId
        `);
    
    // Tạo tokens
    const { accessToken, refreshToken } = generateTokens(userId, email);
    
    res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                phoneNumber
            },
            accessToken,
            refreshToken
        }
    });
}));

// Đăng nhập người dùng
router.post('/login', validate('login'), asyncHandler(async (req, res) => {
    const { email, password } = req.validatedData;

    const pool = getPool();

    // Tìm user theo email
    const result = await pool.request()
        .input('email', email)
        .query(`
            SELECT 
                ${SCHEMA_INFO.COLUMNS.USERS.ID},
                ${SCHEMA_INFO.COLUMNS.USERS.EMAIL},
                ${SCHEMA_INFO.COLUMNS.USERS.PASSWORD_HASH},
                ${SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME},
                ${SCHEMA_INFO.COLUMNS.USERS.LAST_NAME},
                ${SCHEMA_INFO.COLUMNS.USERS.PHONE},
                ${SCHEMA_INFO.COLUMNS.USERS.IS_ACTIVE}
            FROM ${SCHEMA_INFO.TABLES.USERS} 
            WHERE ${SCHEMA_INFO.COLUMNS.USERS.EMAIL} = @email
        `);
    
    if (result.recordset.length === 0) {
        return res.status(401).json({
            success: false,
            message: 'Email hoặc mật khẩu không đúng'
        });
    }
    
    const user = result.recordset[0];
    
    // Kiểm tra xem user có đang hoạt động không
    if (!user[SCHEMA_INFO.COLUMNS.USERS.IS_ACTIVE]) {
        return res.status(401).json({
            success: false,
            message: 'Tài khoản đã bị vô hiệu hóa'
        });
    }

    // Xác minh mật khẩu
    const isValidPassword = await bcrypt.compare(password, user[SCHEMA_INFO.COLUMNS.USERS.PASSWORD_HASH]);
    
    if (!isValidPassword) {
        return res.status(401).json({
            success: false,
            message: 'Email hoặc mật khẩu không đúng'
        });
    }
    
    // Tạo tokens
    const { accessToken, refreshToken } = generateTokens(
        user[SCHEMA_INFO.COLUMNS.USERS.ID],
        user[SCHEMA_INFO.COLUMNS.USERS.EMAIL]
    );
    
    res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
            user: {
                id: user[SCHEMA_INFO.COLUMNS.USERS.ID],
                email: user[SCHEMA_INFO.COLUMNS.USERS.EMAIL],
                firstName: user[SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME],
                lastName: user[SCHEMA_INFO.COLUMNS.USERS.LAST_NAME],
                phoneNumber: user[SCHEMA_INFO.COLUMNS.USERS.PHONE]
            },
            accessToken,
            refreshToken
        }
    });
}));

// Lấy thông tin profile người dùng hiện tại
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            SELECT 
                ${SCHEMA_INFO.COLUMNS.USERS.ID},
                ${SCHEMA_INFO.COLUMNS.USERS.EMAIL},
                ${SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME},
                ${SCHEMA_INFO.COLUMNS.USERS.LAST_NAME},
                ${SCHEMA_INFO.COLUMNS.USERS.PHONE},
                ${SCHEMA_INFO.COLUMNS.USERS.AVATAR},
                ${SCHEMA_INFO.COLUMNS.USERS.CURRENCY},
                ${SCHEMA_INFO.COLUMNS.USERS.LANGUAGE},
                ${SCHEMA_INFO.COLUMNS.USERS.TIMEZONE},
                ${SCHEMA_INFO.COLUMNS.USERS.CREATED_AT}
            FROM ${SCHEMA_INFO.TABLES.USERS} 
            WHERE ${SCHEMA_INFO.COLUMNS.USERS.ID} = @userId
        `);
    
    if (result.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Người dùng không tồn tại'
        });
    }
    
    const user = result.recordset[0];
    
    res.json({
        success: true,
        data: {
            id: user[SCHEMA_INFO.COLUMNS.USERS.ID],
            email: user[SCHEMA_INFO.COLUMNS.USERS.EMAIL],
            firstName: user[SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME],
            lastName: user[SCHEMA_INFO.COLUMNS.USERS.LAST_NAME],
            phoneNumber: user[SCHEMA_INFO.COLUMNS.USERS.PHONE],
            avatarUrl: user[SCHEMA_INFO.COLUMNS.USERS.AVATAR],
            currency: user[SCHEMA_INFO.COLUMNS.USERS.CURRENCY],
            language: user[SCHEMA_INFO.COLUMNS.USERS.LANGUAGE],
            timezone: user[SCHEMA_INFO.COLUMNS.USERS.TIMEZONE],
            createdAt: user[SCHEMA_INFO.COLUMNS.USERS.CREATED_AT]
        }
    });
}));

// Cập nhật thông tin profile người dùng
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
    const { firstName, lastName, phoneNumber, avatarUrl, currency, language, timezone } = req.body;
    const userId = req.user.id;
    
    const pool = getPool();
    
    // Xây dựng câu query update động
    const updates = [];
    const inputs = [{ name: 'userId', value: userId }];
    
    if (firstName !== undefined) {
        updates.push(`${SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME} = @firstName`);
        inputs.push({ name: 'firstName', value: firstName });
    }
    if (lastName !== undefined) {
        updates.push(`${SCHEMA_INFO.COLUMNS.USERS.LAST_NAME} = @lastName`);
        inputs.push({ name: 'lastName', value: lastName });
    }
    if (phoneNumber !== undefined) {
        updates.push(`${SCHEMA_INFO.COLUMNS.USERS.PHONE} = @phoneNumber`);
        inputs.push({ name: 'phoneNumber', value: phoneNumber });
    }
    if (avatarUrl !== undefined) {
        updates.push(`${SCHEMA_INFO.COLUMNS.USERS.AVATAR} = @avatarUrl`);
        inputs.push({ name: 'avatarUrl', value: avatarUrl });
    }
    if (currency !== undefined) {
        updates.push(`${SCHEMA_INFO.COLUMNS.USERS.CURRENCY} = @currency`);
        inputs.push({ name: 'currency', value: currency });
    }
    if (language !== undefined) {
        updates.push(`${SCHEMA_INFO.COLUMNS.USERS.LANGUAGE} = @language`);
        inputs.push({ name: 'language', value: language });
    }
    if (timezone !== undefined) {
        updates.push(`${SCHEMA_INFO.COLUMNS.USERS.TIMEZONE} = @timezone`);
        inputs.push({ name: 'timezone', value: timezone });
    }
    
    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Không có thông tin nào để cập nhật'
        });
    }
    
    // Cập nhật user
    const request = pool.request();
    inputs.forEach(input => request.input(input.name, input.value));
    
    await request.query(`
        UPDATE ${SCHEMA_INFO.TABLES.USERS} 
        SET ${updates.join(', ')}, ${SCHEMA_INFO.COLUMNS.USERS.UPDATED_AT} = GETUTCDATE()
        WHERE ${SCHEMA_INFO.COLUMNS.USERS.ID} = @userId
    `);
    
    // Lấy dữ liệu user đã cập nhật
    const result = await pool.request()
        .input('userId', userId)
        .query(`
            SELECT 
                ${SCHEMA_INFO.COLUMNS.USERS.ID},
                ${SCHEMA_INFO.COLUMNS.USERS.EMAIL},
                ${SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME},
                ${SCHEMA_INFO.COLUMNS.USERS.LAST_NAME},
                ${SCHEMA_INFO.COLUMNS.USERS.PHONE},
                ${SCHEMA_INFO.COLUMNS.USERS.AVATAR},
                ${SCHEMA_INFO.COLUMNS.USERS.CURRENCY},
                ${SCHEMA_INFO.COLUMNS.USERS.LANGUAGE},
                ${SCHEMA_INFO.COLUMNS.USERS.TIMEZONE},
                ${SCHEMA_INFO.COLUMNS.USERS.CREATED_AT}
            FROM ${SCHEMA_INFO.TABLES.USERS} 
            WHERE ${SCHEMA_INFO.COLUMNS.USERS.ID} = @userId
        `);
    
    const user = result.recordset[0];
    
    res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: {
            id: user[SCHEMA_INFO.COLUMNS.USERS.ID],
            email: user[SCHEMA_INFO.COLUMNS.USERS.EMAIL],
            firstName: user[SCHEMA_INFO.COLUMNS.USERS.FIRST_NAME],
            lastName: user[SCHEMA_INFO.COLUMNS.USERS.LAST_NAME],
            phoneNumber: user[SCHEMA_INFO.COLUMNS.USERS.PHONE],
            avatarUrl: user[SCHEMA_INFO.COLUMNS.USERS.AVATAR],
            currency: user[SCHEMA_INFO.COLUMNS.USERS.CURRENCY],
            language: user[SCHEMA_INFO.COLUMNS.USERS.LANGUAGE],
            timezone: user[SCHEMA_INFO.COLUMNS.USERS.TIMEZONE],
            createdAt: user[SCHEMA_INFO.COLUMNS.USERS.CREATED_AT]
        }
    });
}));

// Đăng xuất (xóa token ở phía client)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
});

module.exports = router;