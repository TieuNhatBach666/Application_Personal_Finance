@echo off
echo 🔍 Tìm và kill tất cả process sử dụng port 5000...

REM Method 1: Kill specific PIDs using port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 2^>nul') do (
    if not "%%a"=="0" (
        echo 💀 Killing PID: %%a
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Method 2: Kill all node.exe processes (more aggressive)
echo 💀 Killing all node.exe processes...
taskkill /f /im node.exe >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Check if port is free
echo 🔍 Kiểm tra port 5000...
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ Port 5000 đã được giải phóng!
) else (
    echo ⚠️ Port 5000 vẫn đang được sử dụng
    netstat -ano | findstr :5000
)

echo.
echo 🚀 Bây giờ bạn có thể chạy: npm start
pause
