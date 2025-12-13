@echo off
REM Script batch pour désactiver le trigger invalid
REM À exécuter depuis la même fenêtre que npm

cd /d C:\Users\ZGARNI\oracle-test-app

echo.
echo ====== DÉSACTIVER LE TRIGGER INVALIDE ======
echo.
echo Assurez-vous que SQL Developer est ouvert et connecté à:
echo   SYSTEM/rawen123@localhost:1521/orcl
echo.
echo Copiez-collez ceci dans SQL Developer:
echo.
echo ─────────────────────────────────────────────────
echo ALTER TRIGGER trg_audit_commandes DISABLE;
echo COMMIT;
echo ─────────────────────────────────────────────────
echo.
echo Après exécution, appuyez sur Entrée pour continuer...
pause

echo.
echo ✅ Continuons avec npm run dev...
echo.

npm run dev

pause
