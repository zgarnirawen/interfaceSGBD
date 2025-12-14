-- ====== FIX: Trigger TRG_AUDIT_COMMANDES ======
-- Ce script corrige l'erreur ORA-04098 en créant la table AUDIT_COMMANDES manquante

-- ============================================
-- ÉTAPE 1: DÉSACTIVER LE TRIGGER INVALIDE
-- ============================================
ALTER TRIGGER trg_audit_commandes DISABLE;

-- ============================================
-- ÉTAPE 2: CRÉER LA TABLE AUDIT_COMMANDES
-- ============================================
BEGIN
  DECLARE
    v_table_exists NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_table_exists
    FROM user_tables
    WHERE table_name = 'AUDIT_COMMANDES';
    
    IF v_table_exists = 0 THEN
      EXECUTE IMMEDIATE '
        CREATE TABLE audit_commandes (
          id_audit NUMBER,
          nocde NUMBER,
          ancien_etat VARCHAR2(2),
          nouvel_etat VARCHAR2(2),
          date_modif DATE,
          user_modif VARCHAR2(30),
          CONSTRAINT pk_audit_commandes PRIMARY KEY (id_audit)
        )
      ';
      DBMS_OUTPUT.PUT_LINE('✅ Table AUDIT_COMMANDES créée avec succès');
      
      EXECUTE IMMEDIATE '
        CREATE SEQUENCE seq_audit_commandes
        START WITH 1
        INCREMENT BY 1
        CACHE 20
      ';
      DBMS_OUTPUT.PUT_LINE('✅ Séquence seq_audit_commandes créée');
    ELSE
      DBMS_OUTPUT.PUT_LINE('✅ Table AUDIT_COMMANDES existe déjà');
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLCODE != -955 THEN
        RAISE;
      END IF;
  END;
END;
/

-- ============================================
-- ÉTAPE 3: RECRÉER LE TRIGGER (VERSION CORRIGÉE)
-- ============================================
CREATE OR REPLACE TRIGGER trg_audit_commandes
AFTER UPDATE ON commandes
FOR EACH ROW
WHEN (OLD.etatcde != NEW.etatcde)  -- Seulement si l'état change
BEGIN
  BEGIN
    INSERT INTO audit_commandes (
      id_audit, 
      nocde, 
      ancien_etat, 
      nouvel_etat, 
      date_modif, 
      user_modif
    )
    VALUES (
      seq_audit_commandes.NEXTVAL,
      :NEW.nocde,
      :OLD.etatcde,
      :NEW.etatcde,
      SYSDATE,
      USER
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Ne pas bloquer la mise à jour si l'audit échoue
      NULL;
  END;
END trg_audit_commandes;
/

-- ============================================
-- ÉTAPE 4: RÉACTIVER LE TRIGGER
-- ============================================
ALTER TRIGGER trg_audit_commandes ENABLE;

-- ============================================
-- ÉTAPE 5: COMMIT
-- ============================================
COMMIT;

-- ============================================
-- ÉTAPE 6: VÉRIFIER L'INTÉGRITÉ DES DONNÉES
-- ============================================
-- Les commandes suivantes peuvent être exécutées séparément pour vérifier :
-- SELECT COUNT(*) as "Nombre de records AUDIT_COMMANDES" FROM audit_commandes;
-- SELECT COUNT(*) as "Nombre de COMMANDES" FROM commandes;
-- SELECT DISTINCT etatcde FROM commandes ORDER BY etatcde;
