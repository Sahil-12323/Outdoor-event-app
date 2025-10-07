@echo off
echo.
echo ========================================
echo TrailMeet Local Setup Script (Windows)
echo ========================================
echo.

echo Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo [✓] Node.js found

where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Yarn not found. Installing yarn...
    npm install -g yarn
)
echo [✓] Yarn found

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Python is not installed. Please install from https://www.python.org/
    pause
    exit /b 1
)
echo [✓] Python found

echo.
echo Installing backend dependencies...
cd backend

if not exist .env (
    echo Creating .env file...
    (
    echo MONGO_URL=mongodb://localhost:27017
    echo DB_NAME=trailmeet
    echo CORS_ORIGINS=http://localhost:3000,http://localhost:8001
    ) > .env
    echo [✓] .env file created
) else (
    echo [✓] .env file already exists
)

echo Installing Python packages...
pip install -r requirements.txt

cd..

echo.
echo Installing frontend dependencies...
cd frontend
yarn install
cd..

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo To run the application:
echo.
echo 1. Open Command Prompt/Terminal 1:
echo    cd backend
echo    python server.py
echo.
echo 2. Open Command Prompt/Terminal 2:
echo    cd frontend
echo    yarn start
echo.
echo Then open: http://localhost:3000
echo ========================================
pause
