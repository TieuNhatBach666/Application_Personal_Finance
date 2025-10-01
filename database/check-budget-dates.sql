-- Kiểm tra thời gian của ngân sách TEST1
USE [PersonalFinanceDB]
GO

SELECT 
    b.BudgetID,
    b.BudgetName,
    c.CategoryName,
    b.BudgetAmount,
    b.SpentAmount,
    b.StartDate,
    b.EndDate,
    b.IsActive,
    DATEDIFF(day, GETDATE(), b.EndDate) as DaysUntilEnd,
    CASE 
        WHEN GETDATE() >= b.StartDate AND GETDATE() <= b.EndDate THEN 'Trong thời gian'
        WHEN GETDATE() < b.StartDate THEN 'Chưa bắt đầu'
        ELSE 'Đã kết thúc'
    END as Status
FROM Budgets b
INNER JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.BudgetName = 'TEST1' OR b.BudgetName LIKE '%test%'

PRINT '-----------------------------------'
PRINT 'Giao dịch Ăn uống trong tháng 9/2025:'
PRINT '-----------------------------------'

SELECT 
    t.TransactionID,
    t.Description,
    t.Amount,
    t.TransactionDate,
    c.CategoryName
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
WHERE c.CategoryName LIKE N'%Ăn uống%'
    AND t.Type = 'Expense'
    AND MONTH(t.TransactionDate) = 9
    AND YEAR(t.TransactionDate) = 2025
ORDER BY t.TransactionDate DESC
