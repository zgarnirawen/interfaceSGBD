import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

function ChefLivreurDashboard({ user, onLogout }) {
  const [livraisons, setLivraisons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterEtat, setFilterEtat] = useState('tous');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/chef-livreur/livraisons', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setLivraisons(data.data);
        // Calculer les stats
        const stats = {
          total: data.data.length,
          en_attente: data.data.filter(l => l.etatcde === 'PR').length,
          en_cours: data.data.filter(l => l.etatcde === 'LI').length,
          livrees: data.data.filter(l => l.etatcde === 'SO').length,
        };
        setStats(stats);
      } else {
        setError(data.message);
      }
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

  const updateLivraisonEtat = async (nocde, nouvelEtat) => {
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
        fetchData();
      } else {
        alert('Erreur: ' + data.message);
      }
    } catch (err) {
      alert('Erreur serveur: ' + err.message);
    }
  };

  const livraisonsFiltrees = filterEtat === 'tous' 
    ? livraisons 
    : livraisons.filter(l => l.etatcde === filterEtat);

  const getEtatBadge = (etat) => {
    const etats = {
      'EC': { label: 'En création', color: 'gray' },
      'PR': { label: 'Prête', color: 'yellow' },
      'LI': { label: 'En livraison', color: 'blue' },
      'SO': { label: 'Livrée', color: 'green' },
      'AN': { label: 'Annulée', color: 'red' },
      'AL': { label: 'En alerte', color: 'orange' }
    };
    return etats[etat] || { label: etat, color: 'gray' };
  };

  const colorMap = {
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800'
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
            <p className="text-orange-100 mt-2">Bienvenue, {user.nompers} {user.prenompers}</p>
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
          <StatCard title="En Attente" value={stats?.en_attente || 0} color="yellow" loading={loading} />
          <StatCard title="En Cours" value={stats?.en_cours || 0} color="blue" loading={loading} />
          <StatCard title="Livrées" value={stats?.livrees || 0} color="green" loading={loading} />
        </div>

        {/* Contrôles */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Rafraîchir
          </button>

          <select
            value={filterEtat}
            onChange={(e) => setFilterEtat(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow hover:shadow-md"
          >
            <option value="tous">Tous les états</option>
            <option value="PR">Prêtes à livrer</option>
            <option value="LI">En cours de livraison</option>
            <option value="SO">Livrées</option>
            <option value="AL">En alerte</option>
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
            <h2 className="text-lg font-bold text-gray-900">Livraisons ({livraisonsFiltrees.length})</h2>
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
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">N° Commande</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Client</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Adresse</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Ville</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">État</th>
                    <th className="px-6 py-3 text-left text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {livraisonsFiltrees.map((livraison) => {
                    const etatInfo = getEtatBadge(livraison.etatcde);
                    return (
                      <tr key={livraison.nocde} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-blue-600">#{livraison.nocde}</td>
                        <td className="px-6 py-4 text-gray-900">{livraison.nomclt}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{livraison.adrclt}</td>
                        <td className="px-6 py-4 text-gray-600">{livraison.villeclt}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colorMap[etatInfo.color]}`}>
                            {etatInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => updateLivraisonEtat(livraison.nocde, 'LI')}
                            disabled={livraison.etatcde === 'LI' || livraison.etatcde === 'SO'}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mr-2"
                          >
                            En cours
                          </button>
                          <button
                            onClick={() => updateLivraisonEtat(livraison.nocde, 'SO')}
                            disabled={livraison.etatcde !== 'LI'}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Livré
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-semibold opacity-70 mb-2">{title}</p>
      <p className="text-3xl font-bold">{loading ? '...' : value}</p>
    </div>
  );
}

export default ChefLivreurDashboard;
