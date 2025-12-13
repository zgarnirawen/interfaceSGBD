# Script PowerShell pour exécuter le fix SQL
# À exécuter dans PowerShell

Write-Host "====== FIX: Trigger TRG_AUDIT_COMMANDES ======" -ForegroundColor Green
Write-Host ""
Write-Host "Exécution du script FIX_TRIGGER_AUDIT.sql..." -ForegroundColor Yellow
Write-Host ""

# La bonne syntaxe pour sqlplus sous PowerShell:
# Utiliser @ au lieu de <

sqlplus SYSTEM/rawen123@localhost:1521/orcl @FIX_TRIGGER_AUDIT.sql

Write-Host ""
Write-Host "====== FIX APPLIQUÉ ======" -ForegroundColor Green
Write-Host "Le script a été exécuté avec succès" -ForegroundColor Green
