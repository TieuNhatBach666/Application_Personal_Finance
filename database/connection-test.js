// Database connection test for Personal Finance Manager
// Server: TIEUNHATBACH\TIEUNHATBACH
// Login: sa / Password: 123456

const sql = require('mssql');

const config = {
    server: 'TIEUNHATBACH\\TIEUNHATBACH',
    database: 'PersonalFinanceDB',
    user: 'sa',
    password: '123456',
    options: {
        encrypt: false, // Use this if you're on Azure
        trustServerCertificate: true, // Use this if you're on local dev / self-signed certs
        enableArithAbort: true,
        instanceName: 'TIEUNHATBACH' // Instance name
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Schema information for existing database
const SCHEMA_INFO = {
    // All IDs use UNIQUEIDENTIFIER instead of INT
    ID_TYPE: 'UNIQUEIDENTIFIER',
    DEFAULT_CATEGORIES_USER_ID: '00000000-0000-0000-0000-000000000000',
    
    // Table mappings to match existing schema
    TABLES: {
        USERS: 'Users',
        CATEGORIES: 'Categories', 
        TRANSACTIONS: 'Transactions',
        BUDGETS: 'Budgets'
    },
    
    // Column mappings
    COLUMNS: {
        USERS: {
            ID: 'UserID',
            EMAIL: 'Email',
            PASSWORD_HASH: 'PasswordHash',
            FIRST_NAME: 'FirstName',
            LAST_NAME: 'LastName',
            PHONE: 'PhoneNumber',
            AVATAR: 'AvatarURL',
            CURRENCY: 'Currency',
            LANGUAGE: 'Language',
            TIMEZONE: 'TimeZone',
            IS_EMAIL_VERIFIED: 'IsEmailVerified',
            IS_ACTIVE: 'IsActive',
            CREATED_AT: 'CreatedAt',
            UPDATED_AT: 'UpdatedAt'
        },
        CATEGORIES: {
            ID: 'CategoryID',
            USER_ID: 'UserID',
            NAME: 'Name',
            TYPE: 'Type',
            ICON: 'Icon',
            COLOR: 'Color',
            PARENT_ID: 'ParentCategoryID',
            IS_ACTIVE: 'IsActive',
            CREATED_AT: 'CreatedAt',
            UPDATED_AT: 'UpdatedAt'
        },
        TRANSACTIONS: {
            ID: 'TransactionID',
            USER_ID: 'UserID',
            CATEGORY_ID: 'CategoryID',
            AMOUNT: 'Amount',
            TYPE: 'Type',
            DESCRIPTION: 'Description',
            DATE: 'TransactionDate',
            RECEIPT_URL: 'ReceiptURL',
            TAGS: 'Tags',
            CREATED_AT: 'CreatedAt',
            UPDATED_AT: 'UpdatedAt'
        },
        BUDGETS: {
            ID: 'BudgetID',
            USER_ID: 'UserID',
            NAME: 'Name',
            TOTAL_AMOUNT: 'TotalAmount',
            PERIOD: 'Period',
            START_DATE: 'StartDate',
            END_DATE: 'EndDate',
            ALERT_THRESHOLD: 'AlertThreshold',
            IS_ACTIVE: 'IsActive',
            CREATED_AT: 'CreatedAt',
            UPDATED_AT: 'UpdatedAt'
        }
    }
};

async function testConnection() {
    try {
        console.log('🔄 Attempting to connect to SQL Server...');
        console.log('Server:', config.server);
        console.log('Database:', config.database);
        console.log('User:', config.user);
        
        // Create connection pool
        const pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server successfully!');
        
        // Test query
        const result = await pool.request().query('SELECT @@VERSION as Version, DB_NAME() as DatabaseName');
        console.log('📊 Database Info:');
        console.log('Version:', result.recordset[0].Version);
        console.log('Database:', result.recordset[0].DatabaseName);
        
        // Test if tables exist
        const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        console.log('📋 Tables in database:');
        if (tablesResult.recordset.length > 0) {
            tablesResult.recordset.forEach(table => {
                console.log('  -', table.TABLE_NAME);
            });
        } else {
            console.log('  No tables found. Please run create-database.sql first.');
        }
        
        // Close connection
        await pool.close();
        console.log('🔌 Connection closed successfully.');
        
    } catch (err) {
        console.error('❌ Database connection failed:');
        console.error('Error:', err.message);
        
        if (err.code === 'ELOGIN') {
            console.error('💡 Login failed. Please check:');
            console.error('   - Username and password are correct');
            console.error('   - SQL Server Authentication is enabled');
            console.error('   - User has permission to access the database');
        } else if (err.code === 'ETIMEOUT') {
            console.error('💡 Connection timeout. Please check:');
            console.error('   - SQL Server is running');
            console.error('   - Server name is correct');
            console.error('   - Network connectivity');
        } else if (err.code === 'ENOTFOUND') {
            console.error('💡 Server not found. Please check:');
            console.error('   - Server name is correct: TIEUNHATBACH\\TIEUNHATBACH');
            console.error('   - SQL Server is running');
            console.error('   - SQL Server Browser service is running');
        }
    }
}

// Test categories query
async function testCategoriesQuery() {
    try {
        const pool = await sql.connect(config);
        
        console.log('\n📋 Testing categories query:');
        const result = await pool.request().query(`
            SELECT 
                CategoryID,
                Name,
                Type,
                Icon,
                Color,
                IsActive
            FROM Categories 
            WHERE UserID = '00000000-0000-0000-0000-000000000000'
            ORDER BY Type, Name
        `);
        
        console.log(`Found ${result.recordset.length} default categories:`);
        result.recordset.forEach(cat => {
            console.log(`  ${cat.Type}: ${cat.Name} (${cat.Icon}, ${cat.Color})`);
        });
        
        await pool.close();
        
    } catch (err) {
        console.error('❌ Categories query failed:', err.message);
    }
}

// Run the tests
async function runAllTests() {
    await testConnection();
    await testCategoriesQuery();
}

runAllTests();

module.exports = { config, testConnection, SCHEMA_INFO };