const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true,
        instanceName: 'TIEUNHATBACH'
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Thông tin schema cho database hiện tại
const SCHEMA_INFO = {
    ID_TYPE: 'UNIQUEIDENTIFIER',
    DEFAULT_CATEGORIES_USER_ID: process.env.DEFAULT_CATEGORIES_USER_ID,
    
    TABLES: {
        USERS: 'Users',
        CATEGORIES: 'Categories', 
        TRANSACTIONS: 'Transactions',
        BUDGETS: 'Budgets'
    },
    
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
            NAME: 'CategoryName',
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
            NAME: 'BudgetName',
            TOTAL_AMOUNT: 'BudgetAmount',
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

let pool = null;

const connectDB = async () => {
    try {
        if (pool) {
            return pool;
        }
        
        console.log('🔄 Connecting to SQL Server...');
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server successfully!');
        
        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
};

const closeDB = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('🔌 Database connection closed');
        }
    } catch (error) {
        console.error('❌ Error closing database connection:', error.message);
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return pool;
};

module.exports = {
    connectDB,
    closeDB,
    getPool,
    config,
    SCHEMA_INFO,
    sql
};