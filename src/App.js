// src/App.js
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Package, Truck, Users, BarChart3, Plus, Trash2, Search, Eye } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('commandes');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center gap-2`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Gestion Oracle - Interface de Test</h1>
          <p className="text-blue-100 text-sm">Tester tous les packages, triggers et vues</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto">
            <TabButton 
              active={activeTab === 'commandes'} 
              onClick={() => setActiveTab('commandes')}
              icon={<Package size={20} />}
              label="Commandes"
            />
            <TabButton 
              active={activeTab === 'livraisons'} 
              onClick={() => setActiveTab('livraisons')}
              icon={<Truck size={20} />}
              label="Livraisons"
            />
            <TabButton 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')}
              icon={<Users size={20} />}
              label="Utilisateurs"
            />
            <TabButton 
              active={activeTab === 'stats'} 
              onClick={() => setActiveTab('stats')}
              icon={<BarChart3 size={20} />}
              label="Statistiques"
            />
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'commandes' && <CommandesSection showNotification={showNotification} />}
          {activeTab === 'livraisons' && <LivraisonsSection showNotification={showNotification} />}
          {activeTab === 'users' && <UsersSection showNotification={showNotification} />}
          {activeTab === 'stats' && <StatsSection showNotification={showNotification} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
        active 
          ? 'border-blue-600 text-blue-600 bg-blue-50' 
          : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function CommandesSection({ showNotification }) {
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [formData, setFormData] = useState({ noclt: '', refart: '', qtecde: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cmdRes, clRes, artRes] = await Promise.all([
        fetch(`${API_URL}/commandes`),
        fetch(`${API_URL}/clients`),
        fetch(`${API_URL}/articles`)
      ]);
      const [cmdData, clData, artData] = await Promise.all([
        cmdRes.json(), clRes.json(), artRes.json()
      ]);
      if (cmdData.success) setCommandes(cmdData.data);
      if (clData.success) setClients(clData.data);
      if (artData.success) setArticles(artData.data);
    } catch (err) {
      showNotification('Erreur chargement données', 'error');
    }
  };

  const handleAddCommande = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/commandes/ajouter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Commande ajoutée');
        setShowAddForm(false);
        setFormData({ noclt: '', refart: '', qtecde: '' });
        loadData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Commandes</h2>
          <p className="text-sm text-gray-500">pkg_gestion_commandes</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouvelle
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCommande} className="bg-blue-50 p-4 rounded-lg space-y-3 border-2 border-blue-200">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <select
                value={formData.noclt}
                onChange={(e) => setFormData({...formData, noclt: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Sélectionner...</option>
                {clients.map(cl => (
                  <option key={cl[0]} value={cl[0]}>{cl[1]} {cl[2]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Article</label>
              <select
                value={formData.refart}
                onChange={(e) => setFormData({...formData, refart: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Sélectionner...</option>
                {articles.map(art => (
                  <option key={art[0]} value={art[0]}>{art[1]} (Stock: {art[6]})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantité</label>
              <input
                type="number"
                value={formData.qtecde}
                onChange={(e) => setFormData({...formData, qtecde: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ajouter</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Annuler</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">N°</th>
              <th className="px-4 py-2 text-left font-semibold">Date</th>
              <th className="px-4 py-2 text-left font-semibold">Client</th>
              <th className="px-4 py-2 text-left font-semibold">Montant</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((cmd, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">#{cmd[0]}</td>
                <td className="px-4 py-3">{new Date(cmd[1]).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">{cmd[4]} {cmd[5]}</td>
                <td className="px-4 py-3">{cmd[6] ? `${cmd[6]}€` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LivraisonsSection({ showNotification }) {
  const [livraisons, setLivraisons] = useState([]);

  useEffect(() => {
    loadLivraisons();
  }, []);

  const loadLivraisons = async () => {
    try {
      const res = await fetch(`${API_URL}/livraisons`);
      const data = await res.json();
      if (data.success) setLivraisons(data.data);
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Livraisons</h2>
        <p className="text-sm text-gray-500">pkg_gestion_livraisons</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">N°</th>
              <th className="px-4 py-2 text-left font-semibold">Date</th>
              <th className="px-4 py-2 text-left font-semibold">État</th>
              <th className="px-4 py-2 text-left font-semibold">Client</th>
            </tr>
          </thead>
          <tbody>
            {livraisons.map((liv, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">#{liv[0]}</td>
                <td className="px-4 py-3">{new Date(liv[1]).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">{liv[4]}</td>
                <td className="px-4 py-3">{liv[8]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersSection({ showNotification }) {
  const [users, setUsers] = useState([]);
  const [postes, setPostes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nompers: '', prenompers: '', telpers: '', login: '', motP: '', codeposte: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usRes, psRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/postes`)
      ]);
      const [usData, psData] = await Promise.all([usRes.json(), psRes.json()]);
      if (usData.success) setUsers(usData.data);
      if (psData.success) setPostes(psData.data);
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users/ajouter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Utilisateur créé');
        setShowAddForm(false);
        setFormData({ nompers: '', prenompers: '', telpers: '', login: '', motP: '', codeposte: '' });
        loadData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Utilisateurs</h2>
          <p className="text-sm text-gray-500">pkg_gestion_utilisateurs</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouvel User
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddUser} className="bg-blue-50 p-4 rounded-lg space-y-3 border-2 border-blue-200">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Nom" value={formData.nompers} onChange={(e) => setFormData({...formData, nompers: e.target.value})} className="px-3 py-2 border rounded" required />
            <input type="text" placeholder="Prénom" value={formData.prenompers} onChange={(e) => setFormData({...formData, prenompers: e.target.value})} className="px-3 py-2 border rounded" required />
            <input type="text" placeholder="Téléphone" value={formData.telpers} onChange={(e) => setFormData({...formData, telpers: e.target.value})} className="px-3 py-2 border rounded" required />
            <input type="text" placeholder="Login" value={formData.login} onChange={(e) => setFormData({...formData, login: e.target.value})} className="px-3 py-2 border rounded" required />
            <input type="password" placeholder="Mot de passe" value={formData.motP} onChange={(e) => setFormData({...formData, motP: e.target.value})} className="px-3 py-2 border rounded" required />
            <select value={formData.codeposte} onChange={(e) => setFormData({...formData, codeposte: e.target.value})} className="px-3 py-2 border rounded" required>
              <option value="">Poste</option>
              {postes.map(p => (
                <option key={p[0]} value={p[0]}>{p[1]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Créer</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Annuler</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Nom</th>
              <th className="px-4 py-2 text-left font-semibold">Login</th>
              <th className="px-4 py-2 text-left font-semibold">Poste</th>
              <th className="px-4 py-2 text-left font-semibold">Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{user[1]} {user[2]}</td>
                <td className="px-4 py-3">{user[3]}</td>
                <td className="px-4 py-3">{user[4]}</td>
                <td className="px-4 py-3">{user[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatsSection({ showNotification }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Statistiques</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <div className="text-3xl font-bold text-blue-600">0</div>
          <p className="text-sm text-gray-600">Commandes</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <div className="text-3xl font-bold text-green-600">0</div>
          <p className="text-sm text-gray-600">Livraisons</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <p className="text-sm text-gray-600">Utilisateurs</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
          <div className="text-3xl font-bold text-orange-600">0</div>
          <p className="text-sm text-gray-600">Articles</p>
        </div>
      </div>
    </div>
  );
}

export default App;
