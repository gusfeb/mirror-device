@echo off
title DeskFlow - AirPlay Receiver untuk iPhone
cd /d "%~dp0"

echo ================================================================
echo        DESKFLOW - PENAMPIL AIRPLAY IPHONE KE WINDOWS
echo ================================================================
echo.
echo Menjalankan AirPlay Receiver (UxPlay)...
echo.
echo PETUNJUK DI IPHONE:
echo 1. Pastikan iPhone dan PC berada di Wi-Fi yang sama.
echo 2. Buka Pusat Kontrol (Control Center) di iPhone:
echo    Geser dari pojok kanan atas layar ke bawah.
echo 3. Ketuk tombol "Pencerminan Layar" (Screen Mirroring - 2 kotak bertumpuk).
echo 4. Pilih "UxPlay" atau nama PC Anda.
echo.
echo Layar iPhone Anda akan langsung tampil di monitor desktop!
echo ================================================================
echo.

if exist "C:\Program Files\uxplay-windows\uxplay-windows.exe" (
    start "" /d "C:\Program Files\uxplay-windows" "C:\Program Files\uxplay-windows\uxplay-windows.exe"
    echo UxPlay telah dijalankan (lihat ikon baki sistem di pojok kanan bawah dekat jam).
    exit /b 0
)

echo [ERROR] uxplay-windows tidak ditemukan.
pause
