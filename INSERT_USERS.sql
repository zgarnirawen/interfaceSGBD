-- Script d'insertion du personnel (utilisateurs de test pour les différents rôles)
-- Exécutez ce script après la création des tables

-- Administrateur
INSERT INTO personnel (idpers, nompers, prenompers, adrpers, villepers, telpers, d_embauche, login, motP, codeposte)
VALUES (1, 'Adminstrateur', 'Admin', 'Rue Admin', 'Tunis', 71000001, TO_DATE('01-01-2020','DD-MM-YYYY'), 'admin', 'pass1234', 'P002');

-- Chef Livreur
INSERT INTO personnel (idpers, nompers, prenompers, adrpers, villepers, telpers, d_embauche, login, motP, codeposte)
VALUES (2, 'Trabelsi', 'Mohamed', 'Rue Chef', 'Sfax', 71000002, TO_DATE('15-03-2021','DD-MM-YYYY'), 'chef', 'pass1234', 'P003');

-- Magasinier (sami.b est déjà inséré par défaut dans le script principal)
-- Vous pouvez ajouter d'autres magasiniers si vous le souhaitez

COMMIT;
