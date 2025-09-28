@echo off
echo ========================================
echo    XUẤT DATABASE PERSONALFINANCEDB
echo ========================================
echo.

set SERVER=TIEUNHATBACH666\TIEUNHATBACH
set DATABASE=PersonalFinanceDB
set USERNAME=sa
set PASSWORD=123456
set OUTPUT_FILE=PersonalFinanceDB_Full_Export.sql

echo Đang xuất database %DATABASE%...
echo Server: %SERVER%
echo Output: %OUTPUT_FILE%
echo.

REM Tạo script xuất database
sqlcmd -S %SERVER% -U %USERNAME% -P %PASSWORD% -d %DATABASE% -Q "EXEC sp_helpdb '%DATABASE%'" -o database_info.txt

REM Xuất schema và data
sqlcmd -S %SERVER% -U %USERNAME% -P %PASSWORD% -d %DATABASE% -Q "
-- Xuất tất cả bảng với dữ liệu
DECLARE @sql NVARCHAR(MAX) = ''
SELECT @sql = @sql + 'SELECT * FROM ' + TABLE_SCHEMA + '.' + TABLE_NAME + ';' + CHAR(13)
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
PRINT @sql
" -o %OUTPUT_FILE%

echo.
echo ✅ Xuất database hoàn tất!
echo File được lưu tại: %OUTPUT_FILE%
echo.
pause
