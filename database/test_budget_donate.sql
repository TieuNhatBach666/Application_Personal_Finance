-- Test budget Donate đơn giản
USE PersonalFinanceDB;
GO

PRINT '🧪 TEST BUDGET DONATE';
PRINT '====================';

-- 1. Thông tin budget Donate
PRINT '1. THÔNG TIN BUDGET DONATE:';
SELECT 
    BudgetName,
    Period,
    BudgetAmount,
    SpentAmount,
    UserID,
    CategoryID
FROM Budgets 
WHERE BudgetName = 'Donate';

PRINT '';

-- 2. Transactions của user này với category Ăn uống
PRINT '2. TRANSACTIONS ĂN UỐNG:';
SELECT 
    TransactionDate,
    Amount,
    CASE 
        WHEN TransactionDate = '2025-09-23' THEN 'HÔM NAY'
        WHEN TransactionDate >= '2025-09-01' THEN 'THÁNG NÀY'
        ELSE 'THÁNG KHÁC'
    END as [Thời gian]
FROM Transactions t
INNER JOIN Budgets b ON t.UserID = b.UserID AND t.CategoryID = b.CategoryID
WHERE b.BudgetName = 'Donate' 
  AND t.Type = 'Expense'
ORDER BY t.TransactionDate DESC;

PRINT '';

-- 3. Tính toán manual cho daily budget
PRINT '3. TÍNH TOÁN MANUAL CHO DAILY BUDGET:';

DECLARE @userIdDonate UNIQUEIDENTIFIER;
DECLARE @categoryIdDonate UNIQUEIDENTIFIER;
DECLARE @todaySpent DECIMAL(18,2);
DECLARE @monthSpent DECIMAL(18,2);

SELECT @userIdDonate = UserID, @categoryIdDonate = CategoryID 
FROM Budgets WHERE BudgetName = 'Donate';

-- Tính chi tiêu hôm nay
SELECT @todaySpent = ISNULL(SUM(Amount), 0)
FROM Transactions
WHERE UserID = @userIdDonate
  AND CategoryID = @categoryIdDonate
  AND Type = 'Expense'
  AND TransactionDate = '2025-09-23';

-- Tính chi tiêu tháng này
SELECT @monthSpent = ISNULL(SUM(Amount), 0)
FROM Transactions
WHERE UserID = @userIdDonate
  AND CategoryID = @categoryIdDonate
  AND Type = 'Expense'
  AND TransactionDate >= '2025-09-01'
  AND TransactionDate <= '2025-09-30';

PRINT 'Chi tiêu hôm nay (23/09): ' + CAST(@todaySpent AS NVARCHAR(20)) + ' VND';
PRINT 'Chi tiêu tháng 9: ' + CAST(@monthSpent AS NVARCHAR(20)) + ' VND';

-- 4. Cập nhật trực tiếp budget Donate
PRINT '';
PRINT '4. CẬP NHẬT TRỰC TIẾP BUDGET DONATE:';

UPDATE Budgets
SET SpentAmount = @todaySpent,  -- Vì là daily budget
    UpdatedAt = GETUTCDATE()
WHERE BudgetName = 'Donate';

PRINT 'Đã cập nhật budget Donate với SpentAmount = ' + CAST(@todaySpent AS NVARCHAR(20));

-- 5. Hiển thị kết quả cuối
PRINT '';
PRINT '5. KẾT QUẢ SAU KHI CẬP NHẬT:';
SELECT 
    BudgetName,
    Period,
    FORMAT(BudgetAmount, 'N0') + ' VND' as [Ngân sách],
    FORMAT(SpentAmount, 'N0') + ' VND' as [Đã chi],
    CAST(ROUND((SpentAmount * 100.0 / NULLIF(BudgetAmount, 0)), 1) AS DECIMAL(5,1)) as [Tỷ lệ %]
FROM Budgets 
WHERE BudgetName = 'Donate';

PRINT '';
PRINT '📋 KẾT LUẬN:';
PRINT '   - Nếu SpentAmount > 0: Budget hoạt động đúng';
PRINT '   - Nếu SpentAmount = 0: Không có giao dịch hôm nay';
PRINT '   - Daily budget chỉ tính giao dịch ngày 23/09/2025';
