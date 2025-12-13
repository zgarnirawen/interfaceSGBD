import React, { useState } from 'react';
import './TriggersDocumentation.css';

const TriggersDocumentation = () => {
  const [expandedTrigger, setExpandedTrigger] = useState(null);

  const triggers = [
    {
      id: 1,
      name: 'trg_verif_article_unique',
      type: 'BEFORE INSERT',
      table: 'ARTICLES',
      status: '✅ Actif',
      created: '2024-01-15',
      description: 'Vérifie l\'unicité de la référence article avant insertion',
      purpose: 'Prévenir les doublons de références articles',
      triggerCode: `CREATE OR REPLACE TRIGGER trg_verif_article_unique
BEFORE INSERT ON articles
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM articles WHERE refart = :NEW.refart;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20016, 'Article déjà existant');
    END IF;
END;
/`,
      behavior: [
        'Exécution: BEFORE INSERT (avant insertion)',
        'Vérification: Compte les articles avec la même référence',
        'Condition: Si count > 0 → lève erreur -20016',
        'Impact: L\'insertion est bloquée si doublon détecté'
      ],
      testCase: {
        title: 'Test du Trigger',
        scenario: 'Insertion d\'un article avec une référence existante',
        steps: [
          '1. Exécuter: INSERT INTO articles VALUES (\'A001\', ...)',
          '2. Résultat attendu: Erreur ORA-20016 "Article déjà existant"',
          '3. L\'article n\'est pas inséré',
          '4. La transaction est rollback'
        ]
      }
    },
    {
      id: 2,
      name: 'trg_verif_client_unique',
      type: 'BEFORE INSERT',
      table: 'CLIENTS',
      status: '✅ Actif',
      created: '2024-01-15',
      description: 'Vérifie l\'unicité du client (NOM + PRÉNOM + TÉLÉPHONE)',
      purpose: 'Empêcher l\'enregistrement de clients en doublon',
      triggerCode: `CREATE OR REPLACE TRIGGER trg_verif_client_unique
BEFORE INSERT ON clients
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM clients 
    WHERE nomclt = :NEW.nomclt 
    AND prenomclt = :NEW.prenomclt
    AND telclt = :NEW.telclt;
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20017, 'Client déjà existant');
    END IF;
END;
/`,
      behavior: [
        'Exécution: BEFORE INSERT',
        'Clé d\'unicité: NOM + PRÉNOM + TÉLÉPHONE',
        'Condition: Si combinaison existe → erreur -20017',
        'Impact: Prévention des doublons intelligents'
      ],
      testCase: {
        title: 'Test du Trigger',
        scenario: 'Insertion d\'un client existant',
        steps: [
          '1. Insérer un client: (Ben Ahmed, Sara, 98990011)',
          '2. Tenter de réinsérer le même client',
          '3. Résultat: Erreur ORA-20017 "Client déjà existant"',
          '4. Le deuxième insert échoue'
        ]
      }
    },
    {
      id: 3,
      name: 'trg_date_commande',
      type: 'BEFORE INSERT',
      table: 'COMMANDES',
      status: '✅ Actif',
      created: '2024-01-15',
      description: 'Initialise automatiquement la date et l\'état de la commande',
      purpose: 'Garantir que chaque commande a une date système et un état initial',
      triggerCode: `CREATE OR REPLACE TRIGGER trg_date_commande
BEFORE INSERT ON commandes
FOR EACH ROW
BEGIN
    :NEW.datecde := SYSDATE;
    :NEW.etatcde := 'EC';
END;
/`,
      behavior: [
        'Exécution: BEFORE INSERT',
        'Action 1: Définit datecde = SYSDATE',
        'Action 2: Définit etatcde = \'EC\' (En Cours)',
        'Impact: Les valeurs fournies pour ces colonnes sont ignorées'
      ],
      testCase: {
        title: 'Test du Trigger',
        scenario: 'Insertion d\'une commande',
        steps: [
          '1. INSERT INTO commandes (nocde, noclt, datecde, etatcde) VALUES (100, 5, TO_DATE(...), \'PR\')',
          '2. Le trigger ignore la date fournie',
          '3. Le trigger ignore l\'état fourni',
          '4. Résultat: datecde = date du jour, etatcde = \'EC\''
        ]
      }
    },
    {
      id: 4,
      name: 'trg_audit_commandes',
      type: 'AFTER UPDATE',
      table: 'COMMANDES',
      status: '✅ Actif',
      created: '2024-01-15',
      description: 'Enregistre les modifications d\'état des commandes',
      purpose: 'Créer une piste d\'audit pour les changements d\'état',
      triggerCode: `CREATE OR REPLACE TRIGGER trg_audit_commandes
AFTER UPDATE ON commandes
FOR EACH ROW
BEGIN
    INSERT INTO audit_commandes (nocde, ancien_etat, nouvel_etat, date_modif)
    VALUES (:OLD.nocde, :OLD.etatcde, :NEW.etatcde, SYSDATE);
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Table audit optionnelle
END;
/`,
      behavior: [
        'Exécution: AFTER UPDATE (après modification)',
        'Accès: Utilise :OLD pour ancien état, :NEW pour nouvel état',
        'Enregistrement: Crée une ligne d\'audit',
        'Gestion erreurs: Exception silencieuse (table optionnelle)'
      ],
      testCase: {
        title: 'Test du Trigger',
        scenario: 'Modification de l\'état d\'une commande',
        steps: [
          '1. UPDATE commandes SET etatcde = \'LI\' WHERE nocde = 1',
          '2. Le trigger enregistre: ancienEtat = ancien_etat, nouvelEtat = \'LI\'',
          '3. Une ligne est créée dans audit_commandes',
          '4. Trace complète des changements d\'état'
        ]
      }
    },
    {
      id: 5,
      name: 'trg_maj_stock',
      type: 'AFTER INSERT',
      table: 'LIGCDES',
      status: '✅ Actif',
      created: '2024-01-15',
      description: 'Met à jour automatiquement le stock après ajout d\'une ligne de commande',
      purpose: 'Maintenir la cohérence du stock avec les commandes',
      triggerCode: `CREATE OR REPLACE TRIGGER trg_maj_stock
AFTER INSERT ON ligcdes
FOR EACH ROW
BEGIN
    UPDATE articles
    SET qtestk = qtestk - :NEW.qtecde
    WHERE refart = :NEW.refart;
    
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20018, 'Article introuvable');
    END IF;
END;
/`,
      behavior: [
        'Exécution: AFTER INSERT (après insertion ligne commande)',
        'Action: Décrémente le stock de l\'article',
        'Validation: Vérifie que l\'article existe',
        'Erreur: Lève -20018 si article non trouvé'
      ],
      testCase: {
        title: 'Test du Trigger',
        scenario: 'Ajout d\'une ligne de commande',
        steps: [
          '1. Stock initial: A001 = 100 unités',
          '2. INSERT INTO ligcdes VALUES (nocde, \'A001\', 5)',
          '3. Trigger décrémente: 100 - 5 = 95',
          '4. Résultat: qtestk pour A001 = 95'
        ]
      }
    },
    {
      id: 6,
      name: 'trg_limite_livraisons',
      type: 'BEFORE INSERT OR UPDATE',
      table: 'LIVRAISONCOM',
      status: '✅ Actif',
      created: '2024-01-16',
      description: 'Contrôle les limites de livraisons',
      purpose: 'Valider les règles métier pour les livraisons',
      triggerCode: `CREATE OR REPLACE TRIGGER trg_limite_livraisons
BEFORE INSERT OR UPDATE ON LivraisonCom
FOR EACH ROW
BEGIN
    -- Validations des règles de livraison
    IF :NEW.date_livraison IS NULL THEN
        RAISE_APPLICATION_ERROR(-20019, 'Date de livraison obligatoire');
    END IF;
    
    IF :NEW.date_livraison < SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20020, 'La date de livraison ne peut pas être antérieure à aujourd\'hui');
    END IF;
END;
/`,
      behavior: [
        'Exécution: BEFORE INSERT/UPDATE',
        'Validation 1: date_livraison non null',
        'Validation 2: date_livraison >= SYSDATE',
        'Erreur: Levée si règles non respectées'
      ],
      testCase: {
        title: 'Test du Trigger',
        scenario: 'Tentative d\'insertion avec date invalide',
        steps: [
          '1. INSERT INTO LivraisonCom WITH date_livraison = NULL',
          '2. Résultat: Erreur -20019',
          '3. INSERT WITH date_livraison = date passée',
          '4. Résultat: Erreur -20020'
        ]
      }
    },
    {
      id: 7,
      name: 'trg_heure_maj_livraison',
      type: 'AFTER UPDATE',
      table: 'LIVRAISONCOM',
      status: '✅ Actif',
      created: '2024-01-16',
      description: 'Enregistre la date/heure de modification de livraison',
      purpose: 'Maintenir une trace d\'audit des modifications',
      triggerCode: `CREATE OR REPLACE TRIGGER trg_heure_maj_livraison
AFTER UPDATE ON LivraisonCom
FOR EACH ROW
BEGIN
    UPDATE LivraisonCom 
    SET heure_maj_livraison = SYSDATE
    WHERE id_livraison = :NEW.id_livraison;
END;
/`,
      behavior: [
        'Exécution: AFTER UPDATE',
        'Action: Met à jour heure_maj_livraison',
        'Valeur: SYSDATE (date/heure actuelle)',
        'Impact: Chaque modification est horodatée'
      ],
      testCase: {
        title: 'Test du Trigger',
        scenario: 'Modification d\'une livraison',
        steps: [
          '1. UPDATE LivraisonCom SET statut = \'Livrée\' WHERE id = 10',
          '2. Trigger exécuté après la mise à jour',
          '3. heure_maj_livraison = SYSDATE',
          '4. Trace temporelle de la modification'
        ]
      }
    }
  ];

  return (
    <div className="triggers-doc">
      <div className="doc-container">
        <div className="doc-header">
          <h1>📚 Documentation Complète des Triggers</h1>
          <p className="header-subtitle">Guide détaillé de chaque trigger Oracle appliqué sur la base de données</p>
          
          <div className="trigger-stats">
            <div className="stat-item">
              <span className="stat-number">7</span>
              <span className="stat-label">Triggers Totaux</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">BEFORE Triggers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">AFTER Triggers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5</span>
              <span className="stat-label">Tables Protégées</span>
            </div>
          </div>
        </div>

        <div className="trigger-table-list">
          {triggers.map(trigger => (
            <div 
              key={trigger.id} 
              className={`trigger-doc-card ${expandedTrigger === trigger.id ? 'expanded' : ''}`}
            >
              <div 
                className="trigger-doc-header"
                onClick={() => setExpandedTrigger(expandedTrigger === trigger.id ? null : trigger.id)}
              >
                <div className="trigger-doc-title">
                  <h3>{trigger.name}</h3>
                  <div className="trigger-meta">
                    <span className={`trigger-badge ${trigger.type.includes('BEFORE') ? 'before' : 'after'}`}>
                      {trigger.type}
                    </span>
                    <span className="table-badge">{trigger.table}</span>
                    <span className="status-badge">{trigger.status}</span>
                  </div>
                </div>
                <div className="expand-icon">
                  {expandedTrigger === trigger.id ? '▼' : '▶'}
                </div>
              </div>

              {expandedTrigger === trigger.id && (
                <div className="trigger-doc-content">
                  <div className="content-section">
                    <h4>📝 Description</h4>
                    <p>{trigger.description}</p>
                  </div>

                  <div className="content-section">
                    <h4>🎯 Objectif</h4>
                    <p>{trigger.purpose}</p>
                  </div>

                  <div className="content-section">
                    <h4>⚡ Comportement</h4>
                    <ul className="behavior-list">
                      {trigger.behavior.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="content-section">
                    <h4>💻 Code du Trigger</h4>
                    <pre className="code-block">{trigger.triggerCode}</pre>
                  </div>

                  <div className="content-section test-case">
                    <h4>🧪 {trigger.testCase.title}</h4>
                    <p className="test-scenario"><strong>Scénario:</strong> {trigger.testCase.scenario}</p>
                    <ol className="test-steps">
                      {trigger.testCase.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="content-section meta-info">
                    <p><strong>ID Trigger:</strong> {trigger.id}</p>
                    <p><strong>Date création:</strong> {trigger.created}</p>
                    <p><strong>Statut:</strong> {trigger.status}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="doc-footer">
          <div className="important-note">
            <h3>⚠️ Notes Importantes</h3>
            <ul>
              <li>Les triggers sont exécutés automatiquement à chaque opération concernée</li>
              <li>Les erreurs levées par les triggers bloquent les opérations</li>
              <li>L'ordre d'exécution est important pour les triggers BEFORE vs AFTER</li>
              <li>La gestion des exceptions évite les rollbacks en cascade</li>
              <li>Les triggers ne doivent pas être modifiés sans test complet</li>
            </ul>
          </div>

          <div className="execution-order">
            <h3>🔄 Ordre d'Exécution</h3>
            <div className="order-diagram">
              <div className="order-step before">1. BEFORE Triggers</div>
              <div className="order-arrow">↓</div>
              <div className="order-step action">2. Opération SQL (INSERT/UPDATE)</div>
              <div className="order-arrow">↓</div>
              <div className="order-step after">3. AFTER Triggers</div>
              <div className="order-arrow">↓</div>
              <div className="order-step commit">4. Commit/Rollback</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriggersDocumentation;
