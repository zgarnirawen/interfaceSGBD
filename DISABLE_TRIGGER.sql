-- ====== DÉSACTIVER LE TRIGGER INVALIDE ======
-- Ce trigger est invalide et empêche les procédures de fonctionner
-- On le désactive car il n'est pas critique pour le système

ALTER TRIGGER trg_audit_commandes DISABLE;
PROMPT ✅ Trigger TRG_AUDIT_COMMANDES désactivé;

-- Vérifier l'état du trigger
SELECT trigger_name, status FROM user_triggers 
WHERE trigger_name = 'TRG_AUDIT_COMMANDES';

COMMIT;
