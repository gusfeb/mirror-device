@echo off
title DeskFlow - Kontrol Windows dari iPhone
cd /d "%~dp0"

echo ===================================================
echo     DeskFlow - Remote Controller untuk iPhone
echo ===================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python tidak ditemukan di sistem Anda!
    echo Silakan install Python dari https://www.python.org/
    pause
    exit /b 1
)

echo Memeriksa dan menjalankan server...
python server.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo Ada error saat menjalankan server.
    pause
)
