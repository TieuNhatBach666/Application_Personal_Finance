-- Script để xóa computed column AlertThreshold khỏi bảng Budgets
-- Vì AlertThreshold là computed column nên không thể UPDATE được

USE [PersonalFinanceDB]
GO

-- Kiểm tra xem computed column có tồn tại không
IF EXISTS (
    SELECT * FROM sys.computed_columns 
    WHERE object_id = OBJECT_ID('dbo.Budgets') 
    AND name = 'AlertThreshold'
)
BEGIN
    PRINT '🔍 Found computed column AlertThreshold, dropping it...'
    
    -- Xóa computed column AlertThreshold
    ALTER TABLE [dbo].[Budgets] 
    DROP COLUMN [AlertThreshold]
    
    PRINT '✅ Successfully dropped computed column AlertThreshold'
END
ELSE
BEGIN
    PRINT '❌ Computed column AlertThreshold not found'
END

-- Kiểm tra kết quả
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Budgets' 
    AND TABLE_SCHEMA = 'dbo'
    AND COLUMN_NAME IN ('WarningThreshold', 'AlertThreshold')
ORDER BY COLUMN_NAME

PRINT '🎯 Current Budgets table columns related to threshold:'

-- Kiểm tra stored procedure sp_UpdateBudgetSpentAmount
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
BEGIN
    PRINT '✅ Stored procedure sp_UpdateBudgetSpentAmount exists'
END
ELSE
BEGIN
    PRINT '❌ Stored procedure sp_UpdateBudgetSpentAmount NOT found - creating it...'
    
    CREATE PROCEDURE sp_UpdateBudgetSpentAmount
        @userId UNIQUEIDENTIFIER,
        @categoryId UNIQUEIDENTIFIER
    AS
    BEGIN
        UPDATE Budgets 
        SET SpentAmount = (
            SELECT ISNULL(SUM(Amount), 0)
            FROM Transactions 
            WHERE CategoryID = @categoryId 
                AND UserID = @userId
                AND Type = 'Expense'
                AND TransactionDate >= Budgets.StartDate 
                AND TransactionDate <= Budgets.EndDate
        )
        WHERE UserID = @userId 
            AND CategoryID = @categoryId 
            AND IsActive = 1
    END
    
    PRINT '✅ Created stored procedure sp_UpdateBudgetSpentAmount'
END
