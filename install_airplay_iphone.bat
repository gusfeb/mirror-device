@echo off
title DeskFlow - Pasang AirPlay Receiver untuk iPhone ke Windows
cd /d "%~dp0"

echo ================================================================
echo    DESKFLOW - PASANG AIRPLAY RECEIVER UNTUK IPHONE KE WINDOWS
echo ================================================================
echo.
echo Fitur ini memungkinkan iPhone Anda menampilkan seluruh layar
echo (Home Screen, TikTok, WhatsApp, Game, Foto, Video) langsung ke
echo monitor PC menggunakan fitur bawaan iPhone: "Pencerminan Layar".
echo.
echo Sedang mengunduh & memasang uxplay-windows via winget...
echo.

where winget >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] winget tidak ditemukan di sistem Windows Anda.
    echo Silakan buka Microsoft Store dan cari "AirPlay Screen Mirroring"
    pause
    exit /b 1
)

winget install --id leapbtw.uxplay -e --accept-source-agreements --accept-package-agreements

if %ERRORLEVEL% equ 0 (
    echo.
    echo ================================================================
    echo [SUKSES] AirPlay Receiver berhasil dipasang!
    echo.
    echo CARA MENGHUBUNGKAN DARI IPHONE:
    echo 1. Pastikan iPhone dan PC terhubung ke Wi-Fi yang sama.
    echo 2. Buka aplikasi "uxplay-windows" dari Start Menu Windows.
    echo 3. Di iPhone Anda:
    echo    - Buka Pusat Kontrol (Control Center) dengan menggeser layar
    echo      dari pojok kanan atas ke bawah.
    echo    - Ketuk ikon "Pencerminan Layar" (Screen Mirroring - 2 kotak bertumpuk).
    echo    - Pilih "UxPlay" atau nama PC Anda.
    echo.
    echo 4. Layar iPhone Anda akan langsung tampil di monitor desktop!
    echo ================================================================
) else (
    echo.
    echo [INFO] Pemasangan via winget membutuhkan konfirmasi atau gagal.
    echo Alternatif mudah:
    echo 1. Buka Microsoft Store di Windows.
    echo 2. Cari "AirPlay Receiver" atau "AirPlay Screen Mirroring".
    echo 3. Pasang salah satu aplikasi gratis, lalu jalankan.
)

pause
