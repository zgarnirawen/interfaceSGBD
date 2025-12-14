import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, RefreshCw, Plus, Search, Calendar, User, Package } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function ChefLivreurDashboard({ user, onLogout }) {
  const [livraisons, setLivraisons] = useState([]);
  const [commandes, setCommandes] = useState([]); // Commandes PR (prêtes)
  const [personnel, setPersonnel] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterEtat, setFilterEtat] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaires
  const [showAddForm, setShowAddForm] = useState(false);
  const [showModifyForm, setShowModifyForm] = useState(null);
  const [formData, setFormData] = useState({
    nocde: '',
    dateliv: '',
    livreur: '',
    modepay: ''
  });
  const [modifyData, setModifyData] = useState({
    nocde: '',
    nouvelle_date: '',
    nouveau_livreur: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [livRes, cmdRes, persRes] = await Promise.all([
        fetch(`${API_URL}/livraisons`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/commandes`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/personnel`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (livRes.ok) {
        const livData = await livRes.json();
        setLivraisons(livData.data || []);
        
        // Calculer les stats
        const data = livData.data || [];
        setStats({
          total: data.length,
          en_cours: data.filter(l => l.etatliv === 'EC').length,
          en_livraison: data.filter(l => l.etatliv === 'LI').length,
          livrees: data.filter(l => l.etatliv === 'AL').length,
        });
      }

      if (cmdRes.ok) {
        const cmdData = await cmdRes.json();
        // Filtrer seulement les commandes prêtes (PR)
        setCommandes((cmdData.data || []).filter(c => c.etatcde === 'PR'));
      }

      if (persRes.ok) {
        const persData = await persRes.json();
        // Filtrer seulement les livreurs (P003)
        setPersonnel((persData.data || []).filter(p => p.codeposte === 'P003'));
      }

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========== AJOUTER LIVRAISON (pkg_gestion_livraisons) ==========
  const handleAddLivraison = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/livraisons/ajouter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Livraison ajoutée avec succès');
        setShowAddForm(false);
        setFormData({ nocde: '', dateliv: '', livreur: '', modepay: '' });
        fetchData();
      } else {
        alert('Erreur: ' + data.message);
      }
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  // ========== MODIFIER LIVRAISON (pkg_gestion_livraisons) ==========
  const handleModifyLivraison = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/livraisons/modifier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(modifyData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Livraison modifiée avec succès');
        setShowModifyForm(null);
        setModifyData({ nocde: '', nouvelle_date: '', nouveau_livreur: '' });
        fetchData();
      } else {
        alert('Erreur: ' + data.message);
      }
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  // ========== SUPPRIMER LIVRAISON (pkg_gestion_livraisons) ==========
  const handleDeleteLivraison = async (nocde) => {
    if (!window.confirm('Supprimer cette livraison? La commande sera annulée.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/livraisons/supprimer/${nocde}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('Livraison supprimée');
        fetchData();
      } else {
        alert('Erreur: ' + data.message);
      }
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  // ========== CHANGER ÉTAT LIVRAISON ==========
  const updateLivraisonEtat = async (nocde, dateliv, nouvelEtat) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/livraisons/modifier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nocde, dateliv, etatliv: nouvelEtat })
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        alert('Erreur: ' + data.message);
      }
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const livraisonsFiltrees = livraisons.filter(l => {
    const matchEtat = filterEtat === 'tous' || l.etatliv === filterEtat;
    const matchSearch = !searchTerm || 
      l.nocde?.toString().includes(searchTerm) ||
      l.nomclt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.villeclt?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEtat && matchSearch;
  });

  const getEtatBadge = (etat) => {
    const etats = {
      'EC': { label: 'En cours', color: 'yellow' },
      'LI': { label: 'En livraison', color: 'blue' },
      'AL': { label: 'Annulée', color: 'red' }
    };
    return etats[etat] || { label: etat, color: 'gray' };
  };

  const colorMap = {
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Truck size={32} />
              Dashboard Chef Livreur
            </h1>
            <p className="text-orange-100 mt-2">
              Package: pkg_gestion_livraisons • Bienvenue, {user.nompers} {user.prenompers}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-700 hover:bg-red-800 rounded-lg font-semibold transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Cartes Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Livraisons" value={stats?.total || 0} color="orange" loading={loading} />
          <StatCard title="En Cours" value={stats?.en_cours || 0} color="yellow" loading={loading} />
          <StatCard title="En Livraison" value={stats?.en_livraison || 0} color="blue" loading={loading} />
          <StatCard title="Annulées" value={stats?.livrees || 0} color="red" loading={loading} />
        </div>

        {/* Contrôles */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Rafraîchir
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            <Plus size={18} />
            Nouvelle Livraison
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher (N°, client, ville)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <select
            value={filterEtat}
            onChange={(e) => setFilterEtat(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow hover:shadow-md"
          >
            <option value="tous">Tous les états</option>
            <option value="EC">En cours</option>
            <option value="LI">En livraison</option>
            <option value="AL">Annulée</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Tableau Livraisons */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">
              Livraisons ({livraisonsFiltrees.length})
            </h2>
          </div>
          
          {livraisonsFiltrees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Truck size={32} className="mx-auto mb-4 opacity-50" />
              <p>Aucune livraison trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">N° Cmd</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Client</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Adresse</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Date Livraison</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Livreur</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">État</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {livraisonsFiltrees.map((livraison) => {
                    const etatInfo = getEtatBadge(livraison.etatliv);
                    const dateStr = new Date(livraison.dateliv).toISOString().split('T')[0];
                    return (
                      <tr key={`${livraison.nocde}-${livraison.dateliv}`} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-blue-600">#{livraison.nocde}</td>
                        <td className="px-6 py-4 text-gray-900">{livraison.nomclt}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {livraison.adrclt}, {livraison.villeclt}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(livraison.dateliv).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {livraison.livreur_prenom} {livraison.livreur_nom}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colorMap[etatInfo.color]}`}>
                            {etatInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateLivraisonEtat(livraison.nocde, dateStr, 'LI')}
                              disabled={livraison.etatliv === 'LI' || livraison.etatliv === 'AL'}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              En livraison
                            </button>
                            <button
                              onClick={() => {
                                setShowModifyForm(livraison.nocde);
                                setModifyData({
                                  nocde: livraison.nocde,
                                  nouvelle_date: '',
                                  nouveau_livreur: ''
                                });
                              }}
                              className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteLivraison(livraison.nocde)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Ajout */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-2xl font-bold mb-4">Nouvelle Livraison</h3>
              <form onSubmit={handleAddLivraison}>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Commande (PR) *</label>
                  <select
                    value={formData.nocde}
                    onChange={(e) => setFormData({...formData, nocde: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {commandes.map(c => (
                      <option key={c.nocde} value={c.nocde}>
                        #{c.nocde} - {c.nomclt} {c.prenomclt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Date Livraison *</label>
                  <input
                    type="date"
                    value={formData.dateliv}
                    onChange={(e) => setFormData({...formData, dateliv: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Livreur *</label>
                  <select
                    value={formData.livreur}
                    onChange={(e) => setFormData({...formData, livreur: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {personnel.map(p => (
                      <option key={p.idpers} value={p.idpers}>
                        {p.nompers} {p.prenompers}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Mode Paiement *</label>
                  <select
                    value={formData.modepay}
                    onChange={(e) => setFormData({...formData, modepay: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="avant_livraison">Avant livraison</option>
                    <option value="apres_livraison">Après livraison</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Créer
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Modification */}
        {showModifyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-2xl font-bold mb-4">Modifier Livraison #{showModifyForm}</h3>
              <form onSubmit={handleModifyLivraison}>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Nouvelle Date (optionnel)</label>
                  <input
                    type="date"
                    value={modifyData.nouvelle_date}
                    onChange={(e) => setModifyData({...modifyData, nouvelle_date: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-sm text-gray-500 mt-1">Modifiable avant 9h (matin) ou 14h (après-midi)</p>
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold">Nouveau Livreur (optionnel)</label>
                  <select
                    value={modifyData.nouveau_livreur}
                    onChange={(e) => setModifyData({...modifyData, nouveau_livreur: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Ne pas modifier</option>
                    {personnel.map(p => (
                      <option key={p.idpers} value={p.idpers}>
                        {p.nompers} {p.prenompers}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Modifier
                  </button>
                  <button type="button" onClick={() => setShowModifyForm(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color, loading }) {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-semibold opacity-70 mb-2">{title}</p>
      <p className="text-3xl font-bold">{loading ? '...' : value}</p>
    </div>
  );
}

export default ChefLivreurDashboard;