# Database Setup for Personal Finance Manager

## Connection Information
- **Server Name:** TIEUNHATBACH\TIEUNHATBACH
- **Login:** sa
- **Password:** 123456
- **Database:** PersonalFinanceDB

## Setup Instructions

### 1. Install Dependencies
```bash
cd database
npm install
```

### 2. Test Database Connection
```bash
npm run test-connection
```

### 3. Create Database Schema
Execute the SQL scripts in SQL Server Management Studio or using sqlcmd:

```bash
# Using sqlcmd (if available)
sqlcmd -S "TIEUNHATBACH\TIEUNHATBACH" -U sa -P 123456 -i create-database.sql
sqlcmd -S "TIEUNHATBACH\TIEUNHATBACH" -U sa -P 123456 -i seed-data.sql
```

Or manually run the scripts in SQL Server Management Studio:
1. Open SQL Server Management Studio
2. Connect to `TIEUNHATBACH\TIEUNHATBACH` with sa/123456
3. Open and execute `create-database.sql`
4. Open and execute `seed-data.sql`

## Database Schema

### Tables Created:
1. **Users** - User accounts and authentication
2. **Categories** - Income and expense categories
3. **Transactions** - All financial transactions
4. **Budgets** - Monthly budget allocations
5. **UserSettings** - User preferences and settings
6. **Notifications** - System notifications and alerts

### Default Categories:
**Income Categories:**
- Lương (Salary)
- Thưởng (Bonus)
- Phụ cấp (Allowance)
- Đầu tư (Investment)
- Kinh doanh (Business)
- Thu nhập khác (Other Income)

**Expense Categories:**
- Ăn uống (Food & Dining)
- Đi lại (Transportation)
- Học tập (Education)
- Giải trí (Entertainment)
- Y tế (Healthcare)
- Mua sắm (Shopping)
- Hóa đơn (Bills)
- Nhà ở (Housing)
- Quần áo (Clothing)
- Chi tiêu khác (Other Expenses)

### Stored Procedures:
- `sp_CreateDefaultCategoriesForUser` - Creates default categories for new users

### Functions:
- `fn_GetBudgetProgress` - Calculates budget progress and status

### Views:
- `vw_TransactionSummary` - Aggregated transaction data by month/category

## Performance Optimizations

### Indexes Created:
- `IX_Transactions_UserID_Date` - For transaction queries by user and date
- `IX_Transactions_CategoryID` - For category-based filtering
- `IX_Categories_UserID_Type` - For category management
- `IX_Budgets_UserID_Month_Year` - For budget queries
- `IX_UserSettings_UserID_Key` - For settings lookup
- `IX_Notifications_UserID_Read` - For notification queries

## Troubleshooting

### Common Connection Issues:

1. **Login Failed (ELOGIN)**
   - Check if SQL Server Authentication is enabled
   - Verify sa account is enabled and password is correct
   - Check if user has permission to access the database

2. **Connection Timeout (ETIMEOUT)**
   - Ensure SQL Server service is running
   - Check if TCP/IP protocol is enabled
   - Verify firewall settings

3. **Server Not Found (ENOTFOUND)**
   - Confirm server name: `TIEUNHATBACH\TIEUNHATBACH`
   - Ensure SQL Server Browser service is running
   - Check network connectivity

### SQL Server Configuration:
1. Enable SQL Server Authentication mode
2. Enable TCP/IP protocol
3. Start SQL Server Browser service
4. Configure firewall to allow SQL Server traffic

## Next Steps

After successful database setup:
1. Test the connection using `npm run test-connection`
2. Verify all tables are created
3. Check that default categories are inserted
4. Proceed to backend API development (Task 1.3)