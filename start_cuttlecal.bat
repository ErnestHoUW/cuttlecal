@echo off
setlocal

:: Check if the build directory exists and copy files if it does
if exist "build\Debug\*" xcopy /s /y "build\Debug\*" "javascript\backend\calibrator\"

:: Start the Node.js server in a new window and capture its PID
start "Node.js Server" cmd /c "node javascript/backend/mock_http.js & echo %^pid% > node.pid"

:: Navigate to the frontend directory
cd javascript/frontend

:: Start npm install and npm start in the background and capture its PID
start /b cmd /c "npm start & echo %^pid% > npm.pid"

:: Wait for a key press to terminate the script and its child processes
echo Press any key to terminate the server and exit...
pause > nul

:: Retrieve PIDs from files and kill the processes
for /f %%i in ('type "..\node.pid"') do set NODE_PID=%%i
for /f %%i in ('type "npm.pid"') do set NPM_PID=%%i

:: Kill the Node.js server process
if defined NODE_PID taskkill /pid %NODE_PID% /f

:: Kill the npm start process
if defined NPM_PID taskkill /pid %NPM_PID% /f

:: Cleanup PID files
del "..\node.pid"
del "npm.pid"

endlocal
