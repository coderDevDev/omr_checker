@echo off
REM OMR Web Scanner Next.js Setup Script for Windows

echo 🚀 Setting up OMR Web Scanner Next.js Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!

REM Create environment file if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating environment file...
    echo NEXT_PUBLIC_API_URL=http://localhost:5000/api > .env.local
    echo ✅ Environment file created!
)

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Make sure your Python backend is running on port 5000
echo 2. Start the Next.js development server:
echo    npm run dev
echo.
echo 3. Open your browser and go to: http://localhost:3000
echo.
echo 🔧 Available commands:
echo    npm run dev    - Start development server
echo    npm run build  - Build for production
echo    npm run start  - Start production server
echo    npm run lint   - Run ESLint
echo.
pause
