@echo off
echo ========================================
echo 🧹 CLEANUP DỰ ÁN - XÓA FILE DƯ THỪA
echo ========================================
echo.
echo ⚠️  CẢNH BÁO: Script này sẽ xóa các file không cần thiết
echo    Các file quan trọng sẽ được giữ lại
echo.
set /p confirm="Bạn có chắc chắn muốn tiếp tục? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ Đã hủy cleanup
    pause
    exit /b
)

echo.
echo 🚀 Bắt đầu cleanup...
echo.

REM ==========================================
REM XÓA CÁC FILE TEST VÀ DEBUG
REM ==========================================
echo 🔴 Xóa các file test và debug...

REM Root level test files
del /f /q "test_budget_functionality.js" 2>nul && echo ✅ Đã xóa test_budget_functionality.js
del /f /q "test_negative_savings_new_user.js" 2>nul && echo ✅ Đã xóa test_negative_savings_new_user.js
del /f /q "test_real_world_scenarios.js" 2>nul && echo ✅ Đã xóa test_real_world_scenarios.js
del /f /q "test_statistics_api.js" 2>nul && echo ✅ Đã xóa test_statistics_api.js
del /f /q "create_test_data.js" 2>nul && echo ✅ Đã xóa create_test_data.js
del /f /q "create_negative_savings_scenario.js" 2>nul && echo ✅ Đã xóa create_negative_savings_scenario.js

REM Backend test files
del /f /q "backend\check-schema.js" 2>nul && echo ✅ Đã xóa backend\check-schema.js
del /f /q "backend\fix_cache_issue.js" 2>nul && echo ✅ Đã xóa backend\fix_cache_issue.js
del /f /q "backend\test-api.js" 2>nul && echo ✅ Đã xóa backend\test-api.js
del /f /q "backend\start-server.bat" 2>nul && echo ✅ Đã xóa backend\start-server.bat

REM Database test files
del /f /q "database\connection-test.js" 2>nul && echo ✅ Đã xóa database\connection-test.js

REM Frontend debug files
del /f /q "frontend\debug_budget_api.html" 2>nul && echo ✅ Đã xóa frontend\debug_budget_api.html

echo.

REM ==========================================
REM XÓA CÁC FILE SQL DEBUG VÀ FIX
REM ==========================================
echo 🟡 Xóa các file SQL debug và fix...

del /f /q "database\check_budget_integration.sql" 2>nul && echo ✅ Đã xóa check_budget_integration.sql
del /f /q "database\check_budget_update_real_time.sql" 2>nul && echo ✅ Đã xóa check_budget_update_real_time.sql
del /f /q "database\check_procedure_signature.sql" 2>nul && echo ✅ Đã xóa check_procedure_signature.sql
del /f /q "database\debug_budget_data.sql" 2>nul && echo ✅ Đã xóa debug_budget_data.sql
del /f /q "database\debug_real_time.sql" 2>nul && echo ✅ Đã xóa debug_real_time.sql
del /f /q "database\direct_fix_budgets.sql" 2>nul && echo ✅ Đã xóa direct_fix_budgets.sql
del /f /q "database\fix_budget_integration.sql" 2>nul && echo ✅ Đã xóa fix_budget_integration.sql
del /f /q "database\fix_daily_budget.sql" 2>nul && echo ✅ Đã xóa fix_daily_budget.sql
del /f /q "database\fix_daily_budget_no_collation.sql" 2>nul && echo ✅ Đã xóa fix_daily_budget_no_collation.sql
del /f /q "database\fix_overflow_issue.sql" 2>nul && echo ✅ Đã xóa fix_overflow_issue.sql
del /f /q "database\fix_procedure_arguments.sql" 2>nul && echo ✅ Đã xóa fix_procedure_arguments.sql
del /f /q "database\fix_procedure_date_issue.sql" 2>nul && echo ✅ Đã xóa fix_procedure_date_issue.sql
del /f /q "database\manual_update_budgets.sql" 2>nul && echo ✅ Đã xóa manual_update_budgets.sql
del /f /q "database\simple_fix_budgets.sql" 2>nul && echo ✅ Đã xóa simple_fix_budgets.sql
del /f /q "database\test_budget_donate.sql" 2>nul && echo ✅ Đã xóa test_budget_donate.sql

echo.

REM ==========================================
REM XÓA CÁC FILE SQL PROCEDURE CŨ
REM ==========================================
echo 🟠 Xóa các file SQL procedure cũ (chỉ giữ lại bản cuối)...

del /f /q "database\create_budget_update_procedure.sql" 2>nul && echo ✅ Đã xóa create_budget_update_procedure.sql
del /f /q "database\create_procedure_only.sql" 2>nul && echo ✅ Đã xóa create_procedure_only.sql
del /f /q "database\create_universal_procedure.sql" 2>nul && echo ✅ Đã xóa create_universal_procedure.sql
del /f /q "database\create_working_procedure.sql" 2>nul && echo ✅ Đã xóa create_working_procedure.sql

echo.

REM ==========================================
REM XÓA CÁC FILE MARKDOWN HƯỚNG DẪN TẠM THỜI
REM ==========================================
echo 🔵 Xóa các file markdown tạm thời...

del /f /q "HƯỚNG_DẪN_SỬA_NGÂN_SÁCH.md" 2>nul && echo ✅ Đã xóa HƯỚNG_DẪN_SỬA_NGÂN_SÁCH.md
del /f /q "SỬA_NGÂN_SÁCH_NGAY_LẬP_TỨC.md" 2>nul && echo ✅ Đã xóa SỬA_NGÂN_SÁCH_NGAY_LẬP_TỨC.md
del /f /q "THIẾU_SÓT_VÀ_CẢI_THIỆN.md" 2>nul && echo ✅ Đã xóa THIẾU_SÓT_VÀ_CẢI_THIỆN.md

echo.

REM ==========================================
REM XÓA CÁC FILE BAT UTILITY CŨ
REM ==========================================
echo 🟣 Xóa các file .bat utility cũ...

del /f /q "cleanup_all_files.bat" 2>nul && echo ✅ Đã xóa cleanup_all_files.bat
del /f /q "kill-port-5000.bat" 2>nul && echo ✅ Đã xóa kill-port-5000.bat
del /f /q "restart_backend.bat" 2>nul && echo ✅ Đã xóa restart_backend.bat

echo.

REM ==========================================
REM XÓA NODE_MODULES VÀ PACKAGE FILES DƯ THỪA
REM ==========================================
echo 🟤 Xóa node_modules và package files dư thừa...

REM Root level (không cần thiết)
if exist "node_modules" (
    rmdir /s /q "node_modules" 2>nul && echo ✅ Đã xóa root node_modules
)
del /f /q "package.json" 2>nul && echo ✅ Đã xóa root package.json
del /f /q "package-lock.json" 2>nul && echo ✅ Đã xóa root package-lock.json

REM Database node_modules (không cần thiết)
if exist "database\node_modules" (
    rmdir /s /q "database\node_modules" 2>nul && echo ✅ Đã xóa database\node_modules
)
del /f /q "database\package.json" 2>nul && echo ✅ Đã xóa database\package.json
del /f /q "database\package-lock.json" 2>nul && echo ✅ Đã xóa database\package-lock.json

echo.

REM ==========================================
REM XÓA CÁC FILE BACKEND/FRONTEND KHÔNG CẦN
REM ==========================================
echo ⚫ Xóa các file backend/frontend không cần thiết...

REM Xóa test folder trong backend (đã tạo nhưng không dùng)
if exist "backend\src\__tests__" (
    rmdir /s /q "backend\src\__tests__" 2>nul && echo ✅ Đã xóa backend\src\__tests__
)

REM Xóa services và utils mới tạo (chưa integrate)
del /f /q "backend\src\services\emailService.js" 2>nul && echo ✅ Đã xóa emailService.js
del /f /q "backend\src\utils\pdfGenerator.js" 2>nul && echo ✅ Đã xóa pdfGenerator.js

REM Xóa route test-budget (chỉ dùng để test) - ĐÃ XÓA MANUAL
REM del /f /q "backend\src\routes\test-budget.js" 2>nul && echo ✅ Đã xóa test-budget.js
echo ℹ️  test-budget.js đã được xóa manual và server.js đã được cập nhật

echo.

echo ========================================
echo 🎉 CLEANUP HOÀN THÀNH!
echo ========================================
echo.
echo ✅ Đã xóa tất cả file dư thừa:
echo   - File test và debug
echo   - File SQL fix và procedure cũ  
echo   - File markdown tạm thời
echo   - File .bat utility cũ
echo   - Node_modules không cần thiết
echo   - File backend/frontend chưa dùng
echo.
echo 🗂️  CÁC FILE QUAN TRỌNG ĐÃ ĐƯỢC GIỮ LẠI:
echo   - backend/ (core application)
echo   - frontend/ (core application)
echo   - database/create-database.sql
echo   - database/insert-default-categories.sql
echo   - database/seed-data.sql
echo   - database/update_period_constraint.sql
echo   - PROJECT-STATUS.md
echo   - README.md
echo   - Activity_Diagram.html
echo   - Use_Case_Diagram.html
echo   - start-app.bat
echo   - start-backend.bat
echo.
echo 🚀 DỰ ÁN ĐÃ SẠCH SẼ VÀ SẴN SÀNG NỘP!
echo.
pause
