import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, Package, Truck, Users, BarChart3, 
  Plus, Trash2, Edit, Shield, Database, X, FileText, Settings
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('commandes');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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

      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">🗄️ Gestion Oracle - Interface Complète</h1>
          <p className="text-blue-100 text-sm mt-1">Système de gestion complet avec packages, triggers et vues</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
          <div className="flex">
            <TabButton active={activeTab === 'commandes'} onClick={() => setActiveTab('commandes')} icon={<Package size={20} />} label="Commandes" />
            <TabButton active={activeTab === 'livraisons'} onClick={() => setActiveTab('livraisons')} icon={<Truck size={20} />} label="Livraisons" />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={20} />} label="Utilisateurs" />
            <TabButton active={activeTab === 'privileges'} onClick={() => setActiveTab('privileges')} icon={<Shield size={20} />} label="Privilèges" />
            <TabButton active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} icon={<Settings size={20} />} label="Packages" />
            <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={<Database size={20} />} label="Données" />
            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={20} />} label="Statistiques" />
          </div>
        </nav>

        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'commandes' && <CommandesSection showNotification={showNotification} />}
          {activeTab === 'livraisons' && <LivraisonsSection showNotification={showNotification} />}
          {activeTab === 'users' && <UsersSection showNotification={showNotification} />}
          {activeTab === 'privileges' && <PrivilegesSection showNotification={showNotification} />}
          {activeTab === 'packages' && <PackagesSection showNotification={showNotification} />}
          {activeTab === 'data' && <DataSection showNotification={showNotification} />}
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
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all whitespace-nowrap ${
        active ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
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
      const [cmdData, clData, artData] = await Promise.all([cmdRes.json(), clRes.json(), artRes.json()]);
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

  const handleModifierEtat = async (nocde) => {
    const etat = prompt('Nouvel état (EC, PR, LI, SO, AN, AL):');
    if (!etat) return;
    
    try {
      const res = await fetch(`${API_URL}/commandes/modifier-etat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nocde, nouvel_etat: etat })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ État modifié');
        loadData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  const handleAnnuler = async (nocde) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    
    try {
      const res = await fetch(`${API_URL}/commandes/annuler/${nocde}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Commande annulée');
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
          <h2 className="text-2xl font-bold text-gray-800">📦 Gestion des Commandes</h2>
          <p className="text-sm text-gray-500">Package: pkg_gestion_commandes</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus size={20} />
          Nouvelle Commande
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCommande} className="bg-blue-50 p-4 rounded-lg space-y-3 border-2 border-blue-200">
          <h3 className="font-semibold text-blue-900">Ajouter une commande</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Client *</label>
              <select value={formData.noclt} onChange={(e) => setFormData({...formData, noclt: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Sélectionner...</option>
                {clients.map(cl => (
                  <option key={cl[0]} value={cl[0]}>{cl[1]} {cl[2]} - {cl[5]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Article *</label>
              <select value={formData.refart} onChange={(e) => setFormData({...formData, refart: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Sélectionner...</option>
                {articles.map(art => (
                  <option key={art[0]} value={art[0]}>{art[1]} (Stock: {art[6]})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantité *</label>
              <input type="number" value={formData.qtecde} onChange={(e) => setFormData({...formData, qtecde: e.target.value})} className="w-full px-3 py-2 border rounded-lg" min="1" required />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">✓ Ajouter</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Annuler</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">N° Commande</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Client</th>
              <th className="px-4 py-3 text-left font-semibold">État</th>
              <th className="px-4 py-3 text-left font-semibold">Montant</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((cmd, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">#{cmd[0]}</td>
                <td className="px-4 py-3">{new Date(cmd[1]).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">{cmd[4]} {cmd[5]}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    cmd[2] === 'EC' ? 'bg-yellow-100 text-yellow-800' :
                    cmd[2] === 'PR' ? 'bg-blue-100 text-blue-800' :
                    cmd[2] === 'LI' ? 'bg-purple-100 text-purple-800' :
                    cmd[2] === 'SO' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>{cmd[2]}</span>
                </td>
                <td className="px-4 py-3 font-semibold">{cmd[6] ? `${cmd[6].toFixed(2)} TND` : '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleModifierEtat(cmd[0])} className="text-blue-600 hover:text-blue-800" title="Modifier état">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleAnnuler(cmd[0])} className="text-red-600 hover:text-red-800" title="Annuler">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== SECTION LIVRAISONS ====================
function LivraisonsSection({ showNotification }) {
  const [livraisons, setLivraisons] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ nocde: '', dateliv: '', livreur: '', modepay: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [livRes, cmdRes, persRes] = await Promise.all([
        fetch(`${API_URL}/livraisons`),
        fetch(`${API_URL}/commandes`),
        fetch(`${API_URL}/personnel`)
      ]);
      const [livData, cmdData, persData] = await Promise.all([livRes.json(), cmdRes.json(), persRes.json()]);
      if (livData.success) setLivraisons(livData.data);
      if (cmdData.success) setCommandes(cmdData.data.filter(c => c[2] === 'PR'));
      if (persData.success) setPersonnel(persData.data);
    } catch (err) {
      showNotification('Erreur', 'error');
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
        showNotification('✓ Livraison ajoutée');
        setShowAddForm(false);
        setFormData({ nocde: '', dateliv: '', livreur: '', modepay: '' });
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
          <h2 className="text-2xl font-bold text-gray-800">🚚 Gestion des Livraisons</h2>
          <p className="text-sm text-gray-500">Package: pkg_gestion_livraisons</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
          <Plus size={20} />
          Nouvelle Livraison
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddLivraison} className="bg-green-50 p-4 rounded-lg space-y-3 border-2 border-green-200">
          <h3 className="font-semibold text-green-900">Ajouter une livraison</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Commande *</label>
              <select value={formData.nocde} onChange={(e) => setFormData({...formData, nocde: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Sélectionner...</option>
                {commandes.map(cmd => (
                  <option key={cmd[0]} value={cmd[0]}>#{cmd[0]} - {cmd[4]} {cmd[5]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date livraison *</label>
              <input type="date" value={formData.dateliv} onChange={(e) => setFormData({...formData, dateliv: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Livreur *</label>
              <select value={formData.livreur} onChange={(e) => setFormData({...formData, livreur: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Sélectionner...</option>
                {personnel.map(p => (
                  <option key={p[0]} value={p[0]}>{p[1]} {p[2]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mode paiement *</label>
              <select value={formData.modepay} onChange={(e) => setFormData({...formData, modepay: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Sélectionner...</option>
                <option value="avant_livraison">Avant livraison</option>
                <option value="apres_livraison">Après livraison</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">✓ Ajouter</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Annuler</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">N° Commande</th>
              <th className="px-4 py-3 text-left font-semibold">Date livraison</th>
              <th className="px-4 py-3 text-left font-semibold">Livreur</th>
              <th className="px-4 py-3 text-left font-semibold">Client</th>
              <th className="px-4 py-3 text-left font-semibold">Mode paiement</th>
              <th className="px-4 py-3 text-left font-semibold">État</th>
            </tr>
          </thead>
          <tbody>
            {livraisons.map((liv, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">#{liv[0]}</td>
                <td className="px-4 py-3">{new Date(liv[1]).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">{liv[5]} {liv[6]}</td>
                <td className="px-4 py-3">{liv[8]} {liv[9]}</td>
                <td className="px-4 py-3">{liv[3]}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    liv[4] === 'EC' ? 'bg-yellow-100 text-yellow-800' :
                    liv[4] === 'LI' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{liv[4]}</span>
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
  const [editMode, setEditMode] = useState(null);
  const [formData, setFormData] = useState({
    nompers: '', prenompers: '', adrpers: '', villepers: '', 
    telpers: '', login: '', motP: '', codeposte: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode ? `${API_URL}/users/modifier` : `${API_URL}/users/ajouter`;
      const method = editMode ? 'PUT' : 'POST';
      const body = editMode ? { ...formData, idpers: editMode } : formData;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(editMode ? '✓ Utilisateur modifié' : '✓ Utilisateur créé');
        setShowAddForm(false);
        setEditMode(null);
        setFormData({ nompers: '', prenompers: '', adrpers: '', villepers: '', telpers: '', login: '', motP: '', codeposte: '' });
        loadData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  const handleEdit = (user) => {
    setEditMode(user[0]);
    setFormData({
      nompers: user[1],
      prenompers: user[2],
      adrpers: user[3],
      villepers: user[4],
      telpers: user[5].toString(),
      login: user[7],
      motP: '',
      codeposte: user[8]
    });
    setShowAddForm(true);
  };

  const handleDelete = async (idpers) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    
    try {
      const res = await fetch(`${API_URL}/users/supprimer/${idpers}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Utilisateur supprimé');
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
          <h2 className="text-2xl font-bold text-gray-800">👥 Gestion des Utilisateurs</h2>
          <p className="text-sm text-gray-500">Package: pkg_gestion_utilisateurs</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditMode(null);
            setFormData({ nompers: '', prenompers: '', adrpers: '', villepers: '', telpers: '', login: '', motP: '', codeposte: '' });
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus size={20} />
          Nouvel Utilisateur
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-purple-50 p-4 rounded-lg space-y-3 border-2 border-purple-200">
          <h3 className="font-semibold text-purple-900">{editMode ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h3>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" placeholder="Nom *" value={formData.nompers} onChange={(e) => setFormData({...formData, nompers: e.target.value})} className="px-3 py-2 border rounded-lg" required />
            <input type="text" placeholder="Prénom *" value={formData.prenompers} onChange={(e) => setFormData({...formData, prenompers: e.target.value})} className="px-3 py-2 border rounded-lg" required />
            <input type="text" placeholder="Adresse *" value={formData.adrpers} onChange={(e) => setFormData({...formData, adrpers: e.target.value})} className="px-3 py-2 border rounded-lg" required />
            <input type="text" placeholder="Ville *" value={formData.villepers} onChange={(e) => setFormData({...formData, villepers: e.target.value})} className="px-3 py-2 border rounded-lg" required />
            <input type="tel" placeholder="Téléphone (8 chiffres) *" value={formData.telpers} onChange={(e) => setFormData({...formData, telpers: e.target.value})} className="px-3 py-2 border rounded-lg" pattern="[0-9]{8}" required />
            <input type="text" placeholder="Login *" value={formData.login} onChange={(e) => setFormData({...formData, login: e.target.value})} className="px-3 py-2 border rounded-lg" disabled={editMode} required />
            <input type="password" placeholder={editMode ? "Nouveau mot de passe" : "Mot de passe *"} value={formData.motP} onChange={(e) => setFormData({...formData, motP: e.target.value})} className="px-3 py-2 border rounded-lg" required={!editMode} />
            <select value={formData.codeposte} onChange={(e) => setFormData({...formData, codeposte: e.target.value})} className="px-3 py-2 border rounded-lg" required>
              <option value="">Poste *</option>
              {postes.map(p => (
                <option key={p[0]} value={p[0]}>{p[1]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">✓ {editMode ? 'Modifier' : 'Créer'}</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Annuler</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Nom</th>
              <th className="px-4 py-3 text-left font-semibold">Login</th>
              <th className="px-4 py-3 text-left font-semibold">Poste</th>
              <th className="px-4 py-3 text-left font-semibold">Ville</th>
              <th className="px-4 py-3 text-left font-semibold">Téléphone</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{user[1]} {user[2]}</td>
                <td className="px-4 py-3 font-mono text-blue-600">{user[7]}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">{user[9]}</span>
                </td>
                <td className="px-4 py-3">{user[4]}</td>
                <td className="px-4 py-3">{user[5]}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800" title="Modifier">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(user[0])} className="text-red-600 hover:text-red-800" title="Supprimer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== SECTION PRIVILÈGES ====================
function PrivilegesSection({ showNotification }) {
  const [postes, setPostes] = useState([]);
  const [formData, setFormData] = useState({ username: '', codeposte: '' });

  useEffect(() => {
    loadPostes();
  }, []);

  const loadPostes = async () => {
    try {
      const res = await fetch(`${API_URL}/postes`);
      const data = await res.json();
      if (data.success) setPostes(data.data);
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  const handleCreerSchemas = async () => {
    try {
      const res = await fetch(`${API_URL}/privileges/creer-schemas`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Schémas externes créés');
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  const handleGererPrivileges = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/privileges/gerer-par-poste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✓ Privilèges accordés');
        setFormData({ username: '', codeposte: '' });
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">🔒 Gestion des Privilèges</h2>
        <p className="text-sm text-gray-500">Package: pkg_gestion_privileges</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Créer les schémas externes</h3>
          <p className="text-sm text-gray-600 mb-4">Crée automatiquement toutes les vues nécessaires pour les différents rôles</p>
          <button onClick={handleCreerSchemas} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
            🏗️ Créer les schémas
          </button>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-lg font-semibold mb-4 text-green-900">Accorder privilèges par poste</h3>
          <form onSubmit={handleGererPrivileges} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nom d'utilisateur Oracle *</label>
              <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="ex: USER1" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Poste / Rôle *</label>
              <select value={formData.codeposte} onChange={(e) => setFormData({...formData, codeposte: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Sélectionner...</option>
                {postes.map(p => (
                  <option key={p[0]} value={p[0]}>{p[1]}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
              ✓ Accorder privilèges
            </button>
          </form>
        </div>
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
        <h3 className="text-lg font-semibold mb-3 text-yellow-900">ℹ️ Informations sur les privilèges</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>P001 - Magasinier :</strong> SELECT, INSERT, UPDATE sur articles et commandes</p>
          <p><strong>P002 - Administrateur :</strong> Tous les droits sur toutes les tables</p>
          <p><strong>P003 - ChefLivreur :</strong> Tous les droits sur livraisons, SELECT/UPDATE sur commandes</p>
        </div>
      </div>
    </div>
  );
}

// ==================== SECTION PACKAGES ====================
function PackagesSection({ showNotification }) {
  const packages = [
    {
      name: 'pkg_messages',
      description: 'Gestion centralisée des messages d\'erreur et de succès',
      functions: ['msg_succes_ajout', 'msg_succes_modif', 'msg_succes_suppr', 'msg_err_existe_deja', 'msg_err_introuvable']
    },
    {
      name: 'pkg_gestion_commandes',
      description: 'CRUD complet sur les commandes avec gestion des états',
      procedures: ['ajouter_commande', 'modifier_etat_commande', 'annuler_commande', 'chercher_commande_par_numero', 'chercher_commande_par_client']
    },
    {
      name: 'pkg_gestion_livraisons',
      description: 'Gestion des livraisons avec contraintes métier',
      procedures: ['ajouter_livraison', 'supprimer_livraison', 'modifier_livraison', 'chercher_livraison_par_commande', 'verifier_limite_livraisons']
    },
    {
      name: 'pkg_gestion_utilisateurs',
      description: 'Gestion des utilisateurs de l\'application',
      procedures: ['ajouter_utilisateur', 'modifier_utilisateur', 'supprimer_utilisateur', 'authentifier', 'changer_mot_de_passe', 'lister_utilisateurs']
    },
    {
      name: 'pkg_gestion_privileges',
      description: 'Attribution des privilèges Oracle par rôle',
      procedures: ['creer_schemas_externes', 'accorder_privileges_administrateur', 'accorder_privileges_magasinier', 'accorder_privileges_cheflivreur', 'gerer_privileges_par_poste']
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">📦 Packages Oracle</h2>
        <p className="text-sm text-gray-500">Liste complète des packages implémentés</p>
      </div>

      <div className="grid gap-4">
        {packages.map((pkg, idx) => (
          <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-2">{pkg.name}</h3>
            <p className="text-sm text-gray-700 mb-3">{pkg.description}</p>
            <div className="bg-white p-3 rounded border">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                {pkg.functions ? 'FONCTIONS:' : 'PROCÉDURES:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(pkg.functions || pkg.procedures).map((item, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== SECTION DONNÉES ====================
function DataSection({ showNotification }) {
  const [activeData, setActiveData] = useState('clients');
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [personnel, setPersonnel] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [clRes, artRes, persRes] = await Promise.all([
        fetch(`${API_URL}/clients`),
        fetch(`${API_URL}/articles`),
        fetch(`${API_URL}/personnel`)
      ]);
      const [clData, artData, persData] = await Promise.all([clRes.json(), artRes.json(), persRes.json()]);
      if (clData.success) setClients(clData.data);
      if (artData.success) setArticles(artData.data);
      if (persData.success) setPersonnel(persData.data);
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">📊 Données de référence</h2>
        <p className="text-sm text-gray-500">Tables: clients, articles, personnel</p>
      </div>

      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveData('clients')} className={`px-4 py-2 border-b-2 ${activeData === 'clients' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>
          Clients ({clients.length})
        </button>
        <button onClick={() => setActiveData('articles')} className={`px-4 py-2 border-b-2 ${activeData === 'articles' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>
          Articles ({articles.length})
        </button>
        <button onClick={() => setActiveData('personnel')} className={`px-4 py-2 border-b-2 ${activeData === 'personnel' ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}>
          Personnel ({personnel.length})
        </button>
      </div>

      {activeData === 'clients' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Prénom</th>
                <th className="px-4 py-2 text-left">Ville</th>
                <th className="px-4 py-2 text-left">Téléphone</th>
                <th className="px-4 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((cl, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{cl[0]}</td>
                  <td className="px-4 py-2 font-semibold">{cl[1]}</td>
                  <td className="px-4 py-2">{cl[2]}</td>
                  <td className="px-4 py-2">{cl[5]}</td>
                  <td className="px-4 py-2">{cl[6]}</td>
                  <td className="px-4 py-2">{cl[7]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeData === 'articles' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Réf</th>
                <th className="px-4 py-2 text-left">Désignation</th>
                <th className="px-4 py-2 text-left">Prix Achat</th>
                <th className="px-4 py-2 text-left">Prix Vente</th>
                <th className="px-4 py-2 text-left">Catégorie</th>
                <th className="px-4 py-2 text-left">Stock</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{art[0]}</td>
                  <td className="px-4 py-2 font-semibold">{art[1]}</td>
                  <td className="px-4 py-2">{art[2]} TND</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">{art[3]} TND</td>
                  <td className="px-4 py-2">{art[5]}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      art[6] > 100 ? 'bg-green-100 text-green-800' :
                      art[6] > 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>{art[6]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeData === 'personnel' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Login</th>
                <th className="px-4 py-2 text-left">Poste</th>
                <th className="px-4 py-2 text-left">Ville</th>
                <th className="px-4 py-2 text-left">Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {personnel.map((p, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{p[0]}</td>
                  <td className="px-4 py-2 font-semibold">{p[1]} {p[2]}</td>
                  <td className="px-4 py-2 font-mono text-blue-600">{p[7]}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">{p[9]}</span>
                  </td>
                  <td className="px-4 py-2">{p[4]}</td>
                  <td className="px-4 py-2">{p[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==================== SECTION STATISTIQUES ====================
function StatsSection({ showNotification }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats/global`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      showNotification('Erreur', 'error');
    }
  };

  if (!stats) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">📈 Statistiques Globales</h2>
        <p className="text-sm text-gray-500">Vue d'ensemble du système</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats[0]}</div>
          <p className="text-sm text-gray-600 font-medium">Commandes</p>
          <Package className="text-blue-300 mt-2" size={24} />
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <div className="text-4xl font-bold text-green-600 mb-2">{stats[1]}</div>
          <p className="text-sm text-gray-600 font-medium">Livraisons</p>
          <Truck className="text-green-300 mt-2" size={24} />
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
          <div className="text-4xl font-bold text-purple-600 mb-2">{stats[2]}</div>
          <p className="text-sm text-gray-600 font-medium">Utilisateurs</p>
          <Users className="text-purple-300 mt-2" size={24} />
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
          <div className="text-4xl font-bold text-orange-600 mb-2">{stats[3]}</div>
          <p className="text-sm text-gray-600 font-medium">Articles</p>
          <Package className="text-orange-300 mt-2" size={24} />
        </div>
        
        <div className="bg-pink-50 p-6 rounded-lg border-2 border-pink-200">
          <div className="text-4xl font-bold text-pink-600 mb-2">{stats[4]}</div>
          <p className="text-sm text-gray-600 font-medium">Clients</p>
          <Users className="text-pink-300 mt-2" size={24} />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold mb-4">📋 Packages et Fonctionnalités</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">✅ Packages Implémentés</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• pkg_messages</li>
              <li>• pkg_gestion_commandes</li>
              <li>• pkg_gestion_livraisons</li>
              <li>• pkg_gestion_utilisateurs</li>
              <li>• pkg_gestion_privileges</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-900 mb-2">✅ Triggers Actifs</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• trg_verif_article_unique</li>
              <li>• trg_date_commande</li>
              <li>• trg_maj_stock</li>
              <li>• trg_limite_livraisons</li>
              <li>• trg_heure_maj_livraison</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;