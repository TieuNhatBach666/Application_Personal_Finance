-- ==========================================
-- Update Budget SpentAmount
-- Cập nhật lại số tiền đã chi của ngân sách
-- ==========================================

USE PersonalFinanceDB;
GO

-- Lấy danh sách budget đang active
SELECT 
    b.BudgetID,
    b.BudgetName,
    b.CategoryID,
    c.CategoryName,
    b.BudgetAmount,
    b.SpentAmount as 'SpentAmount hiện tại',
    b.StartDate,
    b.EndDate
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.UserID = '72871371-800B-44BD-AA71-C00F97A9343F'
  AND b.IsActive = 1;

GO

-- Update từng budget (thay YOUR_CATEGORY_ID bằng CategoryID thực tế)
-- Ví dụ với category Ăn uống:

DECLARE @userId UNIQUEIDENTIFIER = '72871371-800B-44BD-AA71-C00F97A9343F';
DECLARE @categoryId UNIQUEIDENTIFIER = '1D843B5A-D154-46FD-9CBE-48BAF5BC4A87'; -- Thay bằng CategoryID thực tế

EXEC sp_UpdateBudgetSpentAmount 
  @userId = @userId,
  @categoryId = @categoryId;

GO

-- Kiểm tra sau khi update
SELECT 
    b.BudgetID,
    b.BudgetName,
    c.CategoryName,
    b.BudgetAmount,
    b.SpentAmount as 'SpentAmount sau khi update',
    CAST((CAST(b.SpentAmount AS FLOAT) / b.BudgetAmount * 100) AS DECIMAL(10,2)) as 'Phần trăm sử dụng'
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.UserID = '72871371-800B-44BD-AA71-C00F97A9343F'
  AND b.IsActive = 1;

GO
