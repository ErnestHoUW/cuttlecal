@echo off
setlocal

:: Check if the build directory exists and copy files if it does
if exist "build\Debug\*" xcopy /s /y "build\Debug\*" "javascript\backend\calibrator\"

:: Start the Node.js server in a new window with a distinctive title
start "Node.js Server" node javascript/backend/mock_http.js

:: Navigate to the frontend directory
cd javascript/frontend

:: Start npm install followed by npm start in a new window with a distinctive title
start "NPM Start" cmd /c "npm start"

:: Wait for a key press to terminate the script and its child processes
echo Press any key to terminate the server and exit...
pause > nul

:: Kill the specific Node.js server window
taskkill /fi "WINDOWTITLE eq Node.js Server" /f

:: Kill the npm start process window
taskkill /fi "WINDOWTITLE eq NPM Start" /f

endlocal
