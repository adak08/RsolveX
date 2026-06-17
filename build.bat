@echo off
REM build.bat — Windows build helper
REM Usage: build.bat

echo Installing root dependencies...
call npm install

echo Installing frontend dependencies...
cd client
call npm install

echo Building React frontend...
call npm run build
cd ..

echo Copying dist to BACKEND\public ...
node scripts\copy-dist.js

echo.
echo Build complete! Run "npm start" to start the server.
