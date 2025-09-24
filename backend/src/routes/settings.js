const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPool, SCHEMA_INFO } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Get all user settings
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const { category } = req.query;
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .input('category', category || null)
        .execute('sp_GetUserSettings');
    
    // Transform flat settings into nested object
    const settings = {};
    result.recordset.forEach(setting => {
        if (!settings[setting.Category]) {
            settings[setting.Category] = {};
        }
        
        let value = setting.SettingValue;
        // Parse based on type
        switch (setting.SettingType) {
            case 'boolean':
                value = value === 'true';
                break;
            case 'number':
                value = parseFloat(value);
                break;
            case 'json':
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    console.error('Error parsing JSON setting:', e);
                }
                break;
        }
        
        settings[setting.Category][setting.SettingKey] = value;
    });
    
    res.json({
        success: true,
        data: settings
    });
}));

// Get settings by category
router.get('/:category', authenticateToken, asyncHandler(async (req, res) => {
    const { category } = req.params;
    const pool = getPool();
    
    if (!['general', 'notifications', 'privacy', 'backup', 'appearance'].includes(category)) {
        return res.status(400).json({
            success: false,
            message: 'Category không hợp lệ'
        });
    }
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            SELECT SettingKey, SettingValue, Category
            FROM UserSettings
            WHERE UserID = @userId
        `);

    const settings = {};
    result.recordset.forEach(setting => {
        let value = setting.SettingValue;

        // Try to parse as JSON first, then boolean, then number
        try {
            if (value === 'true' || value === 'false') {
                value = value === 'true';
            } else if (!isNaN(value) && !isNaN(parseFloat(value))) {
                value = parseFloat(value);
            } else if (value.startsWith('{') || value.startsWith('[')) {
                value = JSON.parse(value);
            }
        } catch (e) {
            // Keep as string if parsing fails
        }

        // Parse category.key format
        const keyParts = setting.SettingKey.split('.');
        if (keyParts.length === 2) {
            const [cat, key] = keyParts;
            if (!settings[cat]) settings[cat] = {};
            settings[cat][key] = value;
        } else {
            settings[setting.SettingKey] = value;
        }
    });
    
    res.json({
        success: true,
        data: settings
    });
}));

// Update or create setting
router.put('/:category/:key', authenticateToken, asyncHandler(async (req, res) => {
    const { category, key } = req.params;
    const { value, type = 'string' } = req.body;

    console.log('🔧 Settings Update Request:', {
        userId: req.user.id,
        category,
        key,
        value,
        type
    });

    if (!['general', 'notifications', 'privacy', 'backup', 'appearance'].includes(category)) {
        console.log('❌ Invalid category:', category);
        return res.status(400).json({
            success: false,
            message: 'Category không hợp lệ'
        });
    }
    
    if (!['string', 'boolean', 'number', 'json'].includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Type không hợp lệ'
        });
    }
    
    const pool = getPool();
    
    // Convert value to string based on type
    let stringValue;
    switch (type) {
        case 'boolean':
            stringValue = value ? 'true' : 'false';
            break;
        case 'number':
            stringValue = value.toString();
            break;
        case 'json':
            stringValue = JSON.stringify(value);
            break;
        default:
            stringValue = value.toString();
    }
    
    // Use category.key format for SettingKey to maintain structure
    const settingKey = `${category}.${key}`;

    try {
        // Use UserID as is (UNIQUEIDENTIFIER)
        const userId = req.user.id;

        // Check if setting exists
        const existingSetting = await pool.request()
            .input('userId', userId)
            .input('settingKey', settingKey)
            .query(`
                SELECT SettingID FROM UserSettings
                WHERE UserID = @userId AND SettingKey = @settingKey
            `);

        if (existingSetting.recordset.length > 0) {
            // Update existing setting
            await pool.request()
                .input('userId', userId)
                .input('settingKey', settingKey)
                .input('settingValue', stringValue)
                .input('category', category)
                .query(`
                    UPDATE UserSettings SET
                        SettingValue = @settingValue,
                        Category = @category,
                        UpdatedAt = GETDATE()
                    WHERE UserID = @userId AND SettingKey = @settingKey
                `);

            console.log('✅ Setting updated:', settingKey, '=', stringValue);
        } else {
            // Create new setting
            await pool.request()
                .input('userId', userId)
                .input('settingKey', settingKey)
                .input('settingValue', stringValue)
                .input('category', category)
                .query(`
                    INSERT INTO UserSettings (UserID, SettingKey, SettingValue, Category)
                    VALUES (@userId, @settingKey, @settingValue, @category)
                `);

            console.log('✅ Setting created:', settingKey, '=', stringValue);
        }
    } catch (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error('Lỗi truy vấn cơ sở dữ liệu: ' + dbError.message);
    }
    
    res.json({
        success: true,
        message: 'Cài đặt đã được cập nhật thành công',
        data: { key, value, type, category }
    });
}));

// Update multiple settings
router.put('/:category', authenticateToken, asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { settings } = req.body;
    
    if (!['general', 'notifications', 'privacy', 'backup', 'appearance'].includes(category)) {
        return res.status(400).json({
            success: false,
            message: 'Category không hợp lệ'
        });
    }
    
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Settings phải là một object'
        });
    }
    
    const pool = getPool();
    const transaction = pool.transaction();
    
    try {
        await transaction.begin();
        
        for (const [key, settingData] of Object.entries(settings)) {
            const { value, type = 'string' } = settingData;
            
            // Convert value to string
            let stringValue;
            switch (type) {
                case 'boolean':
                    stringValue = value ? 'true' : 'false';
                    break;
                case 'number':
                    stringValue = value.toString();
                    break;
                case 'json':
                    stringValue = JSON.stringify(value);
                    break;
                default:
                    stringValue = value.toString();
            }
            
            // Upsert setting
            await transaction.request()
                .input('userId', req.user.id)
                .input('settingKey', key)
                .input('settingValue', stringValue)
                .input('settingType', type)
                .input('category', category)
                .query(`
                    MERGE UserSettings AS target
                    USING (SELECT @userId as UserID, @settingKey as SettingKey) AS source
                    ON target.UserID = source.UserID AND target.SettingKey = source.SettingKey
                    WHEN MATCHED THEN
                        UPDATE SET 
                            SettingValue = @settingValue,
                            SettingType = @settingType,
                            Category = @category,
                            UpdatedAt = GETUTCDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (SettingID, UserID, SettingKey, SettingValue, SettingType, Category)
                        VALUES (NEWID(), @userId, @settingKey, @settingValue, @settingType, @category);
                `);
        }
        
        await transaction.commit();
        
        res.json({
            success: true,
            message: `${Object.keys(settings).length} cài đặt đã được cập nhật thành công`
        });
        
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}));

// Delete setting
router.delete('/:category/:key', authenticateToken, asyncHandler(async (req, res) => {
    const { category, key } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .input('settingKey', key)
        .query(`
            DELETE FROM UserSettings 
            WHERE UserID = @userId AND SettingKey = @settingKey;
            SELECT @@ROWCOUNT as deletedCount;
        `);
    
    if (result.recordset[0].deletedCount === 0) {
        return res.status(404).json({
            success: false,
            message: 'Cài đặt không tồn tại'
        });
    }
    
    res.json({
        success: true,
        message: 'Cài đặt đã được xóa thành công'
    });
}));

// Reset settings to default
router.post('/reset/:category', authenticateToken, asyncHandler(async (req, res) => {
    const { category } = req.params;
    const pool = getPool();
    
    if (!['general', 'notifications', 'privacy', 'backup', 'appearance'].includes(category)) {
        return res.status(400).json({
            success: false,
            message: 'Category không hợp lệ'
        });
    }
    
    // Delete all settings in category
    await pool.request()
        .input('userId', req.user.id)
        .input('category', category)
        .query(`
            DELETE FROM UserSettings 
            WHERE UserID = @userId AND Category = @category
        `);
    
    // Insert default settings based on category
    const defaultSettings = getDefaultSettings(category);
    
    for (const [key, settingData] of Object.entries(defaultSettings)) {
        const settingId = uuidv4();
        await pool.request()
            .input('settingId', settingId)
            .input('userId', req.user.id)
            .input('settingKey', key)
            .input('settingValue', settingData.value)
            .input('settingType', settingData.type)
            .input('category', category)
            .query(`
                INSERT INTO UserSettings (
                    SettingID, UserID, SettingKey, SettingValue, SettingType, Category
                ) VALUES (
                    @settingId, @userId, @settingKey, @settingValue, @settingType, @category
                )
            `);
    }
    
    res.json({
        success: true,
        message: `Cài đặt ${category} đã được reset về mặc định`
    });
}));

// Create backup
router.post('/backup', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();
    const backupId = uuidv4();
    
    try {
        // Get all user data
        const userData = await pool.request()
            .input('userId', req.user.id)
            .query(`
                SELECT 
                    'transactions' as dataType,
                    (SELECT * FROM Transactions WHERE UserID = @userId FOR JSON PATH) as data
                UNION ALL
                SELECT 
                    'categories' as dataType,
                    (SELECT * FROM Categories WHERE UserID = @userId FOR JSON PATH) as data
                UNION ALL
                SELECT 
                    'budgets' as dataType,
                    (SELECT * FROM Budgets WHERE UserID = @userId FOR JSON PATH) as data
                UNION ALL
                SELECT 
                    'settings' as dataType,
                    (SELECT * FROM UserSettings WHERE UserID = @userId FOR JSON PATH) as data
            `);
        
        const backupData = {
            userId: req.user.id,
            createdAt: new Date().toISOString(),
            data: {}
        };
        
        userData.recordset.forEach(row => {
            backupData.data[row.dataType] = row.data ? JSON.parse(row.data) : [];
        });
        
        const backupJson = JSON.stringify(backupData, null, 2);
        const backupSize = Buffer.byteLength(backupJson, 'utf8');
        
        // Save backup record
        await pool.request()
            .input('backupId', backupId)
            .input('userId', req.user.id)
            .input('backupType', 'manual')
            .input('backupSize', backupSize)
            .input('status', 'completed')
            .query(`
                INSERT INTO BackupHistory (
                    BackupID, UserID, BackupType, BackupSize, Status
                ) VALUES (
                    @backupId, @userId, @backupType, @backupSize, @status
                )
            `);
        
        res.json({
            success: true,
            message: 'Sao lưu đã được tạo thành công',
            data: {
                backupId,
                size: backupSize,
                createdAt: new Date().toISOString(),
                downloadData: backupJson // In real app, this would be a download link
            }
        });
        
    } catch (error) {
        // Update backup status to failed
        await pool.request()
            .input('backupId', backupId)
            .input('userId', req.user.id)
            .input('backupType', 'manual')
            .input('status', 'failed')
            .input('errorMessage', error.message)
            .query(`
                INSERT INTO BackupHistory (
                    BackupID, UserID, BackupType, Status, ErrorMessage
                ) VALUES (
                    @backupId, @userId, @backupType, @status, @errorMessage
                )
            `);
        
        throw error;
    }
}));

// Get backup history
router.get('/backup/history', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            SELECT 
                BackupID as id,
                BackupType as type,
                BackupSize as size,
                Status as status,
                ErrorMessage as errorMessage,
                CreatedAt as createdAt
            FROM BackupHistory
            WHERE UserID = @userId
            ORDER BY CreatedAt DESC
        `);
    
    res.json({
        success: true,
        data: result.recordset
    });
}));

// Helper function to get default settings
function getDefaultSettings(category) {
    const defaults = {
        appearance: {
            theme: { value: 'light', type: 'string' },
            language: { value: 'vi', type: 'string' },
            currency: { value: 'VND', type: 'string' }
        },
        notifications: {
            notifications_push: { value: 'true', type: 'boolean' },
            notifications_email: { value: 'true', type: 'boolean' },
            notifications_budget: { value: 'true', type: 'boolean' },
            notifications_achievements: { value: 'true', type: 'boolean' },
            notifications_reports: { value: 'true', type: 'boolean' }
        },
        privacy: {
            show_profile: { value: 'true', type: 'boolean' },
            share_data: { value: 'false', type: 'boolean' },
            analytics: { value: 'true', type: 'boolean' }
        },
        backup: {
            auto_backup: { value: 'true', type: 'boolean' },
            backup_frequency: { value: 'weekly', type: 'string' }
        },
        general: {
            first_time_setup: { value: 'false', type: 'boolean' }
        }
    };
    
    return defaults[category] || {};
}

module.exports = router;
