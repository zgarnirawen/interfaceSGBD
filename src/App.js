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
        } text-white flex items-center gap-2 notification-enter`}>
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

// ==================== SECTION COMMANDES ====================
function CommandesSection({ showNotification }) {
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [formData, setFormData] = useState({
    noclt: '',
    refart: '',
    qtecde: ''
  });

  useEffect(() => {
    loadCommandes();
    loadClients();
    loadArticles();
  }, []);

  const loadCommandes = async () => {
    try {
      const res = await fetch(`${API_URL}/commandes`);
      const data = await res.json();
      if (data.success) setCommandes(data.data);
    } catch (err) {
      showNotification('Erreur chargement commandes', 'error');
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetch(`${API_URL}/clients`);
      const data = await res.json();
      if (data.success) setClients(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/articles`);
      const data = await res.json();
      if (data.success) setArticles(data.data);
    } catch (err) {
      console.error(err);
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
        showNotification('✓ Commande ajoutée - Trigger date activé - Stock mis à jour');
        setShowAddForm(false);
        setFormData({ noclt: '', refart: '', qtecde: '' });
        loadCommandes();
        loadArticles();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleChangeEtat = async (nocde, etat) => {
    try {
      const res = await fetch(`${API_URL}/commandes/modifier-etat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nocde, nouvel_etat: etat })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ État modifié - Package appelé avec succès');
        loadCommandes();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  const handleAnnuler = async (nocde) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    try {
      const res = await fetch(`${API_URL}/commandes/annuler/${nocde}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Commande annulée - Stock restauré - Historique créé');
        loadCommandes();
        loadArticles();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur lors de l\'annulation', 'error');
    }
  };

  const viewDetail = async (nocde) => {
    try {
      const res = await fetch(`${API_URL}/commandes/numero/${nocde}`);
      const data = await res.json();
      if (data.success) setShowDetail(data.data);
    } catch (err) {
      showNotification('Erreur chargement détails', 'error');
    }
  };

  const getEtatBadge = (etat) => {
    const config = {
      'EC': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En Cours' },
      'PR': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Prêt' },
      'LI': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Livré' },
      'SO': { bg: 'bg-green-100', text: 'text-green-800', label: 'Soldé' },
      'AN': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' }
    };
    const c = config[etat] || config['EC'];
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des Commandes</h2>
          <p className="text-sm text-gray-500">Test du package pkg_gestion_commandes</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouvelle Commande
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCommande} className="bg-blue-50 p-4 rounded-lg space-y-4 border-2 border-blue-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client *</label>
              <select
                value={formData.noclt}
                onChange={(e) => setFormData({...formData, noclt: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner...</option>
                {clients.map(cl => (
                  <option key={cl[0]} value={cl[0]}>{cl[1]} {cl[2]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Article *</label>
              <select
                value={formData.refart}
                onChange={(e) => setFormData({...formData, refart: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner...</option>
                {articles.map(art => (
                  <option key={art[0]} value={art[0]}>
                    {art[1]} (Stock: {art[6]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantité *</label>
              <input
                type="number"
                value={formData.qtecde}
                onChange={(e) => setFormData({...formData, qtecde: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Ajouter
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">N° Commande</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">État</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Client</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((cmd, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{cmd[0]}</td>
                <td className="px-4 py-3 text-sm">{new Date(cmd[1]).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">{getEtatBadge(cmd[2])}</td>
                <td className="px-4 py-3 text-sm">{cmd[4]} {cmd[5]}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewDetail(cmd[0])}
                      className="text-gray-600 hover:bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Eye size={14} /> Voir
                    </button>
                    {cmd[2] === 'EC' && (
                      <button
                        onClick={() => handleChangeEtat(cmd[0], 'PR')}
                        className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm"
                      >
                        → Prêt
                      </button>
                    )}
                    {cmd[2] === 'PR' && (
                      <button
                        onClick={() => handleChangeEtat(cmd[0], 'LI')}
                        className="text-purple-600 hover:bg-purple-50 px-2 py-1 rounded text-sm"
                      >
                        → Livré
                      </button>
                    )}
                    {cmd[2] === 'LI' && (
                      <button
                        onClick={() => handleChangeEtat(cmd[0], 'SO')}
                        className="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-sm"
                      >
                        → Soldé
                      </button>
                    )}
                    {['EC', 'PR'].includes(cmd[2]) && (
                      <button
                        onClick={() => handleAnnuler(cmd[0])}
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Détails Commande</h3>
            {showDetail.map((item, idx) => (
              <div key={idx} className="border-b py-2">
                <p><strong>Article:</strong> {item[7]} - {item[6]}</p>
                <p><strong>Quantité:</strong> {item[8]} × {item[9]}€ = {item[10]}€</p>
              </div>
            ))}
            <button
              onClick={() => setShowDetail(null)}
              className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SECTION LIVRAISONS ====================
function LivraisonsSection({ showNotification }) {
  const [livraisons, setLivraisons] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nocde: '',
    dateliv: '',
    livreur: '',
    modepay: 'apres_livraison'
  });

  useEffect(() => {
    loadLivraisons();
    loadCommandes();
    loadPersonnel();
  }, []);

  const loadLivraisons = async () => {
    try {
      const res = await fetch(`${API_URL}/livraisons`);
      const data = await res.json();
      if (data.success) setLivraisons(data.data);
    } catch (err) {
      showNotification('Erreur chargement livraisons', 'error');
    }
  };

  const loadCommandes = async () => {
    try {
      const res = await fetch(`${API_URL}/commandes`);
      const data = await res.json();
      if (data.success) setCommandes(data.data.filter(c => c[2] === 'PR'));
    } catch (err) {
      console.error(err);
    }
  };

  const loadPersonnel = async () => {
    try {
      const res = await fetch(`${API_URL}/personnel`);
      const data = await res.json();
      if (data.success) setPersonnel(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLivraison = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/livraisons/ajouter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Livraison ajoutée - Vérif limite 15/jour OK');
        setShowAddForm(false);
        setFormData({ nocde: '', dateliv: '', livreur: '', modepay: 'apres_livraison' });
        loadLivraisons();
        loadCommandes();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleSupprimer = async (nocde) => {
    if (!window.confirm('Supprimer cette livraison ?')) return;
    try {
      const res = await fetch(`${API_URL}/livraisons/supprimer/${nocde}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Livraison supprimée');
        loadLivraisons();
        loadCommandes();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur suppression', 'error');
    }
  };

  const getEtatBadge = (etat) => {
    const config = {
      'EC': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En cours' },
      'LI': { bg: 'bg-green-100', text: 'text-green-800', label: 'Livré' },
      'AL': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' }
    };
    const c = config[etat] || config['EC'];
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des Livraisons</h2>
          <p className="text-sm text-gray-500">Test du package pkg_gestion_livraisons</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouvelle Livraison
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddLivraison} className="bg-blue-50 p-4 rounded-lg space-y-4 border-2 border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Commande (Prête) *</label>
              <select
                value={formData.nocde}
                onChange={(e) => setFormData({...formData, nocde: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Sélectionner...</option>
                {commandes.map(cmd => (
                  <option key={cmd[0]} value={cmd[0]}>
                    Commande #{cmd[0]} - {cmd[4]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de livraison *</label>
              <input
                type="date"
                value={formData.dateliv}
                onChange={(e) => setFormData({...formData, dateliv: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Livreur *</label>
              <select
                value={formData.livreur}
                onChange={(e) => setFormData({...formData, livreur: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Sélectionner...</option>
                {personnel.map(p => (
                  <option key={p[0]} value={p[0]}>{p[1]} {p[2]} - {p[10]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mode de paiement *</label>
              <select
                value={formData.modepay}
                onChange={(e) => setFormData({...formData, modepay: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="avant_livraison">Avant livraison</option>
                <option value="apres_livraison">Après livraison</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Ajouter
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">N° Commande</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Date Livraison</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Livreur</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Client</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Mode Paiement</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">État</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {livraisons.map((liv, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{liv[0]}</td>
                <td className="px-4 py-3 text-sm">{new Date(liv[1]).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3 text-sm">{liv[5]} {liv[6]}</td>
                <td className="px-4 py-3 text-sm">{liv[8]}</td>
                <td className="px-4 py-3 text-sm">{liv[3]}</td>
                <td className="px-4 py-3">{getEtatBadge(liv[4])}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSupprimer(liv[0])}
                    className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== SECTION UTILISATEURS ====================
function UsersSection({ showNotification }) {
  const [users, setUsers] = useState([]);
  const [postes, setPostes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nompers: '', prenompers: '', adrpers: '', villepers: '',
    telpers: '', login: '', motP: '', codeposte: ''
  });

  useEffect(() => {
    loadUsers();
    loadPostes();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) {
      showNotification('Erreur chargement utilisateurs', 'error');
    }
  };

  const loadPostes = async () => {
    try {
      const res = await fetch(`${API_URL}/postes`);
      const data = await res.json();
      if (data.success) setPostes(data.data);
    } catch (err) {
      console.error(err);
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
        showNotification('✓ Utilisateur ajouté - Date embauche auto');
        setShowAddForm(false);
        setFormData({
          nompers: '', prenompers: '', adrpers: '', villepers: '',
          telpers: '', login: '', motP: '', codeposte: ''
        });
        loadUsers();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur lors de l\'ajout', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
          <p className="text-sm text-gray-500">Test du package pkg_gestion_utilisateurs</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouvel Utilisateur
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddUser} className="bg-blue-50 p-4 rounded-lg space-y-4 border-2 border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input
                type="text"