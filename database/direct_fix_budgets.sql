-- Sửa trực tiếp budgets mà không cần stored procedure
USE PersonalFinanceDB;
GO

PRINT '🔧 SỬA TRỰC TIẾP BUDGETS - KHÔNG CẦN STORED PROCEDURE';
PRINT '====================================================';

-- 1. Xóa procedure cũ nếu có
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
BEGIN
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
    PRINT '✅ Đã xóa procedure cũ';
END

PRINT '';

-- 2. Cập nhật trực tiếp tất cả budgets
PRINT '🔄 Cập nhật trực tiếp tất cả budgets...';

-- Cập nhật category-specific budgets
UPDATE b
SET b.SpentAmount = ISNULL(expense_total.total, 0),
    b.UpdatedAt = GETUTCDATE()
FROM Budgets b
LEFT JOIN (
    SELECT 
        t.UserID,
        t.CategoryID,
        SUM(t.Amount) as total
    FROM Transactions t
    WHERE t.Type = 'Expense'
      AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
      AND t.TransactionDate <= EOMONTH(GETDATE())
    GROUP BY t.UserID, t.CategoryID
) expense_total ON b.UserID = expense_total.UserID AND b.CategoryID = expense_total.CategoryID
WHERE b.IsActive = 1 
  AND b.CategoryID IS NOT NULL
  AND b.Period = 'monthly';

DECLARE @categoryUpdated INT = @@ROWCOUNT;
PRINT 'Cập nhật ' + CAST(@categoryUpdated AS NVARCHAR(10)) + ' category-specific budgets';

-- Cập nhật general budgets (không có category cụ thể)
UPDATE b
SET b.SpentAmount = ISNULL(expense_total.total, 0),
    b.UpdatedAt = GETUTCDATE()
FROM Budgets b
LEFT JOIN (
    SELECT 
        t.UserID,
        SUM(t.Amount) as total
    FROM Transactions t
    WHERE t.Type = 'Expense'
      AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
      AND t.TransactionDate <= EOMONTH(GETDATE())
    GROUP BY t.UserID
) expense_total ON b.UserID = expense_total.UserID
WHERE b.IsActive = 1 
  AND b.CategoryID IS NULL
  AND b.Period = 'monthly';

DECLARE @generalUpdated INT = @@ROWCOUNT;
PRINT 'Cập nhật ' + CAST(@generalUpdated AS NVARCHAR(10)) + ' general budgets';

PRINT '';

-- 3. Hiển thị kết quả chi tiết
PRINT '📊 KẾT QUẢ CHI TIẾT SAU KHI CẬP NHẬT:';

SELECT 
    b.BudgetName as [Tên Ngân Sách],
    ISNULL(c.CategoryName, 'Tất cả danh mục') as [Danh Mục],
    FORMAT(b.BudgetAmount, 'N0') + ' ₫' as [Ngân Sách],
    FORMAT(b.SpentAmount, 'N0') + ' ₫' as [Đã Chi],
    FORMAT(b.BudgetAmount - b.SpentAmount, 'N0') + ' ₫' as [Còn Lại],
    CAST(ROUND((b.SpentAmount * 100.0 / NULLIF(b.BudgetAmount, 0)), 1) AS DECIMAL(5,1)) as [Tỷ Lệ %],
    CASE 
        WHEN b.SpentAmount >= b.BudgetAmount THEN '🔴 Vượt ngân sách'
        WHEN b.SpentAmount >= (b.BudgetAmount * ISNULL(b.WarningThreshold, 80) / 100.0) THEN '🟡 Gần vượt'
        WHEN b.SpentAmount > 0 THEN '🟢 Đang sử dụng'
        ELSE '⚪ Chưa sử dụng'
    END as [Trạng Thái],
    b.Period as [Chu Kỳ]
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
ORDER BY b.SpentAmount DESC, b.BudgetName;

PRINT '';

-- 4. Hiển thị thống kê tổng quan
PRINT '📈 THỐNG KÊ TỔNG QUAN:';

SELECT 
    COUNT(*) as [Tổng số ngân sách],
    COUNT(CASE WHEN b.SpentAmount > 0 THEN 1 END) as [Đang sử dụng],
    COUNT(CASE WHEN b.SpentAmount = 0 THEN 1 END) as [Chưa sử dụng],
    COUNT(CASE WHEN b.SpentAmount >= b.BudgetAmount THEN 1 END) as [Vượt ngân sách],
    FORMAT(SUM(b.BudgetAmount), 'N0') + ' ₫' as [Tổng ngân sách],
    FORMAT(SUM(b.SpentAmount), 'N0') + ' ₫' as [Tổng đã chi]
FROM Budgets b
WHERE b.IsActive = 1;

PRINT '';
PRINT '🎉 HOÀN THÀNH! Ngân sách đã được cập nhật trực tiếp!';
PRINT '';
PRINT '📋 HƯỚNG DẪN TIẾP THEO:';
PRINT '   1. Restart backend server (Ctrl+C rồi npm run dev)';
PRINT '   2. Refresh trang Budget (F5)';
PRINT '   3. Kiểm tra SpentAmount đã hiển thị đúng chưa';
PRINT '   4. Tạo giao dịch chi tiêu mới để test tự động cập nhật';
