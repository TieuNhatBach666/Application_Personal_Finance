@echo off
echo Starting Personal Finance Manager...
echo.
echo This will start both backend (port 5000) and frontend (port 5173)
echo.
echo Backend API: http://localhost:5000/api
echo Frontend App: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause