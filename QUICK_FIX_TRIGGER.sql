-- ====== SOLUTION RAPIDE: Désactiver le trigger invalide ======
-- Exécutez ce script dans SQL Developer ou SQLcl

-- Option 1: DÉSACTIVER LE TRIGGER (Recommandé - le plus simple)
-- Cela arrête l'erreur sans supprimer le trigger
ALTER TRIGGER trg_audit_commandes DISABLE;

-- Vérifier que c'est désactivé
SELECT trigger_name, status FROM user_triggers 
WHERE trigger_name = 'TRG_AUDIT_COMMANDES';

-- Résultat attendu: TRG_AUDIT_COMMANDES | DISABLED

COMMIT;

-- ====== Explication ======
-- Le trigger TRG_AUDIT_COMMANDES est invalide car il référence 
-- une table ou procédure qui n'existe pas correctement.
-- 
-- En le désactivant, les modifications de commandes fonctionneront 
-- normalement sans l'erreur ORA-04098.
--
-- Si vous avez besoin d'auditer les changements, on peut créer 
-- un trigger simple et fonctionnel après.
