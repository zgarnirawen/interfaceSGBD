-- ====== VÉRIFIER ET CORRIGER LES UTILISATEURS ======

-- 1. Vérifier les utilisateurs existants
SELECT idpers, nompers, prenompers, login, codeposte 
FROM personnel 
ORDER BY idpers;

-- 2. Vérifier les postes disponibles
SELECT codeposte, libelle 
FROM postes 
ORDER BY codeposte;

-- 3. Si les utilisateurs n'existent pas, les créer

-- Vérifier et créer Admin (P002 - Administrateur)
BEGIN
  DECLARE
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count FROM personnel WHERE login = 'admin';
    
    IF v_count = 0 THEN
      INSERT INTO personnel (
        idpers, nompers, prenompers, adrpers, villepers, 
        telpers, d_embauche, login, codeposte
      ) VALUES (
        1, 'Admin', 'Système', '123 rue Admin', 'Tunis',
        '21600000', SYSDATE, 'admin', 'P002'
      );
      DBMS_OUTPUT.PUT_LINE('✅ Admin créé avec login: admin');
    ELSE
      DBMS_OUTPUT.PUT_LINE('✅ Admin existe déjà');
    END IF;
  END;
END;
/

-- Vérifier et créer Chef Livreur (P003 - ChefLivreur)
BEGIN
  DECLARE
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count FROM personnel WHERE login = 'chef';
    
    IF v_count = 0 THEN
      INSERT INTO personnel (
        idpers, nompers, prenompers, adrpers, villepers, 
        telpers, d_embauche, login, codeposte
      ) VALUES (
        2, 'Chef', 'Livreur', '456 rue Chef', 'Sfax',
        '21611111', SYSDATE, 'chef', 'P003'
      );
      DBMS_OUTPUT.PUT_LINE('✅ Chef créé avec login: chef');
    ELSE
      DBMS_OUTPUT.PUT_LINE('✅ Chef existe déjà');
    END IF;
  END;
END;
/

-- Vérifier et créer Magasinier (P001 - Magasinier)
BEGIN
  DECLARE
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count FROM personnel WHERE login = 'sami.b';
    
    IF v_count = 0 THEN
      INSERT INTO personnel (
        idpers, nompers, prenompers, adrpers, villepers, 
        telpers, d_embauche, login, codeposte
      ) VALUES (
        3, 'Bakhti', 'Sami', '789 rue Mag', 'Kasserine',
        '21622222', SYSDATE, 'sami.b', 'P001'
      );
      DBMS_OUTPUT.PUT_LINE('✅ Magasinier créé avec login: sami.b');
    ELSE
      DBMS_OUTPUT.PUT_LINE('✅ Magasinier existe déjà');
    END IF;
  END;
END;
/

COMMIT;

-- 4. Afficher tous les utilisateurs après correction
PROMPT;
PROMPT ===== UTILISATEURS FINAUX =====;
SELECT idpers, nompers, prenompers, login, codeposte 
FROM personnel 
WHERE login IN ('admin', 'chef', 'sami.b')
ORDER BY idpers;

PROMPT;
PROMPT ✅ Tous les utilisateurs sont maintenant configurés;
PROMPT;
PROMPT Mots de passe (tous): pass1234;
PROMPT;
