const express = require('express');
const { sql, getPool, SCHEMA_INFO } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get overview statistics
router.get('/overview', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp startDate và endDate'
            });
        }

        const pool = getPool();

        // Get total income and expense
        const summaryResult = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT 
                    SUM(CASE WHEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = 'Income' THEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT} ELSE 0 END) as TotalIncome,
                    SUM(CASE WHEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = 'Expense' THEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT} ELSE 0 END) as TotalExpense,
                    COUNT(*) as TransactionCount
                FROM ${SCHEMA_INFO.TABLES.TRANSACTIONS} 
                WHERE ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.USER_ID} = @userId 
                AND ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} >= @startDate 
                AND ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} <= @endDate
            `);

        const summary = summaryResult.recordset[0];
        const totalIncome = summary.TotalIncome || 0;
        const totalExpense = summary.TotalExpense || 0;
        const netSavings = totalIncome - totalExpense;
        const transactionCount = summary.TransactionCount || 0;

        res.json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                netSavings,
                transactionCount,
                period: {
                    startDate,
                    endDate
                }
            }
        });

    } catch (error) {
        console.error('Error fetching overview statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê tổng quan',
            error: error.message
        });
    }
});

// Get category breakdown statistics
router.get('/by-category', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, type = 'Expense' } = req.query;
        const userId = req.user.id;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp startDate và endDate'
            });
        }

        const pool = getPool();

        // Get category breakdown
        const categoryResult = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .input('type', sql.VarChar, type)
            .query(`
                SELECT 
                    c.${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME} as CategoryName,
                    c.${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON} as Icon,
                    c.${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR} as Color,
                    SUM(t.${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT}) as TotalAmount,
                    COUNT(t.${SCHEMA_INFO.COLUMNS.TRANSACTIONS.ID}) as TransactionCount
                FROM ${SCHEMA_INFO.TABLES.TRANSACTIONS} t
                INNER JOIN ${SCHEMA_INFO.TABLES.CATEGORIES} c ON t.${SCHEMA_INFO.COLUMNS.TRANSACTIONS.CATEGORY_ID} = c.${SCHEMA_INFO.COLUMNS.CATEGORIES.ID}
                WHERE t.${SCHEMA_INFO.COLUMNS.TRANSACTIONS.USER_ID} = @userId 
                AND t.${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} >= @startDate 
                AND t.${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} <= @endDate
                AND t.${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = @type
                GROUP BY c.${SCHEMA_INFO.COLUMNS.CATEGORIES.ID}, c.${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME}, c.${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON}, c.${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR}
                ORDER BY TotalAmount DESC
            `);

        const categories = categoryResult.recordset;
        const totalAmount = categories.reduce((sum, cat) => sum + cat.TotalAmount, 0);

        // Calculate percentages
        const categoryBreakdown = categories.map(category => ({
            name: category.CategoryName,
            amount: category.TotalAmount,
            percentage: totalAmount > 0 ? Math.round((category.TotalAmount / totalAmount) * 100 * 10) / 10 : 0,
            color: category.Color || '#3498db',
            icon: category.Icon || '📝',
            transactionCount: category.TransactionCount
        }));

        res.json({
            success: true,
            data: {
                categories: categoryBreakdown,
                totalAmount,
                type,
                period: {
                    startDate,
                    endDate
                }
            }
        });

    } catch (error) {
        console.error('Error fetching category statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê theo danh mục',
            error: error.message
        });
    }
});

// Get trends statistics (monthly/weekly breakdown)
router.get('/trends', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, period = 'month' } = req.query;
        const userId = req.user.id;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp startDate và endDate'
            });
        }

        const pool = getPool();

        let dateFormat;
        switch (period) {
            case 'week':
                dateFormat = `CONCAT(YEAR(${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE}), '-W', DATEPART(week, ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE}))`;
                break;
            case 'month':
                dateFormat = `CONCAT(YEAR(${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE}), '-', FORMAT(MONTH(${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE}), '00'))`;
                break;
            case 'year':
                dateFormat = `YEAR(${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE})`;
                break;
            default:
                dateFormat = `CONCAT(YEAR(${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE}), '-', FORMAT(MONTH(${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE}), '00'))`;
        }

        const query = `
            SELECT 
                ${dateFormat} as Period,
                SUM(CASE WHEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = 'Income' THEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT} ELSE 0 END) as Income,
                SUM(CASE WHEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = 'Expense' THEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT} ELSE 0 END) as Expense,
                COUNT(*) as TransactionCount
            FROM ${SCHEMA_INFO.TABLES.TRANSACTIONS} 
            WHERE ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.USER_ID} = @userId 
            AND ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} >= @startDate 
            AND ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} <= @endDate
            GROUP BY ${dateFormat}
            ORDER BY Period
        `;

        const trendsResult = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(query);

        const trends = trendsResult.recordset.map(trend => ({
            period: trend.Period,
            income: trend.Income || 0,
            expense: trend.Expense || 0,
            netSavings: (trend.Income || 0) - (trend.Expense || 0),
            transactionCount: trend.TransactionCount || 0
        }));

        res.json({
            success: true,
            data: {
                trends,
                periodType: period,
                period: {
                    startDate,
                    endDate
                }
            }
        });

    } catch (error) {
        console.error('Error fetching trends statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê xu hướng',
            error: error.message
        });
    }
});

// Get comparison statistics (compare with previous period)
router.get('/comparison', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp startDate và endDate'
            });
        }

        const pool = getPool();

        // Calculate previous period dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const periodLength = end.getTime() - start.getTime();
        const prevStart = new Date(start.getTime() - periodLength);
        const prevEnd = new Date(start.getTime() - 1);

        // Get current period stats
        const currentResult = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
                SELECT 
                    SUM(CASE WHEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = 'Income' THEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT} ELSE 0 END) as TotalIncome,
                    SUM(CASE WHEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = 'Expense' THEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT} ELSE 0 END) as TotalExpense,
                    COUNT(*) as TransactionCount
                FROM ${SCHEMA_INFO.TABLES.TRANSACTIONS} 
                WHERE ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.USER_ID} = @userId 
                AND ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} >= @startDate 
                AND ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} <= @endDate
            `);

        // Get previous period stats
        const previousResult = await pool.request()
            .input('userId', sql.UniqueIdentifier, userId)
            .input('startDate', sql.Date, prevStart.toISOString().split('T')[0])
            .input('endDate', sql.Date, prevEnd.toISOString().split('T')[0])
            .query(`
                SELECT 
                    SUM(CASE WHEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = 'Income' THEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT} ELSE 0 END) as TotalIncome,
                    SUM(CASE WHEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.TYPE} = 'Expense' THEN ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.AMOUNT} ELSE 0 END) as TotalExpense,
                    COUNT(*) as TransactionCount
                FROM ${SCHEMA_INFO.TABLES.TRANSACTIONS} 
                WHERE ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.USER_ID} = @userId 
                AND ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} >= @startDate 
                AND ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.DATE} <= @endDate
            `);

        const current = currentResult.recordset[0];
        const previous = previousResult.recordset[0];

        const currentIncome = current.TotalIncome || 0;
        const currentExpense = current.TotalExpense || 0;
        const currentSavings = currentIncome - currentExpense;

        const previousIncome = previous.TotalIncome || 0;
        const previousExpense = previous.TotalExpense || 0;
        const previousSavings = previousIncome - previousExpense;

        // Calculate growth percentages
        const incomeGrowth = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
        const expenseGrowth = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0;
        const savingsGrowth = previousSavings !== 0 ? ((currentSavings - previousSavings) / Math.abs(previousSavings)) * 100 : 0;

        res.json({
            success: true,
            data: {
                current: {
                    income: currentIncome,
                    expense: currentExpense,
                    savings: currentSavings,
                    transactionCount: current.TransactionCount || 0
                },
                previous: {
                    income: previousIncome,
                    expense: previousExpense,
                    savings: previousSavings,
                    transactionCount: previous.TransactionCount || 0
                },
                growth: {
                    income: Math.round(incomeGrowth * 10) / 10,
                    expense: Math.round(expenseGrowth * 10) / 10,
                    savings: Math.round(savingsGrowth * 10) / 10
                },
                periods: {
                    current: { startDate, endDate },
                    previous: {
                        startDate: prevStart.toISOString().split('T')[0],
                        endDate: prevEnd.toISOString().split('T')[0]
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching comparison statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê so sánh',
            error: error.message
        });
    }
});

module.exports = router;