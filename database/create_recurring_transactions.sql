-- Create Recurring Transactions table
CREATE TABLE RecurringTransactions (
    RecurringID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    CategoryID UNIQUEIDENTIFIER NOT NULL,
    Description NVARCHAR(255) NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    Type NVARCHAR(10) CHECK (Type IN ('Income', 'Expense')) NOT NULL,
    Frequency NVARCHAR(20) CHECK (Frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NULL, -- NULL means no end date
    NextDueDate DATE NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE
);

-- Create index for performance
CREATE INDEX IX_RecurringTransactions_UserID ON RecurringTransactions(UserID);
CREATE INDEX IX_RecurringTransactions_NextDueDate ON RecurringTransactions(NextDueDate);
CREATE INDEX IX_RecurringTransactions_IsActive ON RecurringTransactions(IsActive);

-- Create Recurring Transaction History table to track generated transactions
CREATE TABLE RecurringTransactionHistory (
    HistoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RecurringID UNIQUEIDENTIFIER NOT NULL,
    TransactionID UNIQUEIDENTIFIER NOT NULL,
    GeneratedDate DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (RecurringID) REFERENCES RecurringTransactions(RecurringID) ON DELETE CASCADE,
    FOREIGN KEY (TransactionID) REFERENCES Transactions(TransactionID) ON DELETE CASCADE
);

-- Stored procedure to process recurring transactions
CREATE OR ALTER PROCEDURE sp_ProcessRecurringTransactions
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    DECLARE @ProcessedCount INT = 0;
    
    -- Cursor to process each due recurring transaction
    DECLARE recurring_cursor CURSOR FOR
    SELECT 
        rt.RecurringID,
        rt.UserID,
        rt.CategoryID,
        rt.Description,
        rt.Amount,
        rt.Type,
        rt.Frequency,
        rt.NextDueDate
    FROM RecurringTransactions rt
    WHERE rt.IsActive = 1
      AND rt.NextDueDate <= @Today
      AND (rt.EndDate IS NULL OR rt.EndDate >= @Today);
    
    DECLARE @RecurringID UNIQUEIDENTIFIER,
            @UserID UNIQUEIDENTIFIER,
            @CategoryID UNIQUEIDENTIFIER,
            @Description NVARCHAR(255),
            @Amount DECIMAL(15,2),
            @Type NVARCHAR(10),
            @Frequency NVARCHAR(20),
            @NextDueDate DATE;
    
    OPEN recurring_cursor;
    FETCH NEXT FROM recurring_cursor INTO 
        @RecurringID, @UserID, @CategoryID, @Description, @Amount, @Type, @Frequency, @NextDueDate;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Create new transaction
        DECLARE @NewTransactionID UNIQUEIDENTIFIER = NEWID();
        
        INSERT INTO Transactions (
            TransactionID, UserID, CategoryID, Description, Amount, Type, Date, CreatedAt
        ) VALUES (
            @NewTransactionID, @UserID, @CategoryID, @Description, @Amount, @Type, @Today, GETDATE()
        );
        
        -- Record in history
        INSERT INTO RecurringTransactionHistory (
            RecurringID, TransactionID
        ) VALUES (
            @RecurringID, @NewTransactionID
        );
        
        -- Calculate next due date based on frequency
        DECLARE @NewNextDueDate DATE;
        
        IF @Frequency = 'Daily'
            SET @NewNextDueDate = DATEADD(DAY, 1, @NextDueDate);
        ELSE IF @Frequency = 'Weekly'
            SET @NewNextDueDate = DATEADD(WEEK, 1, @NextDueDate);
        ELSE IF @Frequency = 'Monthly'
            SET @NewNextDueDate = DATEADD(MONTH, 1, @NextDueDate);
        ELSE IF @Frequency = 'Quarterly'
            SET @NewNextDueDate = DATEADD(QUARTER, 1, @NextDueDate);
        ELSE IF @Frequency = 'Yearly'
            SET @NewNextDueDate = DATEADD(YEAR, 1, @NextDueDate);
        
        -- Update next due date
        UPDATE RecurringTransactions
        SET NextDueDate = @NewNextDueDate,
            UpdatedAt = GETDATE()
        WHERE RecurringID = @RecurringID;
        
        -- Update budget if applicable
        EXEC sp_UpdateBudgetSpentAmount @UserID, @CategoryID;
        
        SET @ProcessedCount = @ProcessedCount + 1;
        
        FETCH NEXT FROM recurring_cursor INTO 
            @RecurringID, @UserID, @CategoryID, @Description, @Amount, @Type, @Frequency, @NextDueDate;
    END;
    
    CLOSE recurring_cursor;
    DEALLOCATE recurring_cursor;
    
    -- Return result
    SELECT @ProcessedCount as ProcessedTransactions;
END;

-- Create job to run daily (this would typically be set up in SQL Server Agent)
-- For now, we'll create a simple procedure that can be called manually or via scheduler

CREATE OR ALTER PROCEDURE sp_DailyRecurringTransactionJob
AS
BEGIN
    EXEC sp_ProcessRecurringTransactions;
END;
