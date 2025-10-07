@echo off
echo ================================================================
echo          Testing TrailMeet Setup - Diagnostics
echo ================================================================
echo.

echo 1. Testing MongoDB...
mongosh --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] MongoDB tools installed
) else (
    echo    [X] MongoDB not found
)
echo.

echo 2. Testing Backend .env...
if exist backend\.env (
    echo    [OK] backend\.env exists
    type backend\.env
) else (
    echo    [X] backend\.env NOT found
    echo        Fix: Create backend\.env file
)
echo.

echo 3. Testing Frontend .env...
if exist frontend\.env (
    echo    [OK] frontend\.env exists
    type frontend\.env
) else (
    echo    [X] frontend\.env NOT found
    echo        Fix: Create frontend\.env file
)
echo.

echo 4. Testing Backend API...
curl -s http://localhost:8001/api/ | find "healthy" >nul
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Backend API is running
) else (
    echo    [X] Backend API NOT responding
    echo        Fix: Start backend - cd backend ^&^& python server.py
)
echo.

echo ================================================================
echo                    Diagnosis Complete
echo ================================================================
pause
