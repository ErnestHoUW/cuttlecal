@echo off
setlocal

:: Check if the build directory exists and copy files if it does
if exist "build\Debug\*" xcopy /s /y "build\Debug\*" "javascript\backend\calibrator\"

:: Start the Node.js server in a new window
start "Node.js Server" node javascript/backend/mock_http.js

:: Navigate to the frontend directory
cd javascript/new_frontend

:: Start npm install followed by npm start in the background
start /b cmd /c "npm start"

:: Wait for a key press to terminate the script and its child processes
echo Press any key to terminate all Node.js and npm processes...
pause > nul

:: Kill all Node.js processes
taskkill /im node.exe /f

@REM :: Kill all npm processes (this might not be necessary as killing node.exe should suffice, but included for completeness)
@REM taskkill /im npm.cmd /f

endlocal
