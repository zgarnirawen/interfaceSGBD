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
    res.json({ success: true, data: result.rows });
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
    res.json({ success: true, data: result.rows });
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