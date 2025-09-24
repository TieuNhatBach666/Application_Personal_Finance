@echo off
echo ========================================
echo 🗑️  CLEANING UP UNNECESSARY FILES
echo ========================================

cd /d "d:\Đồ Án Kết Thúc Môn\Quản Lý Tài Chính Cá Nhân"

echo.
echo 🔴 Deleting test and debug files...
del /f /q "add-expense-data.js" 2>nul
del /f /q "add-test-data.js" 2>nul
del /f /q "check-categories.js" 2>nul
del /f /q "check-schema.js" 2>nul
del /f /q "debug-inconsistent-data.js" 2>nul
del /f /q "simple-test.js" 2>nul
del /f /q "test-cors.js" 2>nul
del /f /q "test-current-user.js" 2>nul
del /f /q "test-dashboard-browser.js" 2>nul
del /f /q "test-frontend-charts.js" 2>nul
del /f /q "test-full-app.js" 2>nul
del /f /q "test-simple-api.js" 2>nul
del /f /q "test-statistics-api.js" 2>nul
del /f /q "test-summary-endpoint.js" 2>nul
del /f /q "test-transaction-api.js" 2>nul
del /f /q "verify-real-data.js" 2>nul
del /f /q "start-backend-test.bat" 2>nul
echo ✅ Test files deleted

echo.
echo 🟡 Deleting old SQL scripts...
del /f /q "check_budget_columns.sql" 2>nul
del /f /q "check_period_constraint.sql" 2>nul
del /f /q "cleanup_budget_final.sql" 2>nul
del /f /q "fix_budget_schema.sql" 2>nul
del /f /q "fix_budget_simple.sql" 2>nul
del /f /q "fix_database_encoding.sql" 2>nul
del /f /q "rename_budget_columns.sql" 2>nul
del /f /q "database_schema_extension.sql" 2>nul
echo ✅ Old SQL scripts deleted

echo.
echo 🟢 Deleting temporary documentation...
del /f /q "FINAL-CHARTS-SOLUTION.md" 2>nul
del /f /q "FIXES-APPLIED.md" 2>nul
del /f /q "INCONSISTENT-DATA-SOLUTION.md" 2>nul
del /f /q "ISSUE-FIXED-SUMMARY.md" 2>nul
del /f /q "RACE-CONDITION-FIX.md" 2>nul
del /f /q "STATISTICS-IMPLEMENTATION-SUMMARY.md" 2>nul
del /f /q "STRICTMODE-DISABLE-FIX.md" 2>nul
echo ✅ Temporary docs deleted

echo.
echo 🔵 Deleting empty/unused files...
del /f /q "package.json" 2>nul
del /f /q "package-lock.json" 2>nul
echo ✅ Empty files deleted

echo.
echo ========================================
echo 🎉 CLEANUP COMPLETED!
echo ========================================
echo.
echo ✅ Kept important files:
echo   - backend/ (all backend code)
echo   - frontend/ (all frontend code)  
echo   - database/ (database files)
echo   - PROJECT-STATUS.md (project overview)
echo   - Activity_Diagram.html (documentation)
echo   - Use_Case_Diagram.html (documentation)
echo   - update_period_constraint.sql (latest script)
echo   - restart_backend.bat (utility)
echo   - start-app.bat (utility)
echo.
echo 🗑️ Deleted files:
echo   - All test-*.js files
echo   - All debug-*.js files  
echo   - All old SQL scripts
echo   - All temporary .md docs
echo   - Empty package files
echo.
pause
