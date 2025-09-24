const sql = require('mssql');

const config = {
    server: 'TIEUNHATBACH\\TIEUNHATBACH',
    database: 'PersonalFinanceDB',
    user: 'sa',
    password: '123456',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

async function checkSchema() {
    try {
        await sql.connect(config);
        console.log('✅ Connected to database');

        // Check Categories table schema
        const categoriesSchema = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Categories'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\n📂 Categories table schema:');
        categoriesSchema.recordset.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // Check Transactions table schema
        const transactionsSchema = await sql.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Transactions'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\n💰 Transactions table schema:');
        transactionsSchema.recordset.forEach(col => {
            console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        await sql.close();
        console.log('\n🔌 Connection closed');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkSchema();