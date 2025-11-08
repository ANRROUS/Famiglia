@echo off
REM =================================================================
REM Script completo para iniciar el proyecto Famiglia
REM Orden de inicio: Chrome -> Backend -> MCP Server -> Frontend
REM =================================================================

echo.
echo ========================================
echo   FAMIGLIA - INICIO COMPLETO
echo ========================================
echo.

REM =================================================================
REM PASO 1: Verificar y cerrar puertos ocupados
REM =================================================================
echo [1/5] Verificando puertos...
echo.

REM Buscar procesos en puertos
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Cerrando proceso en puerto 3000 (PID: %%a)
    taskkill //F //PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Cerrando proceso en puerto 3001 (PID: %%a)
    taskkill //F //PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Cerrando proceso en puerto 5173 (PID: %%a)
    taskkill //F //PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174') do (
    echo Cerrando proceso en puerto 5174 (PID: %%a)
    taskkill //F //PID %%a 2>nul
)

echo Puertos liberados!
timeout /t 2 /nobreak >nul

REM =================================================================
REM PASO 2: Iniciar Chrome con Remote Debugging
REM =================================================================
echo.
echo [2/5] Iniciando Chrome con debugging...
echo.

REM Cerrar Chrome si está abierto
taskkill //F //IM chrome.exe 2>nul
timeout /t 2 /nobreak >nul

REM Iniciar Chrome
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%USERPROFILE%\chrome-famiglia-debug" http://localhost:5173

echo Chrome iniciado en puerto 9222
timeout /t 2 /nobreak >nul

REM =================================================================
REM PASO 3: Iniciar Backend (Puerto 3000)
REM =================================================================
echo.
echo [3/5] Iniciando Backend (puerto 3000)...
echo.

start "Famiglia Backend" cmd /k "cd /d %~dp0Backend && npm run dev"
timeout /t 3 /nobreak >nul

REM =================================================================
REM PASO 4: Iniciar MCP Server (Puerto 3001)
REM =================================================================
echo.
echo [4/5] Iniciando MCP Server (puerto 3001)...
echo.

start "Famiglia MCP Server" cmd /k "cd /d %~dp0mcp-server && node playwright-server.js"
timeout /t 3 /nobreak >nul

REM =================================================================
REM PASO 5: Iniciar Frontend (Puerto 5173)
REM =================================================================
echo.
echo [5/5] Iniciando Frontend (puerto 5173)...
echo.

start "Famiglia Frontend" cmd /k "cd /d %~dp0Frontend && npm run dev"
timeout /t 5 /nobreak >nul

REM =================================================================
REM RESUMEN
REM =================================================================
echo.
echo ========================================
echo   FAMIGLIA INICIADO CORRECTAMENTE
echo ========================================
echo.
echo  Chrome:      http://localhost:5173
echo  Frontend:    http://localhost:5173
echo  Backend:     http://localhost:3000
echo  MCP Server:  http://localhost:3001
echo  CDP:         http://localhost:9222
echo.
echo ========================================
echo.
echo Presiona cualquier tecla para salir...
echo (Los servidores seguiran corriendo)
echo.
pause >nul
