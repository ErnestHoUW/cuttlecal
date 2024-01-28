@echo off
setlocal

if exist "build\Debug\*" xcopy /s /y "build\Debug\*" "javascript\backend\calibrator\"

:: Start the Node.js server in the background
start /b node javascript/backend/mock_http.js

:: Navigate to the frontend directory and run npm install followed by npm start in the background
cd javascript/frontend
start /b cmd /c "npm install && npm start"

:: Wait for a key press to terminate the script and its child processes
echo Press any key to terminate the server and exit...
pause > nul

:: Kill the Node.js server and npm start process
taskkill /im node.exe /f
taskkill /im npm.cmd /f

endlocal