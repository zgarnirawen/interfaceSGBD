import React, { useState, useEffect } from 'react';
import { BarChart3, Package, TrendingUp, Users, AlertCircle, RefreshCw } from 'lucide-react';

function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
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
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Rafraîchir chaque 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 size={32} />
              Dashboard Administrateur
            </h1>
            <p className="text-blue-100 mt-2">Bienvenue, {user.nompers} {user.prenompers}</p>
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
        {/* Bouton Rafraîchir */}
        <button
          onClick={fetchStats}
          disabled={loading}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Rafraîchir
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Commandes */}
          <StatCard
            title="Total Commandes"
            value={stats?.total_commandes || 0}
            icon={<Package size={24} />}
            color="blue"
            loading={loading}
          />

          {/* Total Clients */}
          <StatCard
            title="Total Clients"
            value={stats?.total_clients || 0}
            icon={<Users size={24} />}
            color="green"
            loading={loading}
          />

          {/* Chiffre d'Affaires */}
          <StatCard
            title="Chiffre d'Affaires"
            value={stats?.chiffre_affaires ? `${stats.chiffre_affaires.toFixed(2)} DT` : '0 DT'}
            icon={<TrendingUp size={24} />}
            color="purple"
            loading={loading}
          />

          {/* Personnel */}
          <StatCard
            title="Effectif"
            value={stats?.total_personnel || 0}
            icon={<Users size={24} />}
            color="orange"
            loading={loading}
          />
        </div>

        {/* Tableau de répartition des commandes */}
        {stats?.commandes_par_etat && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition des Commandes par État</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.commandes_par_etat.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600 text-sm font-semibold mb-2">État: {item.etat}</p>
                  <p className="text-2xl font-bold text-blue-600">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tableau Personnel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Personnel par Poste</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-gray-900 font-semibold">Poste</th>
                  <th className="px-4 py-3 text-left text-gray-900 font-semibold">Nombre</th>
                </tr>
              </thead>
              <tbody>
                {stats?.personnel_par_poste?.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{item.libelle}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-semibold">
                        {item.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, loading }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold opacity-70 mb-2">{title}</p>
          <p className="text-3xl font-bold">
            {loading ? '...' : value}
          </p>
        </div>
        <div className="opacity-20">{icon}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
