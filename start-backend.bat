@echo off
REM Script to start backend (run from backend folder)
cd /d "%~dp0"
if not exist node_modules (
  echo Installing backend dependencies...
  npm install
)
echo Starting backend (nodemon)...
npm run dev
pause
