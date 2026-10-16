@echo off
title DeskFlow - Penampil Layar HP di Monitor Desktop
cd /d "%~dp0"

set PORT=8000
set URL=http://localhost:%PORT%/phone-screen

echo Membuka penampil layar HP di monitor desktop...

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=%URL% --window-size=480,880
    exit /b 0
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app=%URL% --window-size=480,880
    exit /b 0
)

start "" "%URL%"
exit /b 0
