@echo off
echo Agregando archivos a Git...
git add .
echo.
echo Realizando Commit...
git commit -m "feat: cargar ingresos, egresos y patrimonio desde Google Sheets, polling de 1 min, limpiar UI y ultimos movimientos"
echo.
echo Realizando Push...
git push
echo.
echo Proceso finalizado.
pause
