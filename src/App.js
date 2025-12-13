import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, Package, Truck, Users, BarChart3, 
  Plus, Trash2, Edit, Shield, Database, X, FileText, Settings,
  Search, RefreshCw, Check, Calendar, Lock, Eye, Zap, Activity
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-2xl ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center gap-2`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Database size={40} />
            Système de Gestion Oracle Complet
          </h1>
          <p className="text-blue-100 text-lg">
            Interface complète • Packages • Triggers • Views • Statistiques en temps réel
          </p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <nav className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            <TabButton active={activeTab === 'commandes'} onClick={() => setActiveTab('commandes')} icon={<Package />} label="Commandes" />
            <TabButton active={activeTab === 'livraisons'} onClick={() => setActiveTab('livraisons')} icon={<Truck />} label="Livraisons" />
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users />} label="Utilisateurs" />
            <TabButton active={activeTab === 'privileges'} onClick={() => setActiveTab('privileges')} icon={<Shield />} label="Privilèges" />
            <TabButton active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} icon={<Settings />} label="Packages" />
            <TabButton active={activeTab === 'triggers'} onClick={() => setActiveTab('triggers')} icon={<Zap />} label="Triggers" />
            <TabButton active={activeTab === 'views'} onClick={() => setActiveTab('views')} icon={<Eye />} label="Views" />
            <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={<Database />} label="Données" />
            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 />} label="Statistiques" />
          </div>
        </nav>

        <div className="bg-white rounded-xl shadow-xl p-8">
          {activeTab === 'commandes' && <CommandesSection showNotification={showNotification} />}
          {activeTab === 'livraisons' && <LivraisonsSection showNotification={showNotification} />}
          {activeTab === 'users' && <UsersSection showNotification={showNotification} />}
          {activeTab === 'privileges' && <PrivilegesSection showNotification={showNotification} />}
          {activeTab === 'packages' && <PackagesSection showNotification={showNotification} />}
          {activeTab === 'triggers' && <TriggersSection showNotification={showNotification} />}
          {activeTab === 'views' && <ViewsSection showNotification={showNotification} />}
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
      className={`flex items-center gap-2 px-6 py-4 border-b-4 transition-all whitespace-nowrap font-semibold ${
        active 
          ? 'border-blue-600 text-blue-600 bg-blue-50' 
          : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
      }`}
    >
      {React.cloneElement(icon, { size: 20 })}
      <span>{label}</span>
    </button>
  );
}

// Composant SearchBar réutilisable
function SearchBar({ value, onChange, onSearch, onReset, placeholder = "Rechercher..." }) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        onClick={onSearch}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
      >
        <Search size={20} />
        Rechercher
      </button>
      <button
        onClick={onReset}
        className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
        title="Réinitialiser"
      >
        <RefreshCw size={20} />
      </button>
    </div>
  );
}

// ==================== SECTION COMMANDES ====================
function CommandesSection({ showNotification }) {
  const [commandes, setCommandes] = useState([]);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ noclt: '', refart: '', qtecde: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cmdRes, clRes, artRes] = await Promise.all([
        fetch(`${API_URL}/commandes`),
        fetch(`${API_URL}/clients`),
        fetch(`${API_URL}/articles`)
      ]);
      const [cmdData, clData, artData] = await Promise.all([
        cmdRes.json(), 
        clRes.json(), 
        artRes.json()
      ]);
      if (cmdData.success) setCommandes(cmdData.data);
      if (clData.success) setClients(clData.data);
      if (artData.success) setArticles(artData.data);
    } catch (err) {
      showNotification('❌ Erreur chargement données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCommande = async (e) => {
    e.preventDefault();
    try {
      // Trigger trg_date_commande sera déclenché automatiquement (BEFORE INSERT)
      // Trigger trg_maj_stock sera déclenché automatiquement (AFTER INSERT sur ligcdes)
      const res = await fetch(`${API_URL}/commandes/ajouter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✅ Commande ajoutée (Triggers: trg_date_commande, trg_maj_stock exécutés)');
        setShowAddForm(false);
        setFormData({ noclt: '', refart: '', qtecde: '' });
        loadData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur lors de l\'ajout', 'error');
    }
  };

  const handleModifierEtat = async (nocde) => {
    const etat = prompt('Nouvel état (EC/PR/LI/SO/AN/AL):');
    if (!etat || !['EC', 'PR', 'LI', 'SO', 'AN', 'AL'].includes(etat.toUpperCase())) {
      showNotification('❌ État invalide', 'error');
      return;
    }
    
    try {
      // Trigger trg_audit_commandes sera déclenché automatiquement (AFTER UPDATE)
      const res = await fetch(`${API_URL}/commandes/modifier-etat`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nocde, nouvel_etat: etat.toUpperCase() })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✅ État modifié (Trigger: trg_audit_commandes exécuté)');
        loadData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur modification', 'error');
    }
  };

  const handleAnnuler = async (nocde) => {
    if (!window.confirm('⚠️ Confirmer l\'annulation ? Le stock sera remis à jour.')) return;
    
    try {
      const res = await fetch(`${API_URL}/commandes/annuler/${nocde}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('✅ Commande annulée - Stock restauré');
        loadData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur annulation', 'error');
    }
  };

  const filteredCommandes = commandes.filter(cmd => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      cmd[0]?.toString().includes(term) ||
      cmd[4]?.toLowerCase().includes(term) ||
      cmd[5]?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            Gestion des Commandes
          </h2>
          <p className="text-gray-600 mt-1">Package: <code className="bg-gray-100 px-2 py-1 rounded">pkg_gestion_commandes</code></p>
          <p className="text-xs text-orange-600 mt-1">⚡ Triggers actifs: trg_date_commande, trg_audit_commandes, trg_maj_stock</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-xl transition-all font-semibold"
        >
          <Plus size={20} />
          Nouvelle Commande
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={loadData}
          onReset={() => { setSearchTerm(''); loadData(); }}
          placeholder="Rechercher par N°, client..."
        />
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCommande} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
          <h3 className="font-bold text-blue-900 mb-4 text-xl flex items-center gap-2">
            <Plus className="bg-blue-600 text-white p-1 rounded" size={24} />
            Ajouter une nouvelle commande
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">👤 Client *</label>
              <select 
                value={formData.noclt} 
                onChange={(e) => setFormData({...formData, noclt: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium" 
                required
              >
                <option value="">Sélectionner un client...</option>
                {clients.map(cl => (
                  <option key={cl[0]} value={cl[0]}>
                    {cl[1]} {cl[2]} - {cl[5]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">📦 Article *</label>
              <select 
                value={formData.refart} 
                onChange={(e) => setFormData({...formData, refart: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium" 
                required
              >
                <option value="">Sélectionner un article...</option>
                {articles.map(art => (
                  <option key={art[0]} value={art[0]}>
                    {art[1]} (Stock: {art[6]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">🔢 Quantité *</label>
              <input 
                type="number" 
                value={formData.qtecde} 
                onChange={(e) => setFormData({...formData, qtecde: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium" 
                min="1" 
                required 
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2">
              <Check size={20} />
              Ajouter
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 font-bold flex items-center gap-2">
              <X size={20} />
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border-2 border-gray-200 rounded-xl shadow-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">N° Commande</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Date</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Client</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">État</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Montant</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommandes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <Package size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Aucune commande trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredCommandes.map((cmd, idx) => (
                    <tr key={idx} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">#{cmd[0]}</td>
                      <td className="px-6 py-4 font-medium">{new Date(cmd[1]).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 font-semibold">{cmd[4]} {cmd[5]}</td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide ${
                          cmd[2] === 'EC' ? 'bg-yellow-200 text-yellow-900' :
                          cmd[2] === 'PR' ? 'bg-blue-200 text-blue-900' :
                          cmd[2] === 'LI' ? 'bg-purple-200 text-purple-900' :
                          cmd[2] === 'SO' ? 'bg-green-200 text-green-900' :
                          'bg-red-200 text-red-900'
                        }`}>
                          {cmd[2]}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600 text-lg">
                        {cmd[6] ? `${Number(cmd[6]).toFixed(2)} TND` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleModifierEtat(cmd[0])} 
                            className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-all" 
                            title="Modifier état"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleAnnuler(cmd[0])} 
                            className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-all" 
                            title="Annuler"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700">
              📊 Total: <span className="text-blue-600 text-lg">{filteredCommandes.length}</span> commande(s) affichée(s)
            </p>
          </div>
        </>
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
  const [showModifyForm, setShowModifyForm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('commande');
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [livRes, cmdRes, persRes] = await Promise.all([
        fetch(`${API_URL}/livraisons`),
        fetch(`${API_URL}/commandes`),
        fetch(`${API_URL}/personnel`)
      ]);
      const [livData, cmdData, persData] = await Promise.all([
        livRes.json(), 
        cmdRes.json(), 
        persRes.json()
      ]);
      
      if (livData.success) setLivraisons(livData.data);
      if (cmdData.success) {
        setCommandes(cmdData.data.filter(c => c[2] === 'PR'));
      }
      if (persData.success) setPersonnel(persData.data);
    } catch (err) {
      showNotification('❌ Erreur chargement données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLivraison = async (e) => {
    e.preventDefault();
    try {
      // Trigger trg_limite_livraisons sera déclenché automatiquement (BEFORE INSERT)
      const res = await fetch(`${API_URL}/livraisons/ajouter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification('✅ Livraison ajoutée (Trigger: trg_limite_livraisons vérifié)');
        setShowAddForm(false);
        setFormData({ nocde: '', dateliv: '', livreur: '', modepay: '' });
        loadData();
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur lors de l\'ajout', 'error');
    }
  };

  const handleModifyLivraison = async (e) => {
    e.preventDefault();
    try {
      // Trigger trg_heure_maj_livraison sera déclenché automatiquement (BEFORE UPDATE)
      const res = await fetch(`${API_URL}/livraisons/modifier`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modifyData)
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification('✅ Livraison modifiée (Trigger: trg_heure_maj_livraison vérifié)');
        setShowModifyForm(null);
        setModifyData({ nocde: '', nouvelle_date: '', nouveau_livreur: '' });
        loadData();
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur modification', 'error');
    }
  };

  const handleDelete = async (nocde) => {
    if (!window.confirm('⚠️ Supprimer cette livraison ? La commande sera annulée.')) return;
    
    try {
      const res = await fetch(`${API_URL}/livraisons/supprimer/${nocde}`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification('✅ Livraison supprimée');
        loadData();
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur suppression', 'error');
    }
  };

  const handleSearchByType = async () => {
    if (!searchTerm) {
      loadData();
      return;
    }

    try {
      let url = '';
      if (searchType === 'commande') {
        url = `${API_URL}/livraisons/commande/${searchTerm}`;
      } else if (searchType === 'livreur') {
        url = `${API_URL}/livraisons/livreur/${searchTerm}`;
      } else if (searchType === 'ville') {
        url = `${API_URL}/livraisons/ville/${searchTerm}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setLivraisons(data.data);
        showNotification(`✅ ${data.data.length} résultat(s) trouvé(s)`);
      }
    } catch (err) {
      showNotification('❌ Erreur de recherche', 'error');
    }
  };

  const openModifyForm = (liv) => {
    setShowModifyForm(liv[0]);
    setModifyData({
      nocde: liv[0],
      nouvelle_date: '',
      nouveau_livreur: ''
    });
  };

  const filteredLivraisons = livraisons.filter(liv => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      liv[0]?.toString().includes(term) ||
      liv[5]?.toLowerCase().includes(term) ||
      liv[6]?.toLowerCase().includes(term) ||
      liv[8]?.toLowerCase().includes(term) ||
      liv[9]?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Truck className="text-green-600" size={32} />
            Gestion des Livraisons
          </h2>
          <p className="text-gray-600 mt-1">
            Package: <code className="bg-gray-100 px-2 py-1 rounded">pkg_gestion_livraisons</code>
          </p>
          <p className="text-xs text-orange-600 mt-1">⚡ Triggers actifs: trg_limite_livraisons, trg_heure_maj_livraison</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-xl transition-all font-semibold"
        >
          <Plus size={20} />
          Nouvelle Livraison
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold mb-2 text-gray-700">🔍 Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="N° commande, livreur, client..."
                className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm font-bold mb-2 text-gray-700">Type</label>
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-lg"
            >
              <option value="commande">N° Commande</option>
              <option value="livreur">Livreur</option>
              <option value="ville">Code Postal</option>
            </select>
          </div>
          <button
            onClick={handleSearchByType}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <Search size={20} />
            Rechercher
          </button>
          <button
            onClick={() => { setSearchTerm(''); loadData(); }}
            className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
            title="Réinitialiser"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddLivraison} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 shadow-lg">
          <h3 className="font-bold text-green-900 mb-4 text-xl flex items-center gap-2">
            <Plus className="bg-green-600 text-white p-1 rounded" size={24} />
            Ajouter une nouvelle livraison
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">📦 Commande (PR) *</label>
              <select 
                value={formData.nocde} 
                onChange={(e) => setFormData({...formData, nocde: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                required
              >
                <option value="">Sélectionner...</option>
                {commandes.map(cmd => (
                  <option key={cmd[0]} value={cmd[0]}>
                    #{cmd[0]} - {cmd[4]} {cmd[5]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">📅 Date livraison *</label>
              <input 
                type="date" 
                value={formData.dateliv} 
                onChange={(e) => setFormData({...formData, dateliv: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">👤 Livreur *</label>
              <select 
                value={formData.livreur} 
                onChange={(e) => setFormData({...formData, livreur: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                required
              >
                <option value="">Sélectionner...</option>
                {personnel.map(p => (
                  <option key={p[0]} value={p[0]}>
                    {p[1]} {p[2]} - {p[9]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">💳 Mode paiement *</label>
              <select 
                value={formData.modepay} 
                onChange={(e) => setFormData({...formData, modepay: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                required
              >
                <option value="">Sélectionner...</option>
                <option value="avant_livraison">💰 Avant livraison</option>
                <option value="apres_livraison">📦 Après livraison</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold flex items-center gap-2">
              <Check size={20} />
              Ajouter
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowAddForm(false);
                setFormData({ nocde: '', dateliv: '', livreur: '', modepay: '' });
              }} 
              className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 font-bold flex items-center gap-2"
            >
              <X size={20} />
              Annuler
            </button>
          </div>
        </form>
      )}

      {showModifyForm && (
        <form onSubmit={handleModifyLivraison} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
          <h3 className="font-bold text-blue-900 mb-4 text-xl flex items-center gap-2">
            <Edit className="bg-blue-600 text-white p-1 rounded" size={24} />
            Modifier la livraison #{showModifyForm}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">📅 Nouvelle date (optionnel)</label>
              <input 
                type="date" 
                value={modifyData.nouvelle_date} 
                onChange={(e) => setModifyData({...modifyData, nouvelle_date: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-1">⏰ Modifiable avant 9h (matin) ou 14h (après-midi)</p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">👤 Nouveau livreur (optionnel)</label>
              <select 
                value={modifyData.nouveau_livreur} 
                onChange={(e) => setModifyData({...modifyData, nouveau_livreur: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Ne pas modifier</option>
                {personnel.map(p => (
                  <option key={p[0]} value={p[0]}>
                    {p[1]} {p[2]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2">
              <Check size={20} />
              Modifier
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowModifyForm(null);
                setModifyData({ nocde: '', nouvelle_date: '', nouveau_livreur: '' });
              }} 
              className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 font-bold flex items-center gap-2"
            >
              <X size={20} />
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border-2 border-gray-200 rounded-xl shadow-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">N° Commande</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Date livraison</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Livreur</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Client</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Mode paiement</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">État</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLivraisons.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <Truck size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Aucune livraison trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredLivraisons.map((liv, idx) => (
                    <tr key={idx} className="border-b hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-green-600">#{liv[0]}</td>
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {new Date(liv[1]).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{liv[5]} {liv[6]}</td>
                      <td className="px-6 py-4">{liv[8]} {liv[9]}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          liv[3] === 'avant_livraison' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {liv[3] === 'avant_livraison' ? '💰 Avant' : '📦 Après'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
                          liv[4] === 'EC' ? 'bg-yellow-200 text-yellow-900' :
                          liv[4] === 'LI' ? 'bg-green-200 text-green-900' :
                          'bg-gray-200 text-gray-900'
                        }`}>
                          {liv[4]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openModifyForm(liv)} 
                            className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-all" 
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(liv[0])} 
                            className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-all" 
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-lg border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700">
              📊 Total: <span className="text-green-600 text-lg">{filteredLivraisons.length}</span> livraison(s) affichée(s)
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== SECTION UTILISATEURS ====================
function UsersSection({ showNotification }) {
  const [users, setUsers] = useState([]);
  const [postes, setPostes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('nom');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nompers: '', 
    prenompers: '', 
    adrpers: '', 
    villepers: '', 
    telpers: '', 
    login: '', 
    motP: '', 
    codeposte: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usRes, psRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/postes`)
      ]);
      const [usData, psData] = await Promise.all([usRes.json(), psRes.json()]);
      
      if (usData.success) setUsers(usData.data);
      if (psData.success) setPostes(psData.data);
    } catch (err) {
      showNotification('❌ Erreur chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.telpers.length !== 8 || !/^\d+$/.test(formData.telpers)) {
      showNotification('❌ Le téléphone doit contenir exactement 8 chiffres', 'error');
      return;
    }
    
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
        showNotification(editMode ? '✅ Utilisateur modifié' : '✅ Utilisateur créé');
        resetForm();
        loadData();
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur: ' + err.message, 'error');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (idpers, login) => {
    if (!window.confirm(`⚠️ Désactiver l'utilisateur "${login}" ?\n\nCette action est réversible (suppression logique).`)) return;
    
    try {
      const res = await fetch(`${API_URL}/users/supprimer/${idpers}`, { 
        method: 'DELETE' 
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification('✅ Utilisateur désactivé');
        loadData();
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur suppression', 'error');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      loadData();
      return;
    }

    try {
      let url = `${API_URL}/users/chercher?critere=${searchType}&valeur=${searchTerm}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data);
        showNotification(`✅ ${data.data.length} résultat(s) trouvé(s)`);
      }
    } catch (err) {
      const filtered = users.filter(u => {
        const term = searchTerm.toLowerCase();
        if (searchType === 'nom') {
          return u[1]?.toLowerCase().includes(term) || u[2]?.toLowerCase().includes(term);
        } else if (searchType === 'login') {
          return u[7]?.toLowerCase().includes(term);
        } else if (searchType === 'poste') {
          return u[9]?.toLowerCase().includes(term);
        }
        return false;
      });
      setUsers(filtered);
      showNotification(`✅ ${filtered.length} résultat(s) trouvé(s)`);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditMode(null);
    setFormData({
      nompers: '', prenompers: '', adrpers: '', villepers: '', 
      telpers: '', login: '', motP: '', codeposte: ''
    });
  };

  const handleChangePassword = async (idpers, login) => {
    const oldPass = prompt(`🔒 Changement de mot de passe pour "${login}"\n\nEntrez l'ancien mot de passe:`);
    if (!oldPass) return;
    
    const newPass = prompt('Entrez le nouveau mot de passe:');
    if (!newPass) return;
    
    const confirmPass = prompt('Confirmez le nouveau mot de passe:');
    if (newPass !== confirmPass) {
      showNotification('❌ Les mots de passe ne correspondent pas', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/changer-mot-de-passe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, ancien_motP: oldPass, nouveau_motP: newPass })
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification('✅ Mot de passe modifié avec succès');
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur: ' + err.message, 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user[1]?.toLowerCase().includes(term) ||
      user[2]?.toLowerCase().includes(term) ||
      user[7]?.toLowerCase().includes(term) ||
      user[9]?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="text-purple-600" size={32} />
            Gestion des Utilisateurs
          </h2>
          <p className="text-gray-600 mt-1">
            Package: <code className="bg-gray-100 px-2 py-1 rounded">pkg_gestion_utilisateurs</code>
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-xl transition-all font-semibold"
        >
          <Plus size={20} />
          Nouvel Utilisateur
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold mb-2 text-gray-700">🔍 Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, login, poste..."
                className="w-full pl-10 pr-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm font-bold mb-2 text-gray-700">Type</label>
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg"
            >
              <option value="nom">Nom</option>
              <option value="login">Login</option>
              <option value="poste">Poste</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
          >
            <Search size={20} />
            Rechercher
          </button>
          <button
            onClick={() => { setSearchTerm(''); loadData(); }}
            className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
            title="Réinitialiser"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-300 shadow-lg">
          <h3 className="font-bold text-purple-900 mb-4 text-xl flex items-center gap-2">
            {editMode ? (
              <><Edit className="bg-blue-600 text-white p-1 rounded" size={24} /> Modifier l'utilisateur</>
            ) : (
              <><Plus className="bg-purple-600 text-white p-1 rounded" size={24} /> Nouvel utilisateur</>
            )}
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">👤 Nom *</label>
              <input 
                type="text" 
                value={formData.nompers} 
                onChange={(e) => setFormData({...formData, nompers: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Ex: Ben Ali"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">👤 Prénom *</label>
              <input 
                type="text" 
                value={formData.prenompers} 
                onChange={(e) => setFormData({...formData, prenompers: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Ex: Ahmed"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">📍 Adresse *</label>
              <input 
                type="text" 
                value={formData.adrpers} 
                onChange={(e) => setFormData({...formData, adrpers: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Ex: Rue Principale"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">🏙️ Ville *</label>
              <input 
                type="text" 
                value={formData.villepers} 
                onChange={(e) => setFormData({...formData, villepers: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Ex: Tunis"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">📱 Téléphone (8 chiffres) *</label>
              <input 
                type="text" 
                value={formData.telpers} 
                onChange={(e) => setFormData({...formData, telpers: e.target.value.replace(/\D/g, '').slice(0, 8)})} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Ex: 12345678"
                maxLength="8"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">🔐 Login *</label>
              <input 
                type="text" 
                value={formData.login} 
                onChange={(e) => setFormData({...formData, login: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Ex: ahmed.benali"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">🔑 Mot de passe {editMode ? '' : '*'}</label>
              <input 
                type="password" 
                value={formData.motP} 
                onChange={(e) => setFormData({...formData, motP: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder={editMode ? "Laisser vide pour ne pas modifier" : "Mot de passe"}
                required={!editMode}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">💼 Poste *</label>
              <select 
                value={formData.codeposte} 
                onChange={(e) => setFormData({...formData, codeposte: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                required
              >
                <option value="">Sélectionner...</option>
                {postes.map(p => (
                  <option key={p[0]} value={p[0]}>
                    {p[1]} (Indice: {p[2]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-bold flex items-center gap-2">
              <Check size={20} />
              {editMode ? 'Modifier' : 'Créer'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 font-bold flex items-center gap-2">
              <X size={20} />
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border-2 border-gray-200 rounded-xl shadow-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">ID</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Nom Complet</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Login</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Poste</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Ville</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Téléphone</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <Users size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Aucun utilisateur trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={idx} className="border-b hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-purple-600">#{user[0]}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {user[1]} {user[2]}
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono font-semibold">
                          {user[7]}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-4 py-2 bg-purple-200 text-purple-900 rounded-full text-xs font-black uppercase">
                          {user[9]}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{user[4]}</td>
                      <td className="px-6 py-4 font-mono">{user[5]}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(user)} 
                            className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-all" 
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleChangePassword(user[0], user[7])} 
                            className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-all" 
                            title="Changer mot de passe"
                          >
                            <Lock size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user[0], user[7])} 
                            className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-all" 
                            title="Désactiver"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 rounded-lg border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700">
              📊 Total: <span className="text-purple-600 text-lg">{filteredUsers.length}</span> utilisateur(s) actif(s)
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== SECTION PRIVILÈGES ====================
function PrivilegesSection({ showNotification }) {
  const [postes, setPostes] = useState([]);
  const [formData, setFormData] = useState({ username: '', codeposte: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPostes();
  }, []);

  const loadPostes = async () => {
    try {
      const res = await fetch(`${API_URL}/postes`);
      const data = await res.json();
      if (data.success) setPostes(data.data);
    } catch (err) {
      showNotification('❌ Erreur chargement postes', 'error');
    }
  };

  const handleCreerSchemas = async () => {
    if (!window.confirm('⚠️ Créer tous les schémas externes (vues) ?\n\nCette opération va créer/recréer les vues nécessaires.')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/privileges/creer-schemas`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        showNotification('✅ Schémas externes créés avec succès');
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGererPrivileges = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/privileges/gerer-par-poste`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification('✅ Privilèges accordés avec succès');
        setFormData({ username: '', codeposte: '' });
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Shield className="text-red-600" size={32} />
          Gestion des Privilèges Oracle
        </h2>
        <p className="text-gray-600 mt-1">
          Package: <code className="bg-gray-100 px-2 py-1 rounded">pkg_gestion_privileges</code>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-300 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-blue-900 flex items-center gap-2">
            <Database size={28} />
            Schémas Externes (Vues)
          </h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Crée automatiquement toutes les vues nécessaires pour les différents rôles :
          </p>
          <ul className="space-y-2 mb-6 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium">vue_client_commandes</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium">vue_personnel_complet</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium">vue_stats_articles</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="font-medium">vue_livraisons_en_cours</span>
            </li>
          </ul>
          <button 
            onClick={handleCreerSchemas} 
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Database size={24} />
                Créer les Schémas
              </>
            )}
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-300 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-green-900 flex items-center gap-2">
            <Shield size={28} />
            Accorder Privilèges
          </h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Attribue automatiquement les privilèges selon le poste de l'utilisateur Oracle.
          </p>
          <form onSubmit={handleGererPrivileges} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                👤 Nom d'utilisateur Oracle *
              </label>
              <input 
                type="text" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value.toUpperCase()})} 
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono font-bold" 
                placeholder="Ex: USER1, ADMIN2"
                required 
              />
              <p className="text-xs text-gray-500 mt-1">Doit être un utilisateur Oracle valide</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                💼 Poste / Rôle *
              </label>
              <select 
                value={formData.codeposte} 
                onChange={(e) => setFormData({...formData, codeposte: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium" 
                required
              >
                <option value="">Sélectionner un poste...</option>
                {postes.map(p => (
                  <option key={p[0]} value={p[0]}>
                    {p[1]} - {p[0]}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Attribution...
                </>
              ) : (
                <>
                  <Check size={24} />
                  Accorder Privilèges
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border-2 border-yellow-300">
        <h3 className="text-2xl font-bold mb-6 text-yellow-900 flex items-center gap-2">
          <FileText size={28} />
          Informations sur les Privilèges par Poste
        </h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-lg mb-3 text-blue-900">P001 - Magasinier</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>SELECT, INSERT, UPDATE sur <strong>articles</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>SELECT, INSERT, UPDATE sur <strong>commandes</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>SELECT sur <strong>clients</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Accès aux vues statistiques articles</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl border-2 border-purple-200">
            <h4 className="font-bold text-lg mb-3 text-purple-900">P002 - Administrateur</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Tous les droits</strong> sur toutes les tables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Accès à toutes les vues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Exécution de tous les packages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Gestion complète du système</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl border-2 border-green-200">
            <h4 className="font-bold text-lg mb-3 text-green-900">P003 - ChefLivreur</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Tous droits sur <strong>LivraisonCom</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>SELECT, UPDATE sur <strong>commandes</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>SELECT sur <strong>clients, personnel</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Accès vue_livraisons_en_cours</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SECTION PACKAGES (Interactive) ====================
function PackagesSection({ showNotification }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [params, setParams] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const packages = [
    {
      name: 'pkg_messages',
      icon: '💬',
      color: 'from-blue-50 to-cyan-50 border-blue-300',
      description: 'Gère les messages d\'erreur et de succès standardisés pour toute l\'application.',
      functions: [
        { name: 'msg_erreur', desc: 'Retourne un message d\'erreur formaté', params: ['p_message'], returns: 'VARCHAR2' },
        { name: 'msg_succes', desc: 'Retourne un message de succès formaté', params: ['p_message'], returns: 'VARCHAR2' },
        { name: 'msg_info', desc: 'Retourne un message d\'information', params: ['p_message'], returns: 'VARCHAR2' }
      ],
      procedures: []
    },
    {
      name: 'pkg_gestion_commandes',
      icon: '📦',
      color: 'from-purple-50 to-pink-50 border-purple-300',
      description: 'Gère le cycle de vie complet des commandes : création, modification, annulation et recherche.',
      procedures: [
        { name: 'ajouter_commande', desc: 'Crée une nouvelle commande avec ligne de commande', params: ['p_noclt', 'p_refart', 'p_qtecde'], triggers: ['trg_date_commande', 'trg_maj_stock'] },
        { name: 'modifier_etat_commande', desc: 'Modifie l\'état d\'une commande existante', params: ['p_nocde', 'p_nouvel_etat'], triggers: ['trg_audit_commandes'] },
        { name: 'annuler_commande', desc: 'Annule une commande et restaure le stock', params: ['p_nocde'], triggers: [] }
      ],
      functions: [
        { name: 'chercher_commande', desc: 'Recherche une commande par son numéro', params: ['p_nocde'], returns: 'SYS_REFCURSOR' },
        { name: 'chercher_commandes_client', desc: 'Liste toutes les commandes d\'un client', params: ['p_noclt'], returns: 'SYS_REFCURSOR' },
        { name: 'calculer_montant_commande', desc: 'Calcule le montant total d\'une commande', params: ['p_nocde'], returns: 'NUMBER' }
      ]
    },
    {
      name: 'pkg_gestion_livraisons',
      icon: '🚚',
      color: 'from-green-50 to-teal-50 border-green-300',
      description: 'Gère les livraisons : planification, affectation livreurs, suivi et contraintes horaires.',
      procedures: [
        { name: 'ajouter_livraison', desc: 'Planifie une nouvelle livraison pour une commande', params: ['p_nocde', 'p_dateliv', 'p_livreur', 'p_modepay'], triggers: ['trg_limite_livraisons'] },
        { name: 'modifier_livraison', desc: 'Modifie date/livreur d\'une livraison', params: ['p_nocde', 'p_nouvelle_date', 'p_nouveau_livreur'], triggers: ['trg_heure_maj_livraison'] },
        { name: 'supprimer_livraison', desc: 'Supprime une livraison et annule la commande', params: ['p_nocde'], triggers: [] }
      ],
      functions: [
        { name: 'chercher_par_commande', desc: 'Recherche livraison par N° commande', params: ['p_nocde'], returns: 'SYS_REFCURSOR' },
        { name: 'chercher_par_livreur', desc: 'Liste livraisons d\'un livreur', params: ['p_livreur'], returns: 'SYS_REFCURSOR' },
        { name: 'chercher_par_ville', desc: 'Recherche livraisons par code postal', params: ['p_codepostal'], returns: 'SYS_REFCURSOR' }
      ]
    },
    {
      name: 'pkg_gestion_utilisateurs',
      icon: '👥',
      color: 'from-orange-50 to-yellow-50 border-orange-300',
      description: 'Gère les utilisateurs : authentification, création, modification et suppression logique.',
      procedures: [
        { name: 'ajouter_utilisateur', desc: 'Crée un nouvel utilisateur avec ses infos', params: ['p_nom', 'p_prenom', 'p_adr', 'p_ville', 'p_tel', 'p_login', 'p_motP', 'p_poste'], triggers: [] },
        { name: 'modifier_utilisateur', desc: 'Modifie les informations d\'un utilisateur', params: ['p_idpers', 'p_nom', 'p_prenom', 'p_adr', 'p_ville', 'p_tel', 'p_login', 'p_motP', 'p_poste'], triggers: [] },
        { name: 'supprimer_utilisateur', desc: 'Désactive un utilisateur (suppression logique)', params: ['p_idpers'], triggers: [] },
        { name: 'changer_mot_de_passe', desc: 'Change le mot de passe après vérification', params: ['p_login', 'p_ancien_motP', 'p_nouveau_motP'], triggers: [] }
      ],
      functions: [
        { name: 'authentifier', desc: 'Vérifie login/mot de passe', params: ['p_login', 'p_motP'], returns: 'BOOLEAN' },
        { name: 'lister_utilisateurs', desc: 'Liste tous les utilisateurs actifs', params: [], returns: 'SYS_REFCURSOR' },
        { name: 'chercher_utilisateur', desc: 'Recherche par critère', params: ['p_critere', 'p_valeur'], returns: 'SYS_REFCURSOR' }
      ]
    },
    {
      name: 'pkg_gestion_privileges',
      icon: '🛡️',
      color: 'from-red-50 to-pink-50 border-red-300',
      description: 'Gère les privilèges Oracle : création de schémas, attribution de droits par poste.',
      procedures: [
        { name: 'creer_schemas_externes', desc: 'Crée toutes les vues nécessaires', params: [], triggers: [] },
        { name: 'gerer_privileges_par_poste', desc: 'Accorde privilèges selon le poste', params: ['p_username', 'p_codeposte'], triggers: [] },
        { name: 'revoquer_tous_privileges', desc: 'Révoque tous les privilèges d\'un utilisateur', params: ['p_username'], triggers: [] }
      ],
      functions: [
        { name: 'verifier_privilege', desc: 'Vérifie si un utilisateur a un privilège', params: ['p_username', 'p_privilege', 'p_table'], returns: 'BOOLEAN' }
      ]
    }
  ];

  const handleExecute = async () => {
    if (!selectedProcedure) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch(`${API_URL}/packages/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: selectedPackage.name,
          procedure: selectedProcedure.name,
          params: params
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setResult({ type: 'success', data: data.data, message: data.message });
        showNotification('✅ Exécution réussie');
      } else {
        setResult({ type: 'error', message: data.message });
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      setResult({ type: 'error', message: err.message });
      showNotification('❌ Erreur: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Settings className="text-indigo-600" size={32} />
          Packages PL/SQL - Exécution Interactive
        </h2>
        <p className="text-gray-600 mt-1">Exécutez les procédures et fonctions des packages Oracle</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {packages.map((pkg, idx) => (
          <button
            key={idx}
            onClick={() => { setSelectedPackage(pkg); setSelectedProcedure(null); setParams({}); setResult(null); }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedPackage?.name === pkg.name 
                ? 'bg-indigo-100 border-indigo-500 shadow-lg scale-105' 
                : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow'
            }`}
          >
            <div className="text-3xl mb-2">{pkg.icon}</div>
            <div className="font-bold text-sm text-gray-800">{pkg.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {pkg.procedures.length} proc • {pkg.functions.length} func
            </div>
          </button>
        ))}
      </div>

      {selectedPackage && (
        <div className={`bg-gradient-to-br ${selectedPackage.color} p-6 rounded-2xl border-2 shadow-lg`}>
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">{selectedPackage.icon}</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                <code className="bg-white px-3 py-1 rounded">{selectedPackage.name}</code>
              </h3>
              <p className="text-gray-700 mt-2">{selectedPackage.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Procédures */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Activity size={20} className="text-purple-600" />
                Procédures ({selectedPackage.procedures.length})
              </h4>
              <div className="space-y-2">
                {selectedPackage.procedures.map((proc, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedProcedure(proc); setParams({}); setResult(null); }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedProcedure?.name === proc.name
                        ? 'bg-purple-100 border-2 border-purple-400'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <code className="font-bold text-purple-800">{proc.name}</code>
                    <p className="text-xs text-gray-600 mt-1">{proc.desc}</p>
                    {proc.triggers?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {proc.triggers.map((t, ti) => (
                          <span key={ti} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                            ⚡{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Fonctions */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Zap size={20} className="text-blue-600" />
                Fonctions ({selectedPackage.functions.length})
              </h4>
              <div className="space-y-2">
                {selectedPackage.functions.map((func, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedProcedure(func); setParams({}); setResult(null); }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedProcedure?.name === func.name
                        ? 'bg-blue-100 border-2 border-blue-400'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <code className="font-bold text-blue-800">{func.name}</code>
                    <p className="text-xs text-gray-600 mt-1">{func.desc}</p>
                    {func.returns && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                        → {func.returns}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire d'exécution */}
          {selectedProcedure && (
            <div className="mt-6 bg-white p-6 rounded-xl border-2 border-indigo-200">
              <h4 className="font-bold text-lg text-indigo-900 mb-4">
                Exécuter: <code className="bg-indigo-100 px-2 py-1 rounded">{selectedProcedure.name}</code>
              </h4>
              
              {selectedProcedure.params?.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {selectedProcedure.params.map((param, i) => (
                    <div key={i}>
                      <label className="block text-sm font-bold mb-1 text-gray-700">{param}</label>
                      <input
                        type="text"
                        value={params[param] || ''}
                        onChange={(e) => setParams({...params, [param]: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Valeur pour ${param}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-4 italic">Aucun paramètre requis</p>
              )}

              <button
                onClick={handleExecute}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Exécution...</>
                ) : (
                  <><Zap size={20} /> Exécuter</>
                )}
              </button>

              {result && (
                <div className={`mt-4 p-4 rounded-lg ${result.type === 'success' ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                  <h5 className={`font-bold ${result.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {result.type === 'success' ? '✅ Résultat' : '❌ Erreur'}
                  </h5>
                  <pre className="mt-2 text-sm overflow-auto max-h-40">
                    {result.data ? JSON.stringify(result.data, null, 2) : result.message}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl border-2 border-gray-300">
        <h3 className="text-xl font-bold mb-4 text-gray-900">📊 Statistiques Packages</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-blue-600">5</div>
            <div className="text-sm font-semibold text-gray-600">Packages</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-green-600">{packages.reduce((sum, p) => sum + p.procedures.length, 0)}</div>
            <div className="text-sm font-semibold text-gray-600">Procédures</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-purple-600">{packages.reduce((sum, p) => sum + p.functions.length, 0)}</div>
            <div className="text-sm font-semibold text-gray-600">Fonctions</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-red-600">7</div>
            <div className="text-sm font-semibold text-gray-600">Triggers Liés</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SECTION TRIGGERS ====================
function TriggersSection({ showNotification }) {
  const triggers = [
    {
      name: 'trg_verif_article_unique',
      table: 'ARTICLES',
      timing: 'BEFORE INSERT',
      type: 'ROW',
      icon: '📦',
      color: 'from-blue-50 to-indigo-50 border-blue-300',
      description: 'Vérifie qu\'un article avec la même désignation n\'existe pas déjà dans la base.',
      actions: ['Empêche les doublons d\'articles', 'Lève une exception si article existant'],
      appliedOn: 'INSERT sur articles'
    },
    {
      name: 'trg_verif_client_unique',
      table: 'CLIENTS',
      timing: 'BEFORE INSERT',
      type: 'ROW',
      icon: '👤',
      color: 'from-green-50 to-emerald-50 border-green-300',
      description: 'Vérifie qu\'un client avec le même email n\'existe pas déjà.',
      actions: ['Empêche les doublons de clients', 'Vérifie unicité de l\'email'],
      appliedOn: 'INSERT sur clients'
    },
    {
      name: 'trg_date_commande',
      table: 'COMMANDES',
      timing: 'BEFORE INSERT',
      type: 'ROW',
      icon: '📅',
      color: 'from-purple-50 to-pink-50 border-purple-300',
      description: 'Définit automatiquement la date de commande à SYSDATE si non spécifiée.',
      actions: ['Auto-remplissage de DATECDE', 'Initialise l\'état à "EC" (En cours)'],
      appliedOn: 'INSERT sur commandes'
    },
    {
      name: 'trg_audit_commandes',
      table: 'COMMANDES',
      timing: 'AFTER UPDATE',
      type: 'ROW',
      icon: '📝',
      color: 'from-yellow-50 to-orange-50 border-yellow-300',
      description: 'Enregistre dans une table d\'audit tous les changements d\'état des commandes.',
      actions: ['Trace ancien/nouvel état', 'Enregistre date et utilisateur', 'Historique complet des modifications'],
      appliedOn: 'UPDATE sur commandes (changement d\'état)'
    },
    {
      name: 'trg_maj_stock',
      table: 'LIGCDES',
      timing: 'AFTER INSERT',
      type: 'ROW',
      icon: '📉',
      color: 'from-red-50 to-pink-50 border-red-300',
      description: 'Met à jour automatiquement le stock de l\'article après ajout d\'une ligne de commande.',
      actions: ['Décrémente QTEENSTOCK', 'Vérifie disponibilité', 'Lève exception si stock insuffisant'],
      appliedOn: 'INSERT sur ligcdes'
    },
    {
      name: 'trg_limite_livraisons',
      table: 'LIVRAISONCOM',
      timing: 'BEFORE INSERT',
      type: 'ROW',
      icon: '🚫',
      color: 'from-orange-50 to-amber-50 border-orange-300',
      description: 'Limite le nombre de livraisons par livreur et par jour (max 10).',
      actions: ['Compte livraisons du jour', 'Bloque si limite atteinte', 'Protège contre surcharge'],
      appliedOn: 'INSERT sur livraisoncom'
    },
    {
      name: 'trg_heure_maj_livraison',
      table: 'LIVRAISONCOM',
      timing: 'BEFORE UPDATE',
      type: 'ROW',
      icon: '⏰',
      color: 'from-teal-50 to-cyan-50 border-teal-300',
      description: 'Vérifie les contraintes horaires pour modifier une livraison (avant 9h ou 14h).',
      actions: ['Vérifie heure actuelle', 'Bloque modifications tardives', 'Applique règles métier horaires'],
      appliedOn: 'UPDATE sur livraisoncom'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Zap className="text-orange-600" size={32} />
          Triggers Oracle
        </h2>
        <p className="text-gray-600 mt-1">
          Déclencheurs automatiques appliqués lors des opérations CRUD
        </p>
        <div className="mt-2 bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800 font-medium">
            ⚡ Les triggers s'exécutent <strong>automatiquement</strong> par Oracle lors des opérations INSERT, UPDATE ou DELETE sur les tables associées.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {triggers.map((trigger, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${trigger.color} p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all`}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{trigger.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    <code className="bg-white px-3 py-1 rounded">{trigger.name}</code>
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    {trigger.timing}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                    FOR EACH {trigger.type}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{trigger.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="font-bold text-sm text-gray-600 mb-2">📋 Table cible</h4>
                    <code className="px-3 py-1 bg-gray-100 text-gray-800 rounded font-mono font-bold">
                      {trigger.table}
                    </code>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="font-bold text-sm text-gray-600 mb-2">🎯 Déclenché sur</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                      {trigger.appliedOn}
                    </span>
                  </div>
                </div>

                <div className="mt-3 bg-white p-3 rounded-lg">
                  <h4 className="font-bold text-sm text-gray-600 mb-2">⚙️ Actions effectuées</h4>
                  <ul className="space-y-1">
                    {trigger.actions.map((action, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle size={14} className="text-green-600" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl border-2 border-gray-300">
        <h3 className="text-xl font-bold mb-4 text-gray-900">📊 Résumé des Triggers</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-orange-600">{triggers.length}</div>
            <div className="text-sm font-semibold text-gray-600">Triggers Total</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-blue-600">{triggers.filter(t => t.timing.includes('BEFORE')).length}</div>
            <div className="text-sm font-semibold text-gray-600">BEFORE</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-green-600">{triggers.filter(t => t.timing.includes('AFTER')).length}</div>
            <div className="text-sm font-semibold text-gray-600">AFTER</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-purple-600">{new Set(triggers.map(t => t.table)).size}</div>
            <div className="text-sm font-semibold text-gray-600">Tables</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SECTION VIEWS ====================
function ViewsSection({ showNotification }) {
  const [selectedView, setSelectedView] = useState(null);
  const [viewData, setViewData] = useState([]);
  const [loading, setLoading] = useState(false);

  const views = [
    {
      name: 'vue_client_commandes',
      icon: '👥',
      color: 'from-blue-50 to-indigo-50 border-blue-300',
      description: 'Affiche les commandes avec les informations complètes des clients.',
      columns: ['NOCDE', 'DATECDE', 'ETATCDE', 'NOCLT', 'NOMCLT', 'PRENOMCLT', 'VILLECLT', 'MONTANT'],
      source: 'commandes JOIN clients',
      endpoint: '/views/client-commandes'
    },
    {
      name: 'vue_personnel_complet',
      icon: '👔',
      color: 'from-green-50 to-emerald-50 border-green-300',
      description: 'Personnel avec leurs postes et statistiques de livraisons effectuées.',
      columns: ['IDPERS', 'NOMPERS', 'PRENOMPERS', 'POSTE', 'LOGIN', 'NB_LIVRAISONS', 'DERNIERE_LIVRAISON'],
      source: 'personnel JOIN postes LEFT JOIN livraisoncom',
      endpoint: '/views/personnel-complet'
    },
    {
      name: 'vue_stats_articles',
      icon: '📦',
      color: 'from-purple-50 to-pink-50 border-purple-300',
      description: 'Statistiques de vente par article : quantités vendues, CA généré.',
      columns: ['REFART', 'DESART', 'CATEGORIE', 'QTE_VENDUE', 'CA_GENERE', 'STOCK_RESTANT', 'MARGE_MOYENNE'],
      source: 'articles JOIN ligcdes GROUP BY article',
      endpoint: '/views/stats-articles'
    },
    {
      name: 'vue_livraisons_en_cours',
      icon: '🚚',
      color: 'from-orange-50 to-yellow-50 border-orange-300',
      description: 'Livraisons planifiées mais non encore effectuées avec détails complets.',
      columns: ['NOCDE', 'DATELIV', 'LIVREUR_NOM', 'CLIENT_NOM', 'ADRESSE', 'VILLE', 'MODE_PAIEMENT', 'ETAT'],
      source: 'livraisoncom JOIN personnel JOIN commandes JOIN clients WHERE etat = EC',
      endpoint: '/views/livraisons-en-cours'
    }
  ];

  const handleViewData = async (view) => {
    setSelectedView(view);
    setLoading(true);
    setViewData([]);
    
    try {
      const res = await fetch(`${API_URL}${view.endpoint}`);
      const data = await res.json();
      
      if (data.success) {
        setViewData(data.data || []);
        showNotification(`✅ ${data.data?.length || 0} lignes chargées`);
      } else {
        showNotification('❌ ' + data.message, 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Eye className="text-teal-600" size={32} />
          Vues Oracle (Views)
        </h2>
        <p className="text-gray-600 mt-1">
          Consultez les données agrégées des différentes vues de la base
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {views.map((view, idx) => (
          <div 
            key={idx} 
            className={`bg-gradient-to-br ${view.color} p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
              selectedView?.name === view.name ? 'ring-4 ring-teal-400' : ''
            }`}
            onClick={() => handleViewData(view)}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{view.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  <code className="bg-white px-3 py-1 rounded">{view.name}</code>
                </h3>
                <p className="text-gray-700 text-sm mb-3">{view.description}</p>
                
                <div className="bg-white p-3 rounded-lg mb-3">
                  <h4 className="font-bold text-xs text-gray-500 mb-2">COLONNES</h4>
                  <div className="flex flex-wrap gap-1">
                    {view.columns.map((col, i) => (
                      <code key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {col}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Source: <code className="bg-gray-100 px-1 rounded">{view.source}</code>
                  </span>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center gap-2">
                    <Eye size={16} />
                    Aperçu
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aperçu des données */}
      {selectedView && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye size={24} />
              Aperçu: {selectedView.name}
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-600">Chargement des données...</p>
            </div>
          ) : viewData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Database size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Aucune donnée disponible</p>
              <p className="text-sm">Vérifiez que l'API est connectée à la base Oracle</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    {selectedView.columns.map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left font-bold text-gray-700 text-sm">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      {selectedView.columns.map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-3 text-sm text-gray-700">
                          {row[colIdx] ?? '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {viewData.length > 10 && (
                <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                  Affichage des 10 premières lignes sur {viewData.length} total
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl border-2 border-gray-300">
        <h3 className="text-xl font-bold mb-4 text-gray-900">📊 Résumé des Vues</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-teal-600">{views.length}</div>
            <div className="text-sm font-semibold text-gray-600">Vues Total</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-blue-600">{views.reduce((sum, v) => sum + v.columns.length, 0)}</div>
            <div className="text-sm font-semibold text-gray-600">Colonnes</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-green-600">4</div>
            <div className="text-sm font-semibold text-gray-600">Tables Sources</div>
          </div>
          <div className="bg-white p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-purple-600">Temps réel</div>
            <div className="text-sm font-semibold text-gray-600">Actualisation</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SECTION STATISTIQUES ====================
function StatsSection({ showNotification }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stats/global`);
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        showNotification('❌ Erreur chargement statistiques', 'error');
      }
    } catch (err) {
      showNotification('❌ Erreur: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Chargement des statistiques...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl border-2 border-red-200">
        <AlertCircle size={48} className="mx-auto mb-3 text-red-500" />
        <p className="font-semibold text-red-700">Impossible de charger les statistiques</p>
        <button
          onClick={loadStats}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const StatCard = ({ value, label, icon: Icon, color }) => (
    <div className={`bg-gradient-to-br ${color} p-8 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className="text-5xl font-black">{value || 0}</div>
        <Icon size={40} className="opacity-50" />
      </div>
      <p className="text-sm font-bold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 className="text-purple-600" size={32} />
            Statistiques Globales
          </h2>
          <p className="text-gray-600 mt-1">Vue d'ensemble du système en temps réel</p>
        </div>
        <button
          onClick={loadStats}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 flex items-center gap-2 font-semibold"
        >
          <RefreshCw size={20} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          value={stats[0]}
          label="Commandes"
          icon={Package}
          color="from-blue-100 to-blue-200 border-blue-300"
        />
        <StatCard
          value={stats[1]}
          label="Livraisons"
          icon={Truck}
          color="from-green-100 to-green-200 border-green-300"
        />
        <StatCard
          value={stats[2]}
          label="Utilisateurs"
          icon={Users}
          color="from-purple-100 to-purple-200 border-purple-300"
        />
        <StatCard
          value={stats[3]}
          label="Articles"
          icon={Package}
          color="from-orange-100 to-orange-200 border-orange-300"
        />
        <StatCard
          value={stats[4]}
          label="Clients"
          icon={Users}
          color="from-pink-100 to-pink-200 border-pink-300"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
          <h3 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2">
            <Settings size={24} />
            Packages Implémentés
          </h3>
          <ul className="space-y-2">
            {['pkg_messages', 'pkg_gestion_commandes', 'pkg_gestion_livraisons', 'pkg_gestion_utilisateurs', 'pkg_gestion_privileges'].map((pkg, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle size={16} className="text-green-600" />
                <code className="bg-white px-2 py-1 rounded">{pkg}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-orange-200">
          <h3 className="text-xl font-bold mb-4 text-orange-900 flex items-center gap-2">
            <Zap size={24} />
            Triggers Actifs
          </h3>
          <ul className="space-y-2">
            {['trg_verif_article_unique', 'trg_verif_client_unique', 'trg_date_commande', 'trg_audit_commandes', 'trg_maj_stock', 'trg_limite_livraisons', 'trg_heure_maj_livraison'].map((trg, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle size={16} className="text-green-600" />
                <code className="bg-white px-2 py-1 rounded">{trg}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200">
          <h3 className="text-xl font-bold mb-4 text-teal-900 flex items-center gap-2">
            <Eye size={24} />
            Vues Disponibles
          </h3>
          <ul className="space-y-2">
            {['vue_client_commandes', 'vue_personnel_complet', 'vue_stats_articles', 'vue_livraisons_en_cours'].map((vue, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle size={16} className="text-green-600" />
                <code className="bg-white px-2 py-1 rounded">{vue}</code>
              </li>
            ))}
          </ul>
        </div>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [clRes, artRes, persRes] = await Promise.all([
        fetch(`${API_URL}/clients`),
        fetch(`${API_URL}/articles`),
        fetch(`${API_URL}/personnel`)
      ]);
      const [clData, artData, persData] = await Promise.all([
        clRes.json(), 
        artRes.json(), 
        persRes.json()
      ]);
      
      if (clData.success) setClients(clData.data);
      if (artData.success) setArticles(artData.data);
      if (persData.success) setPersonnel(persData.data);
    } catch (err) {
      showNotification('❌ Erreur chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterData = (data, searchFields) => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      searchFields.some(index => 
        item[index]?.toString().toLowerCase().includes(term)
      )
    );
  };

  const filteredClients = filterData(clients, [1, 2, 5, 7]);
  const filteredArticles = filterData(articles, [0, 1, 5]);
  const filteredPersonnel = filterData(personnel, [1, 2, 7, 9]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Database className="text-teal-600" size={32} />
            Tables de Référence
          </h2>
          <p className="text-gray-600 mt-1">Consultation des données : clients, articles, personnel</p>
        </div>
        <button
          onClick={loadAllData}
          className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 flex items-center gap-2 font-semibold"
        >
          <RefreshCw size={20} />
          Actualiser
        </button>
      </div>

      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border-2 border-teal-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher dans les données..."
            className="w-full pl-10 pr-4 py-3 border-2 border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex gap-2 border-b-2">
        <button
          onClick={() => setActiveData('clients')}
          className={`px-6 py-3 border-b-4 font-bold transition-all ${
            activeData === 'clients'
              ? 'border-blue-600 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-blue-600'
          }`}
        >
          👥 Clients ({filteredClients.length})
        </button>
        <button
          onClick={() => setActiveData('articles')}
          className={`px-6 py-3 border-b-4 font-bold transition-all ${
            activeData === 'articles'
              ? 'border-green-600 text-green-600 bg-green-50'
              : 'border-transparent text-gray-600 hover:text-green-600'
          }`}
        >
          📦 Articles ({filteredArticles.length})
        </button>
        <button
          onClick={() => setActiveData('personnel')}
          className={`px-6 py-3 border-b-4 font-bold transition-all ${
            activeData === 'personnel'
              ? 'border-purple-600 text-purple-600 bg-purple-50'
              : 'border-transparent text-gray-600 hover:text-purple-600'
          }`}
        >
          👔 Personnel ({filteredPersonnel.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-gray-200 rounded-xl shadow-lg">
          {activeData === 'clients' && (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">ID</th>
                  <th className="px-6 py-4 text-left font-bold">Nom</th>
                  <th className="px-6 py-4 text-left font-bold">Prénom</th>
                  <th className="px-6 py-4 text-left font-bold">Ville</th>
                  <th className="px-6 py-4 text-left font-bold">Code Postal</th>
                  <th className="px-6 py-4 text-left font-bold">Téléphone</th>
                  <th className="px-6 py-4 text-left font-bold">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((cl, idx) => (
                  <tr key={idx} className="border-b hover:bg-blue-50">
                    <td className="px-6 py-3 font-mono font-bold">{cl[0]}</td>
                    <td className="px-6 py-3 font-semibold">{cl[1]}</td>
                    <td className="px-6 py-3">{cl[2]}</td>
                    <td className="px-6 py-3">{cl[5]}</td>
                    <td className="px-6 py-3 font-mono">{cl[4]}</td>
                    <td className="px-6 py-3 font-mono">{cl[6]}</td>
                    <td className="px-6 py-3 text-sm">{cl[7]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeData === 'articles' && (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-100 to-green-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Réf</th>
                  <th className="px-6 py-4 text-left font-bold">Désignation</th>
                  <th className="px-6 py-4 text-left font-bold">Prix Achat</th>
                  <th className="px-6 py-4 text-left font-bold">Prix Vente</th>
                  <th className="px-6 py-4 text-left font-bold">Marge</th>
                  <th className="px-6 py-4 text-left font-bold">Catégorie</th>
                  <th className="px-6 py-4 text-left font-bold">Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art, idx) => {
                  const marge = ((art[3] - art[2]) / art[2] * 100).toFixed(1);
                  return (
                    <tr key={idx} className="border-b hover:bg-green-50">
                      <td className="px-6 py-3 font-mono font-bold">{art[0]}</td>
                      <td className="px-6 py-3 font-semibold">{art[1]}</td>
                      <td className="px-6 py-3">{Number(art[2]).toFixed(2)} TND</td>
                      <td className="px-6 py-3 font-bold text-green-600">{Number(art[3]).toFixed(2)} TND</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${marge > 20 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {marge}%
                        </span>
                      </td>
                      <td className="px-6 py-3">{art[5]}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${art[6] > 10 ? 'bg-green-100 text-green-800' : art[6] > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {art[6]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeData === 'personnel' && (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-100 to-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">ID</th>
                  <th className="px-6 py-4 text-left font-bold">Nom Complet</th>
                  <th className="px-6 py-4 text-left font-bold">Login</th>
                  <th className="px-6 py-4 text-left font-bold">Poste</th>
                  <th className="px-6 py-4 text-left font-bold">Ville</th>
                  <th className="px-6 py-4 text-left font-bold">Téléphone</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map((p, idx) => (
                  <tr key={idx} className="border-b hover:bg-purple-50">
                    <td className="px-6 py-3 font-mono font-bold">{p[0]}</td>
                    <td className="px-6 py-3 font-semibold">{p[1]} {p[2]}</td>
                    <td className="px-6 py-3">
                      <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{p[7]}</code>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-xs font-bold">
                        {p[9]}
                      </span>
                    </td>
                    <td className="px-6 py-3">{p[4]}</td>
                    <td className="px-6 py-3 font-mono">{p[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
