@echo off
echo ============================================================
echo  Starting Redshift Space Battles (Godot 4.8)
echo ============================================================
echo.

cd /d "%~dp0"

if exist "godot.exe" (
    start "" "godot.exe" --path "%~dp0." res://scenes/main_menu.tscn
    exit /b 0
)

if exist "godot_editor.exe" (
    start "" "godot_editor.exe" --path "%~dp0." res://scenes/main_menu.tscn
    exit /b 0
)

echo [ERROR] Godot executable not found.
pause
