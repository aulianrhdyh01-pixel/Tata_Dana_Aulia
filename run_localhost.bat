@echo off
title TataDana — Localhost Server (Port 3000)
cd /d "%~dp0"
echo ===============================================================
echo   TataDana — Platform Manajemen Keuangan Pribadi Indonesia
echo   Menjalankan server di http://localhost:3000...
echo ===============================================================
echo.
python server.py
pause
