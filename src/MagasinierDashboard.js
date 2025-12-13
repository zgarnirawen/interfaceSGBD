import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, RefreshCw, TrendingDown, ShoppingCart, Eye, Edit, Trash2, Search } from 'lucide-react';

function MagasinierDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('articles'); // 'articles' ou 'commandes'
  
  // State Articles
  const [articles, setArticles] = useState([]);
  const [searchArticle, setSearchArticle] = useState('');
  const [searchTypeArticle, setSearchTypeArticle] = useState('tous');
  const [stats, setStats] = useState(null);
  const [filterAlerte, setFilterAlerte] = useState('tous');
  
  // State Commandes
  const [commandes, setCommandes] = useState([]);
  const [searchCommande, setSearchCommande] = useState('');
  const [searchTypeCommande, setSearchTypeCommande] = useState('tous');
  const [commandeDetail, setCommandeDetail] = useState(null);
  const [filterEtat, setFilterEtat] = useState('tous');
  const [showFormCommande, setShowFormCommande] = useState(false);
  const [formCommande, setFormCommande] = useState({
    noclt: '',
    articles: [{ refart: '', qtecde: '' }]
  });
  const [editingCommande, setEditingCommande] = useState(null);
  const [clients, setClients] = useState([]);
  
  // State Global
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Charger les articles
  const fetchArticles = async (search = '', searchType = 'tous') => {
    try {
      setLoading(true);
      let url = 'http://localhost:3001/api/magasinier/articles';
      
      if (search && search.length >= 2) {
        url = `http://localhost:3001/api/magasinier/articles/search?q=${encodeURIComponent(search)}`;
        if (searchType !== 'tous') {
          url += `&type=${searchType}`;
        }
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
        const stats = {
          total_articles: data.data.length,
          stock_faible: data.data.filter(a => a.qtestk < 50).length,
          stock_critique: data.data.filter(a => a.qtestk < 10).length,
          stock_total: data.data.reduce((sum, a) => sum + a.qtestk, 0),
          valeur_stock: data.data.reduce((sum, a) => sum + (a.qtestk * a.prixA), 0)
        };
        setStats(stats);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Erreur chargement articles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger les clients
  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/clients', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setClients(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement clients:', err);
    }
  };

  // Créer une commande
  const creerCommande = async (e) => {
    e.preventDefault();
    if (!formCommande.noclt || formCommande.articles.some(a => !a.refart || !a.qtecde)) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          noclt: parseInt(formCommande.noclt),
          articles: formCommande.articles.map(a => ({
            refart: a.refart,
            qtecde: parseInt(a.qtecde)
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Commande créée avec succès');
        setShowFormCommande(false);
        setFormCommande({ noclt: '', articles: [{ refart: '', qtecde: '' }] });
        fetchCommandes(searchCommande, searchTypeCommande);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Erreur lors de la création');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Modifier une commande
  const modifierCommande = async (e) => {
    e.preventDefault();
    if (!editingCommande.noclt || editingCommande.articles.some(a => !a.refart || !a.qtecde)) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/commandes/${editingCommande.nocde}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          noclt: parseInt(editingCommande.noclt),
          articles: editingCommande.articles.map(a => ({
            refart: a.refart,
            qtecde: parseInt(a.qtecde)
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Commande modifiée avec succès');
        setEditingCommande(null);
        setCommandeDetail(null);
        fetchCommandes(searchCommande, searchTypeCommande);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Charger les clients à l'ouverture du formulaire
  const openFormCommande = () => {
    fetchClients();
    setShowFormCommande(true);
  };

  // Ouvrir le formulaire de modification
  const openEditCommande = (cmd) => {
    fetchClients();
    setEditingCommande({
      nocde: cmd.nocde,
      noclt: cmd.noclt,
      articles: cmd.articles || [{ refart: '', qtecde: '' }]
    });
  };

  // Charger les commandes (pkg_gestion_commandes)
  const fetchCommandes = async (search = '', searchType = 'tous') => {
    try {
      setLoading(true);
      let url = 'http://localhost:3001/api/magasinier/commandes';
      
      if (search && search.length >= 1) {
        url = `http://localhost:3001/api/magasinier/commandes/search?q=${encodeURIComponent(search)}`;
        if (searchType !== 'tous') {
          url += `&type=${searchType}`;
        }
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setCommandes(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Erreur chargement commandes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Voir détails d'une commande
  const voirCommande = async (nocde) => {
    try {
      const response = await fetch(`http://localhost:3001/api/commandes/${nocde}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setCommandeDetail(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Modifier l'état de la commande (fonction pkg_gestion_commandes)
  const modifierEtatCommande = async (nocde, nouvelEtat) => {
    try {
      const response = await fetch('http://localhost:3001/api/commandes/modifier-etat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nocde, nouvel_etat: nouvelEtat })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('État de la commande modifié avec succès');
        setCommandeDetail(null);
        fetchCommandes(searchCommande, searchTypeCommande);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Annuler une commande (fonction pkg_gestion_commandes)
  const annulerCommande = async (nocde) => {
    if (window.confirm('Êtes-vous sûr d\'annuler cette commande?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/commandes/annuler/${nocde}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) {
          setSuccess('Commande annulée avec succès');
          setCommandeDetail(null);
          fetchCommandes(searchCommande, searchTypeCommande);
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Gestion de la recherche articles
  const handleSearchArticle = (value, type) => {
    setSearchArticle(value);
    setSearchTypeArticle(type);
    if (value.length >= 2 || value === '') {
      fetchArticles(value, type);
    }
  };

  // Gestion de la recherche commandes
  const handleSearchCommande = (value, type) => {
    setSearchCommande(value);
    setSearchTypeCommande(type);
    if (value.length >= 1 || value === '') {
      fetchCommandes(value, type);
    }
  };

  useEffect(() => {
    if (tab === 'articles') {
      fetchArticles(searchArticle, searchTypeArticle);
    } else {
      fetchCommandes(searchCommande, searchTypeCommande);
    }
    const interval = setInterval(() => {
      if (tab === 'articles') fetchArticles(searchArticle, searchTypeArticle);
      else fetchCommandes(searchCommande, searchTypeCommande);
    }, 30000);
    return () => clearInterval(interval);
  }, [tab]);

  const getArticlesFiltres = () => {
    switch(filterAlerte) {
      case 'critique':
        return articles.filter(a => a.qtestk < 10);
      case 'faible':
        return articles.filter(a => a.qtestk >= 10 && a.qtestk < 50);
      default:
        return articles;
    }
  };

  const getCommandesFiltres = () => {
    if (filterEtat === 'tous') return commandes;
    return commandes.filter(c => c.etatcde === filterEtat);
  };

  const articlesFiltres = getArticlesFiltres();
  const commandesFiltres = getCommandesFiltres();

  const getStockBadge = (qty) => {
    if (qty < 10) return { label: 'Critique', color: 'red' };
    if (qty < 50) return { label: 'Faible', color: 'orange' };
    return { label: 'Normal', color: 'green' };
  };

  const getEtatBadge = (etat) => {
    const etats = {
      'EC': { label: 'En Cours', color: 'blue' },
      'PR': { label: 'Prête', color: 'green' },
      'LI': { label: 'Livrée', color: 'purple' },
      'SO': { label: 'Soldée', color: 'gray' },
      'AN': { label: 'Annulée', color: 'red' }
    };
    return etats[etat] || { label: etat, color: 'gray' };
  };

  const colorMap = {
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const getTransitionsValides = (etatActuel) => {
    const transitions = {
      'EC': ['PR', 'AN'],
      'PR': ['LI', 'AN'],
      'LI': ['SO'],
      'SO': [],
      'AN': []
    };
    return transitions[etatActuel] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Package size={32} />
              Dashboard Magasinier - pkg_gestion_commandes
            </h1>
            <p className="text-yellow-100 mt-2">Bienvenue, {user.nompers} {user.prenompers}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Onglets */}
        <div className="flex gap-2 mb-8 border-b border-gray-300">
          <button
            onClick={() => setTab('articles')}
            className={`px-6 py-3 font-semibold transition ${
              tab === 'articles'
                ? 'border-b-4 border-yellow-600 text-yellow-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package size={18} className="inline mr-2" />
            Articles (Gestion Stock)
          </button>
          <button
            onClick={() => setTab('commandes')}
            className={`px-6 py-3 font-semibold transition ${
              tab === 'commandes'
                ? 'border-b-4 border-yellow-600 text-yellow-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart size={18} className="inline mr-2" />
            Commandes (pkg_gestion_commandes)
          </button>
        </div>

        {/* Messages d'erreur et succès */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <span className="text-green-700">✅ {success}</span>
          </div>
        )}

        {/* ONGLET ARTICLES */}
        {tab === 'articles' && (
          <>
            {/* Cartes Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Articles" value={stats?.total_articles || 0} icon="📦" color="blue" loading={loading} />
              <StatCard title="Stock Total" value={stats?.stock_total || 0} icon="📊" color="green" loading={loading} />
              <StatCard title="Stock Faible" value={stats?.stock_faible || 0} icon="⚠️" color="orange" loading={loading} />
              <StatCard title="Stock Critique" value={stats?.stock_critique || 0} icon="🚨" color="red" loading={loading} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm font-semibold mb-2">Valeur totale du stock</p>
              <p className="text-4xl font-bold text-yellow-600">{loading ? '...' : `${stats?.valeur_stock?.toFixed(2) || 0} DT`}</p>
            </div>

            <div className="mb-6 flex flex-col lg:flex-row gap-4">
              <button
                onClick={() => fetchArticles(searchArticle, searchTypeArticle)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Rafraîchir
              </button>

              {/* Barre de recherche articles - Utilise indexes */}
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  placeholder="Rechercher article (min 2 caractères)..."
                  value={searchArticle}
                  onChange={(e) => handleSearchArticle(e.target.value, searchTypeArticle)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <select
                  value={searchTypeArticle}
                  onChange={(e) => handleSearchArticle(searchArticle, e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow"
                  title="Type de recherche (utilise indexes)"
                >
                  <option value="tous">Tous les champs</option>
                  <option value="ref">Par Référence</option>
                  <option value="designation">Par Désignation</option>
                  <option value="categorie">Par Catégorie (index)</option>
                </select>
              </div>

              <select
                value={filterAlerte}
                onChange={(e) => setFilterAlerte(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow"
              >
                <option value="tous">Tous les articles</option>
                <option value="faible">Stock faible (&lt;50)</option>
                <option value="critique">Stock critique (&lt;10)</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Inventaire ({articlesFiltres.length})</h2>
              </div>
              {articlesFiltres.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Package size={32} className="mx-auto mb-4 opacity-50" />
                  <p>Aucun article trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">Ref</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">Désignation</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">Catégorie</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">Stock</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">État</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">Prix Achat</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">Valeur Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articlesFiltres.map((article) => {
                        const stockInfo = getStockBadge(article.qtestk);
                        const valeurStock = (article.qtestk * article.prixA).toFixed(2);
                        return (
                          <tr key={article.refart} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-bold text-blue-600">{article.refart}</td>
                            <td className="px-6 py-4 text-gray-900">{article.designation}</td>
                            <td className="px-6 py-4 text-gray-600">{article.categorie}</td>
                            <td className="px-6 py-4 text-gray-900 font-semibold">{article.qtestk}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colorMap[stockInfo.color]}`}>
                                {stockInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900">{article.prixA.toFixed(2)} DT</td>
                            <td className="px-6 py-4 text-gray-900 font-semibold">{valeurStock} DT</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ONGLET COMMANDES - pkg_gestion_commandes */}
        {tab === 'commandes' && (
          <>
            <div className="mb-6 flex flex-col lg:flex-row gap-4">
              <button
                onClick={() => fetchCommandes(searchCommande, searchTypeCommande)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Rafraîchir
              </button>

              <button
                onClick={openFormCommande}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
              >
                <Edit size={18} />
                Créer une commande
              </button>

              {/* Barre de recherche commandes - Utilise indexes */}
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  placeholder="Rechercher commande (N° ou Client)..."
                  value={searchCommande}
                  onChange={(e) => handleSearchCommande(e.target.value, searchTypeCommande)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <select
                  value={searchTypeCommande}
                  onChange={(e) => handleSearchCommande(searchCommande, e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow"
                  title="Type de recherche (utilise indexes)"
                >
                  <option value="tous">Tous les champs</option>
                  <option value="nocde">Par N° Commande</option>
                  <option value="client">Par Client (index)</option>
                  <option value="etat">Par État</option>
                </select>
              </div>

              <select
                value={filterEtat}
                onChange={(e) => setFilterEtat(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow"
              >
                <option value="tous">Tous les états</option>
                <option value="EC">En Cours</option>
                <option value="PR">Prête</option>
                <option value="LI">Livrée</option>
                <option value="SO">Soldée</option>
                <option value="AN">Annulée</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Commandes ({commandesFiltres.length})</h2>
                <p className="text-sm text-gray-600 mt-1">Gestion avec procédures du package pkg_gestion_commandes</p>
              </div>
              {commandesFiltres.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingCart size={32} className="mx-auto mb-4 opacity-50" />
                  <p>Aucune commande trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b-2 border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">N°</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">Client</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">Date</th>
                        <th className="px-6 py-3 text-left text-gray-900 font-semibold">État</th>
                        <th className="px-6 py-3 text-center text-gray-900 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commandesFiltres.map((cmd) => {
                        const etatInfo = getEtatBadge(cmd.etatcde);
                        return (
                          <tr key={cmd.nocde} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-bold text-blue-600">#{cmd.nocde}</td>
                            <td className="px-6 py-4 text-gray-900">{cmd.nomclt}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(cmd.datecde).toLocaleDateString('fr-FR')}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colorMap[etatInfo.color]}`}>
                                {etatInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center flex gap-2 justify-center">
                              <button
                                onClick={() => voirCommande(cmd.nocde)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Voir détails"
                              >
                                <Eye size={18} />
                              </button>
                              {cmd.etatcde === 'EC' && (
                                <button
                                  onClick={() => openEditCommande(cmd)}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
                                  title="Modifier commande"
                                >
                                  <Edit size={18} />
                                </button>
                              )}
                              {getTransitionsValides(cmd.etatcde).length > 0 && (
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) modifierEtatCommande(cmd.nocde, e.target.value);
                                    e.target.value = '';
                                  }}
                                  className="px-2 py-1 text-sm border border-green-300 rounded cursor-pointer"
                                  defaultValue=""
                                >
                                  <option value="">Changer état...</option>
                                  {getTransitionsValides(cmd.etatcde).map(etat => (
                                    <option key={etat} value={etat}>
                                      → {getEtatBadge(etat).label}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {(cmd.etatcde === 'EC' || cmd.etatcde === 'PR') && (
                                <button
                                  onClick={() => annulerCommande(cmd.nocde)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                  title="Annuler"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal détail commande */}
            {commandeDetail && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
                  <h3 className="text-2xl font-bold mb-4">Commande N°{commandeDetail.nocde}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-600 text-sm">Client</p>
                      <p className="font-semibold">{commandeDetail.nomclt}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Date</p>
                      <p className="font-semibold">{new Date(commandeDetail.datecde).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">État actuel</p>
                      <p className="font-semibold">{getEtatBadge(commandeDetail.etatcde).label}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Téléphone</p>
                      <p className="font-semibold">{commandeDetail.telclt}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-bold mb-3">Articles commandés</h4>
                    {commandeDetail.articles?.length > 0 ? (
                      <div className="space-y-2">
                        {commandeDetail.articles.map((art) => (
                          <div key={art.refart} className="flex justify-between text-sm border-b pb-2">
                            <span>{art.designation} ({art.refart})</span>
                            <span>x {art.qtecde} = {art.montant} DT</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Aucun article</p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    {commandeDetail.etatcde === 'EC' && (
                      <button
                        onClick={() => {
                          openEditCommande(commandeDetail);
                          setCommandeDetail(null);
                        }}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                      >
                        Modifier
                      </button>
                    )}
                    {getTransitionsValides(commandeDetail.etatcde).length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) modifierEtatCommande(commandeDetail.nocde, e.target.value);
                        }}
                        className="flex-1 px-4 py-2 border border-green-300 rounded"
                      >
                        <option value="">Modifier l'état...</option>
                        {getTransitionsValides(commandeDetail.etatcde).map(etat => (
                          <option key={etat} value={etat}>
                            {getEtatBadge(etat).label}
                          </option>
                        ))}
                      </select>
                    )}
                    {(commandeDetail.etatcde === 'EC' || commandeDetail.etatcde === 'PR') && (
                      <button
                        onClick={() => annulerCommande(commandeDetail.nocde)}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Annuler la commande
                      </button>
                    )}
                    <button
                      onClick={() => setCommandeDetail(null)}
                      className="px-6 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal création/modification commande */}
            {(showFormCommande || editingCommande) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 my-8">
                  <h3 className="text-2xl font-bold mb-6">
                    {editingCommande ? `Modifier Commande N°${editingCommande.nocde}` : 'Créer une nouvelle commande'}
                  </h3>

                  <form onSubmit={editingCommande ? modifierCommande : creerCommande}>
                    {/* Sélection client */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Client <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={editingCommande ? editingCommande.noclt : formCommande.noclt}
                        onChange={(e) => {
                          if (editingCommande) {
                            setEditingCommande({ ...editingCommande, noclt: e.target.value });
                          } else {
                            setFormCommande({ ...formCommande, noclt: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">-- Sélectionner un client --</option>
                        {clients.map((client) => (
                          <option key={client.noclt} value={client.noclt}>
                            {client.nomclt} {client.prenomclt} ({client.telclt})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Articles */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Articles <span className="text-red-600">*</span>
                      </label>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(editingCommande ? editingCommande.articles : formCommande.articles).map((article, idx) => (
                          <div key={idx} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Référence article (ex: A001)"
                                value={article.refart}
                                onChange={(e) => {
                                  const newArticles = [...(editingCommande ? editingCommande.articles : formCommande.articles)];
                                  newArticles[idx].refart = e.target.value;
                                  if (editingCommande) {
                                    setEditingCommande({ ...editingCommande, articles: newArticles });
                                  } else {
                                    setFormCommande({ ...formCommande, articles: newArticles });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                              />
                            </div>
                            <div className="w-24">
                              <input
                                type="number"
                                placeholder="Quantité"
                                min="1"
                                value={article.qtecde}
                                onChange={(e) => {
                                  const newArticles = [...(editingCommande ? editingCommande.articles : formCommande.articles)];
                                  newArticles[idx].qtecde = e.target.value;
                                  if (editingCommande) {
                                    setEditingCommande({ ...editingCommande, articles: newArticles });
                                  } else {
                                    setFormCommande({ ...formCommande, articles: newArticles });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                              />
                            </div>
                            {(editingCommande ? editingCommande.articles : formCommande.articles).length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newArticles = (editingCommande ? editingCommande.articles : formCommande.articles).filter((_, i) => i !== idx);
                                  if (editingCommande) {
                                    setEditingCommande({ ...editingCommande, articles: newArticles });
                                  } else {
                                    setFormCommande({ ...formCommande, articles: newArticles });
                                  }
                                }}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (editingCommande) {
                            setEditingCommande({
                              ...editingCommande,
                              articles: [...editingCommande.articles, { refart: '', qtecde: '' }]
                            });
                          } else {
                            setFormCommande({
                              ...formCommande,
                              articles: [...formCommande.articles, { refart: '', qtecde: '' }]
                            });
                          }
                        }}
                        className="mt-3 px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-sm font-semibold"
                      >
                        + Ajouter un article
                      </button>
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-3 pt-6 border-t">
                      <button
                        type="submit"
                        className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        {editingCommande ? 'Modifier la commande' : 'Créer la commande'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowFormCommande(false);
                          setEditingCommande(null);
                          setFormCommande({ noclt: '', articles: [{ refart: '', qtecde: '' }] });
                        }}
                        className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, loading }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold opacity-70 mb-2">{title}</p>
          <p className="text-3xl font-bold">{loading ? '...' : value}</p>
        </div>
        <div className="text-4xl opacity-30">{icon}</div>
      </div>
    </div>
  );
}

export default MagasinierDashboard;
