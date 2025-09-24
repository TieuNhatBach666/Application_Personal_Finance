-- Script đơn giản để sửa ngân sách ngay lập tức
USE PersonalFinanceDB;
GO

PRINT '🚀 SỬA NGÂN SÁCH NGAY LẬP TỨC - PHIÊN BẢN ĐỠN GIẢN';
PRINT '===================================================';

-- 1. Xóa procedure cũ nếu có
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
BEGIN
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
    PRINT '✅ Đã xóa procedure cũ';
END

-- 2. Tạo procedure mới đơn giản
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @userId UNIQUEIDENTIFIER,
    @categoryId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Tính ngày tháng hiện tại
    DECLARE @currentDate DATE = GETDATE();
    DECLARE @startOfMonth DATE = DATEFROMPARTS(YEAR(@currentDate), MONTH(@currentDate), 1);
    DECLARE @endOfMonth DATE = EOMONTH(@currentDate);
    
    -- Cập nhật tất cả budgets của user này cho category này
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.Type = 'Expense'
          AND t.CategoryID = @categoryId
          AND t.TransactionDate >= @startOfMonth
          AND t.TransactionDate <= @endOfMonth
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.IsActive = 1
      AND b.Period = 'monthly'; -- Chỉ cập nhật monthly budgets
    
    -- Log kết quả
    DECLARE @updatedCount INT = @@ROWCOUNT;
    PRINT 'Updated ' + CAST(@updatedCount AS NVARCHAR(10)) + ' budgets for category ' + CAST(@categoryId AS NVARCHAR(36));
END;
GO

PRINT '✅ Tạo procedure mới thành công!';

-- 3. Cập nhật tất cả budgets hiện có
PRINT '';
PRINT '🔄 Cập nhật tất cả budgets hiện có...';

DECLARE @userId UNIQUEIDENTIFIER;
DECLARE @categoryId UNIQUEIDENTIFIER;
DECLARE @budgetName NVARCHAR(255);

DECLARE budget_cursor CURSOR FOR
SELECT DISTINCT b.UserID, b.CategoryID, b.BudgetName
FROM Budgets b
WHERE b.IsActive = 1 
  AND b.CategoryID IS NOT NULL 
  AND b.Period = 'monthly'; -- Chỉ xử lý monthly budgets

OPEN budget_cursor;
FETCH NEXT FROM budget_cursor INTO @userId, @categoryId, @budgetName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '   📊 Cập nhật: ' + @budgetName;
    EXEC sp_UpdateBudgetSpentAmount @userId, @categoryId;
    FETCH NEXT FROM budget_cursor INTO @userId, @categoryId, @budgetName;
END

CLOSE budget_cursor;
DEALLOCATE budget_cursor;

-- 4. Cập nhật general budgets (không có category cụ thể)
PRINT '';
PRINT '🔄 Cập nhật general budgets...';

UPDATE b
SET b.SpentAmount = (
    SELECT ISNULL(SUM(t.Amount), 0)
    FROM Transactions t
    WHERE t.UserID = b.UserID
      AND t.Type = 'Expense'
      AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
      AND t.TransactionDate <= EOMONTH(GETDATE())
),
b.UpdatedAt = GETUTCDATE()
FROM Budgets b
WHERE b.IsActive = 1
  AND b.CategoryID IS NULL
  AND b.Period = 'monthly';

DECLARE @generalUpdated INT = @@ROWCOUNT;
PRINT 'Cập nhật ' + CAST(@generalUpdated AS NVARCHAR(10)) + ' general budgets';

-- 5. Hiển thị kết quả
PRINT '';
PRINT '📊 KẾT QUẢ SAU KHI CẬP NHẬT:';

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
        ELSE '🟢 An toàn'
    END as [Trạng Thái]
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
ORDER BY b.SpentAmount DESC;

PRINT '';
PRINT '🎉 HOÀN THÀNH! Ngân sách giờ sẽ hiển thị đúng dữ liệu thực tế!';
PRINT '';
PRINT '📋 HƯỚNG DẪN TIẾP THEO:';
PRINT '   1. Restart backend server (Ctrl+C rồi npm run dev)';
PRINT '   2. Refresh trang Budget (F5)';
PRINT '   3. Tạo giao dịch chi tiêu mới để test tự động cập nhật';
PRINT '   4. Ngân sách sẽ tự động cập nhật khi có giao dịch mới!';
