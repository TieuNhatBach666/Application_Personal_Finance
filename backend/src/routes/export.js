const express = require('express');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { getPool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Xuất dữ liệu Excel
router.get('/excel', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();
    
    // Lấy dữ liệu từ database
    const [transactions, categories, budgets] = await Promise.all([
        // Transactions
        pool.request()
            .input('userId', req.user.id)
            .query(`
                SELECT 
                    t.TransactionID,
                    t.Amount,
                    t.Description,
                    t.TransactionDate,
                    t.Type,
                    c.CategoryName,
                    t.CreatedAt
                FROM Transactions t
                LEFT JOIN Categories c ON t.CategoryID = c.CategoryID
                WHERE t.UserID = @userId
                ORDER BY t.TransactionDate DESC
            `),
        
        // Categories
        pool.request()
            .input('userId', req.user.id)
            .query(`
                SELECT CategoryName, Type, CreatedAt
                FROM Categories
                WHERE UserID = @userId
                ORDER BY CategoryName
            `),
        
        // Budgets
        pool.request()
            .input('userId', req.user.id)
            .query(`
                SELECT 
                    b.BudgetName,
                    b.BudgetAmount,
                    b.StartDate,
                    b.EndDate,
                    c.CategoryName,
                    b.CreatedAt
                FROM Budgets b
                LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
                WHERE b.UserID = @userId
                ORDER BY b.StartDate DESC
            `)
    ]);
    
    // Tạo workbook Excel
    const workbook = new ExcelJS.Workbook();
    
    // Sheet Transactions
    const transactionSheet = workbook.addWorksheet('Giao Dịch');
    transactionSheet.columns = [
        { header: 'ID', key: 'TransactionID', width: 15 },
        { header: 'Số Tiền', key: 'Amount', width: 15 },
        { header: 'Mô Tả', key: 'Description', width: 30 },
        { header: 'Ngày', key: 'TransactionDate', width: 15 },
        { header: 'Loại', key: 'Type', width: 10 },
        { header: 'Danh Mục', key: 'CategoryName', width: 20 },
        { header: 'Ngày Tạo', key: 'CreatedAt', width: 20 }
    ];
    
    transactions.recordset.forEach(transaction => {
        transactionSheet.addRow({
            TransactionID: transaction.TransactionID,
            Amount: transaction.Amount,
            Description: transaction.Description,
            TransactionDate: transaction.TransactionDate,
            Type: transaction.Type === 'Income' ? 'Thu nhập' : 'Chi tiêu',
            CategoryName: transaction.CategoryName,
            CreatedAt: transaction.CreatedAt
        });
    });
    
    // Sheet Categories
    const categorySheet = workbook.addWorksheet('Danh Mục');
    categorySheet.columns = [
        { header: 'Tên Danh Mục', key: 'CategoryName', width: 25 },
        { header: 'Loại', key: 'Type', width: 15 },
        { header: 'Ngày Tạo', key: 'CreatedAt', width: 20 }
    ];
    
    categories.recordset.forEach(category => {
        categorySheet.addRow({
            CategoryName: category.CategoryName,
            Type: category.Type === 'Income' ? 'Thu nhập' : 'Chi tiêu',
            CreatedAt: category.CreatedAt
        });
    });
    
    // Sheet Budgets
    const budgetSheet = workbook.addWorksheet('Ngân Sách');
    budgetSheet.columns = [
        { header: 'Tên Ngân Sách', key: 'BudgetName', width: 25 },
        { header: 'Số Tiền', key: 'BudgetAmount', width: 15 },
        { header: 'Ngày Bắt Đầu', key: 'StartDate', width: 15 },
        { header: 'Ngày Kết Thúc', key: 'EndDate', width: 15 },
        { header: 'Danh Mục', key: 'CategoryName', width: 20 },
        { header: 'Ngày Tạo', key: 'CreatedAt', width: 20 }
    ];
    
    budgets.recordset.forEach(budget => {
        budgetSheet.addRow({
            BudgetName: budget.BudgetName,
            BudgetAmount: budget.BudgetAmount,
            StartDate: budget.StartDate,
            EndDate: budget.EndDate,
            CategoryName: budget.CategoryName,
            CreatedAt: budget.CreatedAt
        });
    });
    
    // Style headers
    [transactionSheet, categorySheet, budgetSheet].forEach(sheet => {
        sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
        });
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=personal-finance-data.xlsx');
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
}));

// Xuất dữ liệu PDF
router.get('/pdf', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();
    
    // Lấy dữ liệu tóm tắt
    const [summary, recentTransactions] = await Promise.all([
        // Summary
        pool.request()
            .input('userId', req.user.id)
            .query(`
                SELECT 
                    COUNT(*) as TotalTransactions,
                    SUM(CASE WHEN Type = 'Income' THEN Amount ELSE 0 END) as TotalIncome,
                    SUM(CASE WHEN Type = 'Expense' THEN Amount ELSE 0 END) as TotalExpense
                FROM Transactions
                WHERE UserID = @userId
            `),
        
        // Recent transactions
        pool.request()
            .input('userId', req.user.id)
            .query(`
                SELECT TOP 20
                    t.Amount,
                    t.Description,
                    t.TransactionDate,
                    t.Type,
                    ISNULL(c.CategoryName, N'Khác') as CategoryName
                FROM Transactions t
                LEFT JOIN Categories c ON t.CategoryID = c.CategoryID
                WHERE t.UserID = @userId
                ORDER BY t.TransactionDate DESC
            `)
    ]);
    
    // Tạo PDF với cấu hình tốt hơn
    const doc = new PDFDocument({
        bufferPages: true,
        autoFirstPage: true,
        size: 'A4',
        margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
        }
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=personal-finance-report.pdf');
    
    // Pipe to response
    doc.pipe(res);
    
    // Helper function để format số tiền
    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return '0';
        return new Intl.NumberFormat('vi-VN').format(amount);
    };
    
    // Helper function để format ngày
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };
    
    // Title
    doc.fontSize(20).text('PERSONAL FINANCE REPORT', { align: 'center' });
    doc.fontSize(16).text('BAO CAO TAI CHINH CA NHAN', { align: 'center' });
    doc.moveDown(2);
    
    // Summary
    const summaryData = summary.recordset[0];
    const totalIncome = summaryData.TotalIncome || 0;
    const totalExpense = summaryData.TotalExpense || 0;
    const balance = totalIncome - totalExpense;
    
    doc.fontSize(16).text('SUMMARY / TONG QUAN', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total Transactions / Tong giao dich: ${summaryData.TotalTransactions || 0}`);
    doc.text(`Total Income / Tong thu nhap: ${formatCurrency(totalIncome)} VND`);
    doc.text(`Total Expense / Tong chi tieu: ${formatCurrency(totalExpense)} VND`);
    doc.text(`Balance / So du: ${formatCurrency(balance)} VND`);
    doc.moveDown(2);
    
    // Recent transactions
    doc.fontSize(16).text('RECENT TRANSACTIONS / GIAO DICH GAN DAY', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    
    if (recentTransactions.recordset.length === 0) {
        doc.text('No transactions found / Khong co giao dich nao.');
    } else {
        recentTransactions.recordset.forEach((transaction, index) => {
            const date = formatDate(transaction.TransactionDate);
            const type = transaction.Type === 'Income' ? 'Income/Thu' : 'Expense/Chi';
            const amount = formatCurrency(transaction.Amount);
            
            // Làm sạch text để tránh lỗi encoding
            const cleanText = (text) => {
                if (!text) return 'N/A';
                return text.replace(/[^\x00-\x7F]/g, '?').substring(0, 40);
            };
            
            const description = cleanText(transaction.Description) || 'No description';
            const category = cleanText(transaction.CategoryName) || 'Other';
            
            doc.text(`${index + 1}. ${date} - ${type} - ${amount} VND`);
            doc.text(`   Description: ${description}`);
            doc.text(`   Category: ${category}`);
            doc.moveDown(0.3);
        });
    }
    
    // Footer
    doc.moveDown(2);
    const currentDate = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    doc.fontSize(8).text(`Report generated on: ${currentDate} at ${currentTime}`, { align: 'center' });
    
    // Finalize PDF
    doc.end();
}));

module.exports = router;
