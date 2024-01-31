@echo off
setlocal

if exist "build\Debug\*" xcopy /s /y "build\Debug\*" "javascript\backend\calibrator\"

:: Start the Node.js server in a new window
start "Node.js Server" node javascript/backend/mock_http.js

:: Navigate to the frontend directory and run npm install followed by npm start in the background
@REM cd javascript/frontend
@REM start /b cmd /c "npm install && npm start"

:: Wait for a key press to terminate the script and its child processes
echo Press any key to terminate the server and exit...
pause > nul

:: Kill the specific Node.js server window
taskkill /fi "WINDOWTITLE eq Node.js Server" /f

endlocal

@REM @echo off
@REM setlocal

@REM if exist "build\Debug\*" xcopy /s /y "build\Debug\*" "javascript\backend\calibrator\"

@REM :: Start the Node.js server in the background
@REM start /b node javascript/backend/mock_http.js

@REM :: Navigate to the frontend directory and run npm install followed by npm start in the background
@REM cd javascript/frontend
@REM start /b cmd /c "npm install && npm start"

@REM :: Wait for a key press to terminate the script and its child processes
@REM echo Press any key to terminate the server and exit...
@REM pause > nul

@REM :: Kill the Node.js server and npm start process
@REM taskkill /im node.exe /f

@REM endlocal