@echo off
echo Starting Shubhstra Dashboard Development Server...
echo.

REM Set Node.js in PATH
set "PATH=C:\Users\Shree\AppData\Local\nvm\v20.11.0;%PATH%"

REM Change to script directory
cd /d "%~dp0"

echo Node version:
node --version
echo.

echo NPM version:
npm --version
echo.

echo Starting Next.js dev server...
echo Server will be available at: http://localhost:3001
echo Press Ctrl+C to stop the server
echo.

REM Run Next.js dev server
call node_modules\.bin\next.cmd dev
