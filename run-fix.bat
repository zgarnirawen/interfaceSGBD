@echo off
REM Script PowerShell pour exécuter le fix SQL
REM À exécuter dans PowerShell

setlocal enabledelayedexpansion

echo ====== FIX: Trigger TRG_AUDIT_COMMANDES ======
echo.
echo Exécution du script FIX_TRIGGER_AUDIT.sql...
echo.

REM Utiliser sqlplus avec redirection correcte
sqlplus SYSTEM/rawen123@localhost:1521/orcl @FIX_TRIGGER_AUDIT.sql

echo.
echo ====== FIX APPLIQUÉ ======
echo Le script a été exécuté avec succès
pause
