/**
 * CRUD API Routes - Documentation
 * 
 * Ce fichier contient les routes API pour les opérations CRUD
 * sur les tables protégées par les triggers Oracle.
 */

// ==================== ARTICLES ====================

/**
 * GET /api/articles
 * Récupère tous les articles
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "REFART": "A001",
 *       "DESIGNATION": "Stylo",
 *       "PRIXA": 0.5,
 *       "PRIX_V": 1.0,
 *       "CODETVA": 1,
 *       "CATEGORIE": "Bureau",
 *       "QTESTK": 100
 *     }
 *   ]
 * }
 */

/**
 * POST /api/articles
 * Crée un nouvel article
 * 
 * Body:
 * {
 *   "refart": "A011",           // ✅ Obligatoire, unique
 *   "designation": "Stylo rouge", // ✅ Obligatoire
 *   "prixA": 0.5,              // ✅ Obligatoire
 *   "prixV": 1.0,              // ✅ Obligatoire, doit être > prixA
 *   "codetva": 1,              // ✅ Obligatoire (1, 2 ou 3)
 *   "categorie": "Bureau",     // Optionnel
 *   "qtestk": 150              // Stock initial
 * }
 * 
 * Triggers appliqués:
 * ✅ trg_verif_article_unique (BEFORE INSERT)
 *    - Si refart existe → Erreur ORA-20016
 * 
 * Réponse succès:
 * {
 *   "success": true,
 *   "message": "Article créé avec succès"
 * }
 * 
 * Réponse erreur (doublon):
 * {
 *   "success": false,
 *   "message": "Article déjà existant"
 * }
 */

/**
 * GET /api/articles/:refart
 * Récupère un article spécifique
 */

/**
 * PUT /api/articles/:refart
 * Met à jour un article
 * 
 * Note: Le trigger trg_maj_stock affecte les stocks
 * lors de l'insertion de lignes de commandes
 */

/**
 * DELETE /api/articles/:refart
 * Supprime un article
 */

// ==================== CLIENTS ====================

/**
 * GET /api/clients
 * Récupère tous les clients
 */

/**
 * POST /api/clients
 * Crée un nouveau client
 * 
 * Body:
 * {
 *   "nomclt": "Ben Ahmed",      // ✅ Obligatoire
 *   "prenomclt": "Sara",        // Optionnel
 *   "adrclt": "Rue 100",        // ✅ Obligatoire
 *   "code_postal": 8000,        // ✅ Obligatoire (1000-9999)
 *   "villeclt": "Sfax",         // ✅ Obligatoire
 *   "telclt": 98990011,         // ✅ Obligatoire (8 chiffres)
 *   "adrmail": "sara@gmail.com" // Optionnel
 * }
 * 
 * Triggers appliqués:
 * ✅ trg_verif_client_unique (BEFORE INSERT)
 *    - Clé: NOM + PRÉNOM + TÉLÉPHONE
 *    - Si existe → Erreur ORA-20017
 * 
 * Réponse succès:
 * {
 *   "success": true,
 *   "data": {
 *     "noclt": 11,
 *     "nomclt": "Ben Ahmed",
 *     "prenomclt": "Sara"
 *   }
 * }
 * 
 * Réponse erreur (doublon):
 * {
 *   "success": false,
 *   "message": "Client déjà existant"
 * }
 */

/**
 * GET /api/clients/:noclt
 * Récupère un client spécifique
 */

/**
 * PUT /api/clients/:noclt
 * Met à jour un client
 */

/**
 * DELETE /api/clients/:noclt
 * Supprime un client
 */

// ==================== COMMANDES ====================

/**
 * GET /api/commandes
 * Récupère toutes les commandes
 */

/**
 * POST /api/commandes
 * Crée une nouvelle commande
 * 
 * Body:
 * {
 *   "nocde": 100,              // ID commande
 *   "noclt": 1,                // ✅ Obligatoire (FK client)
 *   "datecde": "2024-01-16",   // ❌ Ignoré par trigger
 *   "etatcde": "PR"            // ❌ Ignoré par trigger
 * }
 * 
 * Triggers appliqués:
 * ✅ trg_date_commande (BEFORE INSERT)
 *    - Écrase datecde avec SYSDATE
 *    - Écrase etatcde avec 'EC'
 * 
 * ✅ trg_audit_commandes (AFTER UPDATE)
 *    - Enregistre les changements d'état
 * 
 * Valeurs réelles dans la BD:
 * {
 *   "nocde": 100,
 *   "noclt": 1,
 *   "datecde": "2024-01-16 14:30:45",  // SYSDATE
 *   "etatcde": "EC"                    // Forcé
 * }
 * 
 * États possibles:
 * - EC: En Cours
 * - PR: Préparation
 * - LI: Livrée
 * - SO: Sortie
 * - AN: Annulée
 * - AL: Alertée
 */

/**
 * GET /api/commandes/:nocde
 * Récupère une commande spécifique
 */

/**
 * PUT /api/commandes/:nocde
 * Met à jour l'état d'une commande
 * 
 * Body:
 * {
 *   "etatcde": "LI"
 * }
 * 
 * Triggers appliqués:
 * ✅ trg_audit_commandes (AFTER UPDATE)
 *    - Enregistre le changement dans audit_commandes
 *    - ancien_etat: ancien état
 *    - nouvel_etat: nouvel état
 *    - date_modif: SYSDATE
 * 
 * Audit créé:
 * {
 *   "nocde": 1,
 *   "ancien_etat": "EC",
 *   "nouvel_etat": "LI",
 *   "date_modif": "2024-01-16 14:35:22"
 * }
 */

/**
 * DELETE /api/commandes/:nocde
 * Supprime une commande
 */

// ==================== LIGNES DE COMMANDE ====================

/**
 * GET /api/ligcdes/:nocde
 * Récupère les lignes d'une commande
 */

/**
 * POST /api/ligcdes
 * Ajoute une ligne à une commande
 * 
 * Body:
 * {
 *   "nocde": 1,          // ✅ Obligatoire (FK commande)
 *   "refart": "A001",    // ✅ Obligatoire (FK article)
 *   "qtecde": 5,         // ✅ Obligatoire (quantité)
 *   "puxunitcde": 1.0    // ✅ Obligatoire (prix unitaire)
 * }
 * 
 * Triggers appliqués:
 * ✅ trg_maj_stock (AFTER INSERT)
 *    - Met à jour articles.qtestk
 *    - Décrémente stock: qtestk = qtestk - qtecde
 *    - Si article inexistant → Erreur ORA-20018
 * 
 * Exemple:
 * - Stock initial A001: 100
 * - INSERT LIGCDES avec qtecde = 5
 * - Stock après trigger: 100 - 5 = 95
 * 
 * États de stock:
 * - qtestk >= 50: Stock normal
 * - 10 <= qtestk < 50: Stock faible ⚠️
 * - qtestk < 10: Stock critique 🚨
 */

/**
 * PUT /api/ligcdes/:nocde/:refart
 * Met à jour une ligne de commande
 */

/**
 * DELETE /api/ligcdes/:nocde/:refart
 * Supprime une ligne de commande
 */

// ==================== LIVRAISONS ====================

/**
 * GET /api/livraisons
 * Récupère toutes les livraisons
 */

/**
 * POST /api/livraisons
 * Crée une nouvelle livraison
 * 
 * Body:
 * {
 *   "nocde": 1,                        // ✅ FK commande
 *   "date_livraison": "2024-01-20",   // ✅ Obligatoire, future
 *   "adresse_livraison": "Rue 100",   // ✅ Obligatoire
 *   "statut": "Planifiée"              // Optionnel
 * }
 * 
 * Triggers appliqués:
 * ✅ trg_limite_livraisons (BEFORE INSERT)
 *    - Validation 1: date_livraison NOT NULL
 *    - Validation 2: date_livraison >= TRUNC(SYSDATE)
 *    - Si date null → Erreur ORA-20019
 *    - Si date passée → Erreur ORA-20020
 * 
 * ✅ trg_heure_maj_livraison (AFTER UPDATE)
 *    - Met à jour heure_maj_livraison avec SYSDATE
 */

/**
 * GET /api/livraisons/:nocde
 * Récupère les livraisons d'une commande
 */

/**
 * PUT /api/livraisons/:id
 * Met à jour une livraison
 * 
 * Body:
 * {
 *   "statut": "Livrée",
 *   "date_livraison": "2024-01-20"
 * }
 * 
 * Triggers appliqués:
 * ✅ trg_heure_maj_livraison (AFTER UPDATE)
 *    - heure_maj_livraison = SYSDATE
 *    - Horodatage automatique
 */

/**
 * DELETE /api/livraisons/:id
 * Supprime une livraison
 */

// ==================== AUDIT ====================

/**
 * GET /api/audit/commandes/:nocde
 * Récupère l'historique d'audit d'une commande
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "nocde": 1,
 *       "ancien_etat": "EC",
 *       "nouvel_etat": "LI",
 *       "date_modif": "2024-01-16 14:35:22"
 *     },
 *     {
 *       "nocde": 1,
 *       "ancien_etat": "LI",
 *       "nouvel_etat": "SO",
 *       "date_modif": "2024-01-16 15:40:11"
 *     }
 *   ]
 * }
 */

// ==================== GESTION DES ERREURS ====================

/**
 * Codes d'erreur des triggers et actions à prendre:
 * 
 * ORA-20016: Article déjà existant
 *   - Cause: Insert d'un article avec refart existante
 *   - Solution: Utiliser une autre référence
 * 
 * ORA-20017: Client déjà existant
 *   - Cause: Insertion doublon (nom+prénom+tel)
 *   - Solution: Vérifier l'unicité de la combinaison
 * 
 * ORA-20018: Article introuvable
 *   - Cause: Insertion LIGCDES avec refart inexistant
 *   - Solution: Vérifier l'existence de l'article
 * 
 * ORA-20019: Date de livraison obligatoire
 *   - Cause: date_livraison IS NULL
 *   - Solution: Fournir une date valide
 * 
 * ORA-20020: Date antérieure à aujourd'hui
 *   - Cause: date_livraison < TRUNC(SYSDATE)
 *   - Solution: Utiliser une date future ou actuelle
 */

// ==================== EXAMPLES PRATIQUES ====================

/**
 * Exemple 1: Création complète d'une commande
 * 
 * // 1. Créer un article
 * POST /api/articles
 * {
 *   "refart": "A012",
 *   "designation": "Stylo bleu",
 *   "prixA": 0.4,
 *   "prixV": 0.9,
 *   "codetva": 1,
 *   "categorie": "Bureau",
 *   "qtestk": 200
 * }
 * // Trigger: trg_verif_article_unique ✅
 * // Résultat: Article créé
 * 
 * // 2. Créer une commande
 * POST /api/commandes
 * {
 *   "nocde": 101,
 *   "noclt": 5
 * }
 * // Trigger: trg_date_commande ✅
 * // Résultat: datecde=SYSDATE, etatcde='EC'
 * 
 * // 3. Ajouter une ligne
 * POST /api/ligcdes
 * {
 *   "nocde": 101,
 *   "refart": "A012",
 *   "qtecde": 10,
 *   "puxunitcde": 0.9
 * }
 * // Trigger: trg_maj_stock ✅
 * // Résultat: qtestk(A012) = 200 - 10 = 190
 * 
 * // 4. Mettre à jour l'état
 * PUT /api/commandes/101
 * {
 *   "etatcde": "LI"
 * }
 * // Trigger: trg_audit_commandes ✅
 * // Résultat: Audit enregistré
 */

// ==================== TEST AVEC CURL ====================

/**
 * // Créer un article
 * curl -X POST http://localhost:3001/api/articles \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer TOKEN" \
 *   -d '{
 *     "refart": "A012",
 *     "designation": "Stylo bleu",
 *     "prixA": 0.4,
 *     "prixV": 0.9,
 *     "codetva": 1,
 *     "categorie": "Bureau",
 *     "qtestk": 200
 *   }'
 * 
 * // Récupérer tous les articles
 * curl -X GET http://localhost:3001/api/articles \
 *   -H "Authorization: Bearer TOKEN"
 * 
 * // Créer une commande
 * curl -X POST http://localhost:3001/api/commandes \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer TOKEN" \
 *   -d '{
 *     "nocde": 101,
 *     "noclt": 5
 *   }'
 * 
 * // Mettre à jour état commande
 * curl -X PUT http://localhost:3001/api/commandes/101 \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer TOKEN" \
 *   -d '{"etatcde": "LI"}'
 */

module.exports = {
  description: "Routes CRUD API - Complètement dédiées aux opérations sur la base de données",
  version: "1.0.0",
  lastUpdated: "2024-01-16"
};
