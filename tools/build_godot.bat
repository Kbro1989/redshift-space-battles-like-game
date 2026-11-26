@echo off
echo ============================================================
echo  Godot 4.8 Editor Build - MSVC x64
echo ============================================================
echo.

call "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" amd64
if errorlevel 1 (
    echo ERROR: MSVC setup failed
    exit /b 1
)
echo [OK] MSVC environment ready
echo.

cd /d "C:\Users\krist\Desktop\godot"
echo Building from: %CD%
echo Started: %DATE% %TIME%
echo.

python -m SCons platform=windows target=editor arch=x86_64 -j4 accesskit=no d3d12=no

if errorlevel 1 (
    echo.
    echo !! BUILD FAILED !!
    exit /b 1
)

echo.
echo ============================================================
echo  BUILD COMPLETE: %DATE% %TIME%
echo  Binary: C:\Users\krist\Desktop\godot\bin\godot.windows.editor.x86_64.exe
echo ============================================================
echo.
copy "C:\Users\krist\Desktop\godot\bin\godot.windows.editor.x86_64.exe" "C:\Users\krist\Desktop\redshift-space-battles\godot_editor.exe"
echo Copied to redshift-space-battles folder!
