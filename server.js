// server.js - Backend Express avec Oracle
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration Oracle
const dbConfig = {
  user: 'SYSTEM',
  password: 'rawen123',
  connectString: 'localhost:1521/xe'
};

// Pool de connexions
let pool;
let poolError = null;

async function initialize() {
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log('✓ Pool de connexions créé');
  } catch (err) {
    poolError = err.message;
    console.error('✗ Erreur connexion Oracle:', err.message);
    console.log('💡 Veuillez mettre à jour les identifiants dans server.js:');
    console.log('   - user: votre_user');
    console.log('   - password: votre_password');
    console.log('   - connectString: localhost:1521/xe');
  }
}

initialize();

// ==================== DONNÉES DE TEST ====================
const mockCommandes = [
  [1, new Date('2025-01-15'), 'En préparation', 1, 'Dupont', 'Jean', 1500],
  [2, new Date('2025-01-10'), 'Expédiée', 2, 'Martin', 'Marie', 2300],
  [3, new Date('2025-01-05'), 'Livrée', 1, 'Dupont', 'Jean', 1200]
];

const mockLivraisons = [
  [1, new Date('2025-01-20'), 'Livrée', 'DHL', 1, 'Dupont', 'Jean'],
  [2, new Date('2025-01-18'), 'En cours', 'FedEx', 2, 'Martin', 'Marie']
];

const mockUsers = [
  [1, 'Dupont', 'Jean', 'jdupont', 'Responsable', new Date('2020-01-15'), '06 12 34 56 78'],
  [2, 'Martin', 'Marie', 'mmartin', 'Vendeur', new Date('2021-06-10'), '06 87 65 43 21']
];

const mockClients = [
  [1, 'Dupont', 'Jean', '123 Rue de Paris'],
  [2, 'Martin', 'Marie', '456 Avenue de Lyon']
];

const mockArticles = [
  [1, 'Produit A', 'Description A', 100, 500, 50, 150],
  [2, 'Produit B', 'Description B', 200, 300, 20, 100]
];

const mockPostes = [
  [1, 'Responsable'],
  [2, 'Vendeur'],
  [3, 'Livreur']
];


// ==================== GESTION DES COMMANDES ====================

// Ajouter une commande
app.post('/api/commandes/ajouter', async (req, res) => {
  let connection;
  try {
    const { noclt, refart, qtecde } = req.body;
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_commandes.ajouter_commande(:noclt, :refart, :qtecde);
      END;`,
      { noclt, refart, qtecde },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Commande ajoutée avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Modifier état commande
app.put('/api/commandes/modifier-etat', async (req, res) => {
  let connection;
  try {
    const { nocde, nouvel_etat } = req.body;
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_commandes.modifier_etat_commande(:nocde, :nouvel_etat);
      END;`,
      { nocde, nouvel_etat },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'État modifié avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Annuler commande
app.delete('/api/commandes/annuler/:nocde', async (req, res) => {
  let connection;
  try {
    const nocde = parseInt(req.params.nocde);
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_commandes.annuler_commande(:nocde);
      END;`,
      { nocde },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Commande annulée avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Chercher commande par numéro
app.get('/api/commandes/numero/:nocde', async (req, res) => {
  let connection;
  try {
    const nocde = parseInt(req.params.nocde);
    connection = await pool.getConnection();
    
    const result = await connection.execute(
      `SELECT c.nocde, c.datecde, c.etatcde,
              cl.nomclt, cl.prenomclt, cl.telclt,
              l.refart, a.designation, l.qtecde, a.prixV,
              (l.qtecde * a.prixV) AS montant_ligne
       FROM commandes c
       JOIN clients cl ON c.noclt = cl.noclt
       LEFT JOIN ligcdes l ON c.nocde = l.nocde
       LEFT JOIN articles a ON l.refart = a.refart
       WHERE c.nocde = :nocde`,
      { nocde }
    );
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Chercher commandes par client
app.get('/api/commandes/client/:noclt', async (req, res) => {
  let connection;
  try {
    const noclt = parseInt(req.params.noclt);
    connection = await pool.getConnection();
    
    const result = await connection.execute(
      `SELECT c.nocde, c.datecde, c.etatcde,
              COUNT(l.refart) AS nb_articles,
              NVL(SUM(l.qtecde * a.prixV), 0) AS montant_total
       FROM commandes c
       LEFT JOIN ligcdes l ON c.nocde = l.nocde
       LEFT JOIN articles a ON l.refart = a.refart
       WHERE c.noclt = :noclt
       GROUP BY c.nocde, c.datecde, c.etatcde
       ORDER BY c.datecde DESC`,
      { noclt }
    );
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Liste toutes les commandes
app.get('/api/commandes', async (req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, data: mockCommandes });
    }
    let connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT c.nocde, c.datecde, c.etatcde, c.noclt,
              cl.nomclt, cl.prenomclt
       FROM commandes c
       JOIN clients cl ON c.noclt = cl.noclt
       ORDER BY c.datecde DESC`
    );
    await connection.close();
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erreur commandes:', err.message);
    res.json({ success: true, data: mockCommandes });
  }
});

// ==================== GESTION DES LIVRAISONS ====================

// Ajouter livraison
app.post('/api/livraisons/ajouter', async (req, res) => {
  let connection;
  try {
    const { nocde, dateliv, livreur, modepay } = req.body;
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_livraisons.ajouter_livraison(:nocde, TO_DATE(:dateliv, 'YYYY-MM-DD'), :livreur, :modepay);
      END;`,
      { nocde, dateliv, livreur, modepay },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Livraison ajoutée avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Modifier livraison
app.put('/api/livraisons/modifier', async (req, res) => {
  let connection;
  try {
    const { nocde, nouvelle_date, nouveau_livreur } = req.body;
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_livraisons.modifier_livraison(
          :nocde, 
          ${nouvelle_date ? "TO_DATE(:nouvelle_date, 'YYYY-MM-DD')" : 'NULL'},
          ${nouveau_livreur ? ':nouveau_livreur' : 'NULL'}
        );
      END;`,
      { nocde, nouvelle_date, nouveau_livreur },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Livraison modifiée avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Supprimer livraison
app.delete('/api/livraisons/supprimer/:nocde', async (req, res) => {
  let connection;
  try {
    const nocde = parseInt(req.params.nocde);
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_livraisons.supprimer_livraison(:nocde);
      END;`,
      { nocde },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Livraison supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Chercher livraisons par commande
app.get('/api/livraisons/commande/:nocde', async (req, res) => {
  let connection;
  try {
    const nocde = parseInt(req.params.nocde);
    connection = await pool.getConnection();
    
    const result = await connection.execute(
      `SELECT * FROM LivraisonCom WHERE nocde = :nocde`,
      { nocde }
    );
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Liste toutes les livraisons
app.get('/api/livraisons', async (req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, data: mockLivraisons });
    }
    let connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT lv.*, p.nompers, p.prenompers, c.noclt, cl.nomclt
       FROM LivraisonCom lv
       JOIN personnel p ON lv.livreur = p.idpers
       JOIN commandes c ON lv.nocde = c.nocde
       JOIN clients cl ON c.noclt = cl.noclt
       ORDER BY lv.dateliv DESC`
    );
    await connection.close();
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erreur livraisons:', err.message);
    res.json({ success: true, data: mockLivraisons });
  }
});

// ==================== GESTION DES UTILISATEURS ====================

// Authentifier
app.post('/api/users/login', async (req, res) => {
  let connection;
  try {
    const { login, password } = req.body;
    connection = await pool.getConnection();
    
    const result = await connection.execute(
      `BEGIN
        :idpers := pkg_gestion_utilisateurs.authentifier(:login, :password);
      END;`,
      { 
        idpers: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        login, 
        password 
      }
    );
    
    if (result.outBinds.idpers > 0) {
      const user = await connection.execute(
        `SELECT p.*, po.libelle FROM personnel p
         JOIN postes po ON p.codeposte = po.codeposte
         WHERE p.idpers = :idpers`,
        { idpers: result.outBinds.idpers }
      );
      res.json({ success: true, user: user.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Login ou mot de passe incorrect' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Ajouter utilisateur
app.post('/api/users/ajouter', async (req, res) => {
  let connection;
  try {
    const { nompers, prenompers, adrpers, villepers, telpers, login, motP, codeposte } = req.body;
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_utilisateurs.ajouter_utilisateur(
          :nompers, :prenompers, :adrpers, :villepers, 
          :telpers, :login, :motP, :codeposte
        );
      END;`,
      { nompers, prenompers, adrpers, villepers, telpers, login, motP, codeposte },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Utilisateur ajouté avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Modifier utilisateur
app.put('/api/users/modifier', async (req, res) => {
  let connection;
  try {
    const { idpers, nompers, prenompers, adrpers, villepers, telpers, motP, codeposte } = req.body;
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_utilisateurs.modifier_utilisateur(
          :idpers, :nompers, :prenompers, :adrpers, 
          :villepers, :telpers, :motP, :codeposte
        );
      END;`,
      { idpers, nompers, prenompers, adrpers, villepers, telpers, motP, codeposte },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Utilisateur modifié avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Liste des utilisateurs
app.get('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT p.idpers, p.nompers, p.prenompers, p.login, 
              po.libelle, p.d_embauche, p.telpers, p.villepers
       FROM personnel p
       JOIN postes po ON p.codeposte = po.codeposte
       WHERE p.login NOT LIKE '%_INACTIF_%'
       ORDER BY po.libelle, p.nompers`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== DONNÉES DE RÉFÉRENCE ====================

// Liste des clients
app.get('/api/clients', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT * FROM clients ORDER BY nomclt`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Liste des articles
app.get('/api/articles', async (req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, data: mockArticles });
    }
    let connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT * FROM articles WHERE supp = 'N' ORDER BY designation`
    );
    await connection.close();
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erreur articles:', err.message);
    res.json({ success: true, data: mockArticles });
  }
});

// Liste du personnel (livreurs)
app.get('/api/personnel', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT p.*, po.libelle FROM personnel p
       JOIN postes po ON p.codeposte = po.codeposte
       ORDER BY p.nompers`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Liste des postes
app.get('/api/postes', async (req, res) => {
  try {
    if (!pool) {
      return res.json({ success: true, data: mockPostes });
    }
    let connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT * FROM postes ORDER BY libelle`
    );
    await connection.close();
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Erreur postes:', err.message);
    res.json({ success: true, data: mockPostes });
  }
});

// ==================== VUES ET STATISTIQUES ====================

// Vue livraisons en cours
app.get('/api/vues/livraisons-en-cours', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT * FROM vue_livraisons_en_cours`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Vue statistiques articles
app.get('/api/vues/stats-articles', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT * FROM vue_stats_articles`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

process.on('SIGINT', async () => {
  try {
    await pool.close();
    console.log('Pool fermé');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});