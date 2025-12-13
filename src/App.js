import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import ChefLivreurDashboard from './ChefLivreurDashboard';
import MagasinierDashboard from './MagasinierDashboard';
import TriggerManager from './TriggerManager';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTriggerManager, setShowTriggerManager] = useState(false);

  // Vérifier si l'utilisateur est connecté au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si pas connecté, afficher le login
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Afficher le gestionnaire de triggers si demandé
  if (showTriggerManager) {
    return (
      <div>
        <button 
          onClick={() => setShowTriggerManager(false)}
          className="fixed top-4 left-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
        >
          ← Retour aux dashboards
        </button>
        <TriggerManager />
      </div>
    );
  }

  // Afficher le dashboard selon le rôle
  // P002 = Admin
  if (user.codeposte === 'P002') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // P003 = Chef Livreur
  if (user.codeposte === 'P003') {
    return <ChefLivreurDashboard user={user} onLogout={handleLogout} />;
  }

  // P001 = Magasinier
  if (user.codeposte === 'P001') {
    return <MagasinierDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Rôle non reconnu</h1>
        <p className="text-gray-600 mb-6">Veuillez contacter l'administrateur</p>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default App;
