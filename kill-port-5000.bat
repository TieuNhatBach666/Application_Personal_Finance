@echo off
echo 🔍 Đang tìm process sử dụng port 5000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    if not "%%a"=="0" (
        echo 🎯 Tìm thấy PID: %%a
        echo 💀 Đang kill process %%a...
        taskkill /PID %%a /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Đã kill thành công PID %%a
        ) else (
            echo ❌ Không thể kill PID %%a
        )
    )
)

echo.
echo 🔍 Kiểm tra lại port 5000...
netstat -ano | findstr :5000
if %errorlevel% neq 0 (
    echo ✅ Port 5000 đã được giải phóng hoàn toàn!
    echo 🚀 Bây giờ bạn có thể chạy: npm start
) else (
    echo ⚠️ Vẫn còn process sử dụng port 5000
)

pause
