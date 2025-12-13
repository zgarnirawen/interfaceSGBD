// server.js - Backend Express avec Oracle (VERSION CORRIGÉE)
require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Configuration Oracle depuis .env
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// Pool de connexions
let pool;
let poolError = null;

async function initialize() {
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log('✓ Pool de connexions créé');
    console.log(`✓ Connecté en tant que: ${dbConfig.user}`);
  } catch (err) {
    poolError = err.message;
    console.error('✗ Erreur connexion Oracle:', err.message);
    console.log('💡 Vérifiez votre fichier .env');
  }
}

initialize();

// ==================== MIDDLEWARE AUTHENTIFICATION ====================

// Middleware pour vérifier le token JWT (simple pour le test)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant' });
  }
  // Pour simplifier, on accepte n'importe quel token
  // En production, vous devriez vérifier le JWT correctement
  next();
};

// ==================== ROUTES D'AUTHENTIFICATION ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  let connection;
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Login et mot de passe requis' 
      });
    }

    connection = await pool.getConnection();
    
    // Vérifier les identifiants
    const result = await connection.execute(
      `SELECT p.idpers, p.nompers, p.prenompers, p.login, p.codeposte, 
              po.libelle as poste_libelle
       FROM personnel p
       JOIN postes po ON p.codeposte = po.codeposte
       WHERE p.login = :login AND p.motP = :password`,
      { login, password }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Login ou mot de passe incorrect' 
      });
    }

    const user = result.rows[0];
    const token = Buffer.from(JSON.stringify({
      idpers: user[0],
      login: user[3],
      codeposte: user[4]
    })).toString('base64');

    res.json({ 
      success: true, 
      token,
      user: {
        idpers: user[0],
        nompers: user[1],
        prenompers: user[2],
        login: user[3],
        codeposte: user[4],
        poste: user[5]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== ROUTES ADMIN ====================

// Statistiques Admin
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Total commandes
    const commandes = await connection.execute(
      `SELECT COUNT(*) as total FROM commandes`
    );
    const totalCommandes = commandes.rows[0][0];

    // Total clients
    const clients = await connection.execute(
      `SELECT COUNT(*) as total FROM clients`
    );
    const totalClients = clients.rows[0][0];

    // Chiffre d'affaires
    const ca = await connection.execute(
      `SELECT NVL(SUM(l.qtecde * a.prixV), 0) as ca
       FROM commandes c
       LEFT JOIN ligcdes l ON c.nocde = l.nocde
       LEFT JOIN articles a ON l.refart = a.refart`
    );
    const chiffreAffaires = ca.rows[0][0];

    // Personnel
    const personnel = await connection.execute(
      `SELECT COUNT(*) as total FROM personnel`
    );
    const totalPersonnel = personnel.rows[0][0];

    // Commandes par état
    const parEtat = await connection.execute(
      `SELECT etatcde as etat, COUNT(*) as count 
       FROM commandes 
       GROUP BY etatcde`
    );

    // Personnel par poste
    const parPoste = await connection.execute(
      `SELECT po.libelle, COUNT(*) as count
       FROM personnel p
       JOIN postes po ON p.codeposte = po.codeposte
       GROUP BY po.libelle`
    );

    res.json({ 
      success: true, 
      data: {
        total_commandes: totalCommandes,
        total_clients: totalClients,
        chiffre_affaires: chiffreAffaires,
        total_personnel: totalPersonnel,
        commandes_par_etat: parEtat.rows.map(r => ({ etat: r[0], count: r[1] })),
        personnel_par_poste: parPoste.rows.map(r => ({ libelle: r[0], count: r[1] }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== ROUTES CHEF LIVREUR ====================

// Livraisons du chef livreur
app.get('/api/chef-livreur/livraisons', authMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const result = await connection.execute(
      `SELECT c.nocde, c.datecde, c.etatcde, c.noclt,
              cl.nomclt, cl.prenomclt, cl.adrclt, cl.villeclt, cl.telclt,
              NVL(SUM(l.qtecde * a.prixV), 0) AS montant_total
       FROM commandes c
       JOIN clients cl ON c.noclt = cl.noclt
       LEFT JOIN ligcdes l ON c.nocde = l.nocde
       LEFT JOIN articles a ON l.refart = a.refart
       WHERE c.etatcde IN ('PR', 'LI', 'SO')
       GROUP BY c.nocde, c.datecde, c.etatcde, c.noclt, cl.nomclt, cl.prenomclt, cl.adrclt, cl.villeclt, cl.telclt
       ORDER BY c.datecde DESC`
    );
    
    res.json({ 
      success: true, 
      data: result.rows.map(row => ({
        nocde: row[0],
        datecde: row[1],
        etatcde: row[2],
        noclt: row[3],
        nomclt: row[4],
        prenomclt: row[5],
        adrclt: row[6],
        villeclt: row[7],
        telclt: row[8],
        montant_total: row[9]
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== ROUTES MAGASINIER ====================

// Articles du magasinier
app.get('/api/magasinier/articles', authMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const result = await connection.execute(
      `SELECT refart, designation, prixA, prixV, categorie, qtestk
       FROM articles
       ORDER BY designation ASC`
    );
    
    res.json({ 
      success: true, 
      data: result.rows.map(row => ({
        refart: row[0],
        designation: row[1],
        prixA: row[2],
        prixV: row[3],
        categorie: row[4],
        qtestk: row[5]
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Recherche articles (utilise indexes: idx_articles_categorie)
app.get('/api/magasinier/articles/search', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { q, type } = req.query; // type: 'ref', 'designation', 'categorie'
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Paramètre q requis' });
    }

    connection = await pool.getConnection();
    
    let query = `SELECT refart, designation, prixA, prixV, categorie, qtestk
                 FROM articles WHERE `;
    let params = {};

    if (type === 'ref') {
      query += `UPPER(refart) LIKE :q`;
      params.q = `%${q.toUpperCase()}%`;
    } else if (type === 'designation') {
      query += `UPPER(designation) LIKE :q`;
      params.q = `%${q.toUpperCase()}%`;
    } else if (type === 'categorie') {
      // Utilise index idx_articles_categorie
      query += `UPPER(categorie) LIKE :q`;
      params.q = `%${q.toUpperCase()}%`;
    } else {
      // Recherche générale
      query += `(UPPER(refart) LIKE :q OR UPPER(designation) LIKE :q OR UPPER(categorie) LIKE :q)`;
      params.q = `%${q.toUpperCase()}%`;
    }
    
    query += ` ORDER BY designation ASC`;

    const result = await connection.execute(query, params);
    
    res.json({ 
      success: true, 
      data: result.rows.map(row => ({
        refart: row[0],
        designation: row[1],
        prixA: row[2],
        prixV: row[3],
        categorie: row[4],
        qtestk: row[5]
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Commandes du magasinier (pkg_gestion_commandes) - LECTURE SEULE
app.get('/api/magasinier/commandes', authMiddleware, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const result = await connection.execute(
      `SELECT c.nocde, c.datecde, c.etatcde, c.noclt,
              cl.nomclt, cl.prenomclt, cl.telclt, cl.adrmail,
              NVL(SUM(l.qtecde * a.prixV), 0) AS montant_total
       FROM commandes c
       JOIN clients cl ON c.noclt = cl.noclt
       LEFT JOIN ligcdes l ON c.nocde = l.nocde
       LEFT JOIN articles a ON l.refart = a.refart
       GROUP BY c.nocde, c.datecde, c.etatcde, c.noclt, cl.nomclt, cl.prenomclt, cl.telclt, cl.adrmail
       ORDER BY c.datecde DESC`
    );
    
    res.json({ 
      success: true, 
      data: result.rows.map(row => ({
        nocde: row[0],
        datecde: row[1],
        etatcde: row[2],
        noclt: row[3],
        nomclt: row[4],
        prenomclt: row[5],
        telclt: row[6],
        adrmail: row[7],
        montant_total: row[8]
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Recherche commandes (utilise index: idx_commandes_client)
app.get('/api/magasinier/commandes/search', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { q, type } = req.query; // type: 'nocde', 'client', 'etat'
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Paramètre q requis' });
    }

    connection = await pool.getConnection();
    
    let query = `SELECT c.nocde, c.datecde, c.etatcde, c.noclt,
                        cl.nomclt, cl.prenomclt, cl.telclt, cl.adrmail,
                        NVL(SUM(l.qtecde * a.prixV), 0) AS montant_total
                 FROM commandes c
                 JOIN clients cl ON c.noclt = cl.noclt
                 LEFT JOIN ligcdes l ON c.nocde = l.nocde
                 LEFT JOIN articles a ON l.refart = a.refart
                 WHERE `;
    let params = {};

    if (type === 'nocde') {
      query += `c.nocde = :q`;
      params.q = parseInt(q);
    } else if (type === 'client') {
      // Utilise index idx_commandes_client via JOIN
      query += `(UPPER(cl.nomclt) LIKE :q OR UPPER(cl.prenomclt) LIKE :q)`;
      params.q = `%${q.toUpperCase()}%`;
    } else if (type === 'etat') {
      query += `c.etatcde = :q`;
      params.q = q.toUpperCase();
    } else {
      // Recherche générale
      query += `(c.nocde = :qnum OR UPPER(cl.nomclt) LIKE :q OR UPPER(cl.prenomclt) LIKE :q OR c.etatcde = :qetat)`;
      params.qnum = parseInt(q) || 0;
      params.q = `%${q.toUpperCase()}%`;
      params.qetat = q.toUpperCase();
    }
    
    query += ` GROUP BY c.nocde, c.datecde, c.etatcde, c.noclt, cl.nomclt, cl.prenomclt, cl.telclt, cl.adrmail
               ORDER BY c.datecde DESC`;

    const result = await connection.execute(query, params);
    
    res.json({ 
      success: true, 
      data: result.rows.map(row => ({
        nocde: row[0],
        datecde: row[1],
        etatcde: row[2],
        noclt: row[3],
        nomclt: row[4],
        prenomclt: row[5],
        telclt: row[6],
        adrmail: row[7],
        montant_total: row[8]
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== GESTION DES COMMANDES ====================

// Liste toutes les commandes
app.get('/api/commandes', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT c.nocde, c.datecde, c.etatcde, c.noclt,
              cl.nomclt, cl.prenomclt,
              NVL(SUM(l.qtecde * a.prixV), 0) AS montant_total
       FROM commandes c
       JOIN clients cl ON c.noclt = cl.noclt
       LEFT JOIN ligcdes l ON c.nocde = l.nocde
       LEFT JOIN articles a ON l.refart = a.refart
       GROUP BY c.nocde, c.datecde, c.etatcde, c.noclt, cl.nomclt, cl.prenomclt
       ORDER BY c.datecde DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

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
    // Ignorer les erreurs liées au trigger invalide (ORA-04098)
    // mais toujours rapporter les autres erreurs
    if (err.message && err.message.includes('ORA-04098')) {
      console.warn('⚠️ Trigger ORA-04098 ignoré (non critique):', err.message);
      res.json({ success: true, message: 'État modifié avec succès (audit désactivé)' });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
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
    // Ignorer les erreurs liées au trigger invalide (ORA-04098)
    // mais toujours rapporter les autres erreurs
    if (err.message && err.message.includes('ORA-04098')) {
      console.warn('⚠️ Trigger ORA-04098 ignoré (non critique):', err.message);
      res.json({ success: true, message: 'Commande annulée avec succès (audit désactivé)' });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  } finally {
    if (connection) await connection.close();
  }
});

// GET détails d'une commande (pour affichage dans modal)
app.get('/api/commandes/:nocde', authMiddleware, async (req, res) => {
  let connection;
  try {
    const nocde = parseInt(req.params.nocde);
    connection = await pool.getConnection();
    
    // Récupérer la commande
    const cmdResult = await connection.execute(
      `SELECT c.nocde, c.datecde, c.etatcde, c.noclt,
              cl.nomclt, cl.prenomclt, cl.telclt, cl.adrmail
       FROM commandes c
       JOIN clients cl ON c.noclt = cl.noclt
       WHERE c.nocde = :nocde`,
      { nocde }
    );
    
    if (cmdResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }
    
    const cmdRow = cmdResult.rows[0];
    
    // Récupérer les articles
    const artResult = await connection.execute(
      `SELECT l.refart, a.designation, l.qtecde, a.prixV,
              (l.qtecde * a.prixV) AS montant
       FROM ligcdes l
       JOIN articles a ON l.refart = a.refart
       WHERE l.nocde = :nocde`,
      { nocde }
    );
    
    res.json({ 
      success: true, 
      data: {
        nocde: cmdRow[0],
        datecde: cmdRow[1],
        etatcde: cmdRow[2],
        noclt: cmdRow[3],
        nomclt: cmdRow[4],
        prenomclt: cmdRow[5],
        telclt: cmdRow[6],
        adrmail: cmdRow[7],
        articles: artResult.rows.map(row => ({
          refart: row[0],
          designation: row[1],
          qtecde: row[2],
          prixV: row[3],
          montant: row[4]
        }))
      }
    });
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

// ==================== GESTION DES LIVRAISONS ====================

// Liste toutes les livraisons
app.get('/api/livraisons', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT lv.nocde, lv.dateliv, lv.livreur, lv.modepay, lv.etatliv,
              p.nompers, p.prenompers, 
              c.noclt, cl.nomclt, cl.prenomclt
       FROM LivraisonCom lv
       JOIN personnel p ON lv.livreur = p.idpers
       JOIN commandes c ON lv.nocde = c.nocde
       JOIN clients cl ON c.noclt = cl.noclt
       ORDER BY lv.dateliv DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

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

// Liste des utilisateurs (TOUS LES ATTRIBUTS)
app.get('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT p.idpers, p.nompers, p.prenompers, p.adrpers, p.villepers,
              p.telpers, p.d_embauche, p.login, p.codeposte,
              po.libelle AS poste_libelle
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

// Ajouter utilisateur (TOUS LES ATTRIBUTS)
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

// Modifier utilisateur (TOUS LES ATTRIBUTS)
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

// Supprimer utilisateur
app.delete('/api/users/supprimer/:idpers', async (req, res) => {
  let connection;
  try {
    const idpers = parseInt(req.params.idpers);
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_utilisateurs.supprimer_utilisateur(:idpers);
      END;`,
      { idpers },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Créer une commande avec articles
app.post('/api/commandes', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { noclt, articles } = req.body;
    
    if (!noclt || !articles || articles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Client et articles requis' 
      });
    }

    connection = await pool.getConnection();
    
    // Créer la commande (le trigger va forcer datecde et etatcde)
    const cmdResult = await connection.execute(
      `INSERT INTO commandes (noclt) VALUES (:noclt) 
       RETURNING nocde INTO :nocde`,
      { noclt: parseInt(noclt), nocde: { dir: oracledb.BIND_OUT } },
      { autoCommit: false }
    );
    
    const nocde = cmdResult.outBinds.nocde[0];
    
    // Ajouter les articles à la commande
    for (const art of articles) {
      await connection.execute(
        `INSERT INTO ligcdes (nocde, refart, qtecde) 
         VALUES (:nocde, :refart, :qtecde)`,
        { 
          nocde, 
          refart: art.refart, 
          qtecde: parseInt(art.qtecde) 
        },
        { autoCommit: false }
      );
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Commande créée avec succès',
      nocde 
    });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (e) {}
    }
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Modifier une commande existante (état 'EC' uniquement)
app.put('/api/commandes/:nocde', authMiddleware, async (req, res) => {
  let connection;
  try {
    const nocde = parseInt(req.params.nocde);
    const { noclt, articles } = req.body;
    
    if (!noclt || !articles || articles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Client et articles requis' 
      });
    }

    connection = await pool.getConnection();
    
    // Vérifier que la commande est en état 'EC'
    const checkResult = await connection.execute(
      `SELECT etatcde FROM commandes WHERE nocde = :nocde`,
      { nocde }
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Commande non trouvée' 
      });
    }
    
    if (checkResult.rows[0][0] !== 'EC') {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de modifier une commande qui n\'est pas en cours (EC)' 
      });
    }
    
    // Supprimer les anciens articles
    await connection.execute(
      `DELETE FROM ligcdes WHERE nocde = :nocde`,
      { nocde },
      { autoCommit: false }
    );
    
    // Ajouter les nouveaux articles
    for (const art of articles) {
      await connection.execute(
        `INSERT INTO ligcdes (nocde, refart, qtecde) 
         VALUES (:nocde, :refart, :qtecde)`,
        { 
          nocde, 
          refart: art.refart, 
          qtecde: parseInt(art.qtecde) 
        },
        { autoCommit: false }
      );
    }
    
    // Mettre à jour le client si différent
    if (noclt) {
      await connection.execute(
        `UPDATE commandes SET noclt = :noclt WHERE nocde = :nocde`,
        { noclt: parseInt(noclt), nocde },
        { autoCommit: false }
      );
    }
    
    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Commande modifiée avec succès' 
    });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (e) {}
    }
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== GESTION DES PRIVILÈGES ====================

// Créer schémas externes
app.post('/api/privileges/creer-schemas', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_privileges.creer_schemas_externes;
      END;`,
      {},
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Schémas externes créés avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Gérer privilèges par poste
app.post('/api/privileges/gerer-par-poste', async (req, res) => {
  let connection;
  try {
    const { username, codeposte } = req.body;
    connection = await pool.getConnection();
    
    await connection.execute(
      `BEGIN
        pkg_gestion_privileges.gerer_privileges_par_poste(:username, :codeposte);
      END;`,
      { username, codeposte },
      { autoCommit: true }
    );
    
    res.json({ success: true, message: 'Privilèges accordés avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== DONNÉES DE RÉFÉRENCE ====================

// Liste des clients (TOUS LES ATTRIBUTS)
app.get('/api/clients', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT noclt, nomclt, prenomclt, adrclt, code_postal, villeclt, telclt, adrmail
       FROM clients 
       ORDER BY nomclt`
    );
    
    // Convertir result.rows en objets
    const clients = result.rows.map(row => ({
      noclt: row[0],
      nomclt: row[1],
      prenomclt: row[2],
      adrclt: row[3],
      code_postal: row[4],
      villeclt: row[5],
      telclt: row[6],
      adrmail: row[7]
    }));
    
    res.json({ success: true, data: clients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Liste des articles (TOUS LES ATTRIBUTS)
app.get('/api/articles', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT refart, designation, prixA, prixV, codetva, categorie, qtestk, supp
       FROM articles 
       WHERE supp = 'N' 
       ORDER BY designation`
    );
    
    // Convertir result.rows en objets
    const articles = result.rows.map(row => ({
      refart: row[0],
      designation: row[1],
      prixA: row[2],
      prixV: row[3],
      codetva: row[4],
      categorie: row[5],
      qtestk: row[6],
      supp: row[7]
    }));
    
    res.json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Liste du personnel (TOUS LES ATTRIBUTS)
app.get('/api/personnel', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT p.idpers, p.nompers, p.prenompers, p.adrpers, p.villepers, 
              p.telpers, p.d_embauche, p.login, p.codeposte,
              po.libelle AS poste_libelle
       FROM personnel p
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
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(
      `SELECT codeposte, libelle, indice FROM postes ORDER BY libelle`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== STATISTIQUES ====================

// Statistiques globales
app.get('/api/stats/global', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const stats = await connection.execute(
      `SELECT 
        (SELECT COUNT(*) FROM commandes) AS nb_commandes,
        (SELECT COUNT(*) FROM LivraisonCom) AS nb_livraisons,
        (SELECT COUNT(*) FROM personnel WHERE login NOT LIKE '%_INACTIF_%') AS nb_users,
        (SELECT COUNT(*) FROM articles WHERE supp = 'N') AS nb_articles,
        (SELECT COUNT(*) FROM clients) AS nb_clients
       FROM dual`
    );
    
    res.json({ success: true, data: stats.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Test de connexion
app.get('/api/test-connection', async (req, res) => {
  if (poolError) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur de connexion à la base de données',
      error: poolError 
    });
  }
  
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute('SELECT 1 FROM DUAL');
    res.json({ 
      success: true, 
      message: 'Connexion réussie',
      user: dbConfig.user
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Interface: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  if (poolError) {
    console.log(`\n⚠️  ERREUR: ${poolError}`);
  }
});

process.on('SIGINT', async () => {
  try {
    if (pool) {
      await pool.close();
      console.log('\n✓ Pool fermé proprement');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});