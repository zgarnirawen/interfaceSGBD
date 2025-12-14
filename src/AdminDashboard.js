import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, Truck, UserCheck, Briefcase, Building2, LogOut, Plus, Edit2, Trash2, X, Search, Shield, Settings, Database } from 'lucide-react';
import './AdminDashboard.css';

const API_URL = 'http://localhost:3001/api';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // États
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [livraisons, setLivraisons] = useState([]);
  const [clients, setClients] = useState([]);
  const [postes, setPostes] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [stats, setStats] = useState({});

  // États formulaires
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const [usersRes, articlesRes, commandesRes, livraisonsRes, clientsRes, postesRes, personnelRes, statsRes] = 
        await Promise.all([
          fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/articles`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/commandes`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/livraisons`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/clients`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/postes`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/personnel`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/stats/global`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

      if (usersRes.ok) setUsers((await usersRes.json()).data || []);
      if (articlesRes.ok) setArticles((await articlesRes.json()).data || []);
      if (commandesRes.ok) setCommandes((await commandesRes.json()).data || []);
      if (livraisonsRes.ok) setLivraisons((await livraisonsRes.json()).data || []);
      if (clientsRes.ok) setClients((await clientsRes.json()).data || []);
      if (postesRes.ok) setPostes((await postesRes.json()).data || []);
      if (personnelRes.ok) setPersonnel((await personnelRes.json()).data || []);
      if (statsRes.ok) setStats((await statsRes.json()).data || {});
    } catch (error) {
      showNotification('Erreur lors du chargement des données', 'error');
    }
    setLoading(false);
  };

  // ========== GESTION UTILISATEURS (pkg_gestion_utilisateurs) ==========
  const handleSaveUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const url = editingItem?.idpers 
        ? `${API_URL}/users/modifier`
        : `${API_URL}/users/ajouter`;
      
      const response = await fetch(url, {
        method: editingItem?.idpers ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        showNotification(editingItem ? 'Utilisateur modifié' : 'Utilisateur créé');
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        fetchAllData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  const handleDeleteUser = async (idpers) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/users/supprimer/${idpers}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Utilisateur supprimé');
        fetchAllData();
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  // ========== GESTION ARTICLES ==========
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const endpoint = editingItem?.refart 
        ? `${API_URL}/articles/modifier`
        : `${API_URL}/articles/ajouter`;
      
      const response = await fetch(endpoint, {
        method: editingItem?.refart ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        showNotification(editingItem ? 'Article modifié' : 'Article créé');
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        fetchAllData();
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  const handleDeleteArticle = async (refart) => {
    if (!window.confirm('Êtes-vous sûr?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/articles/supprimer/${refart}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Article supprimé');
        fetchAllData();
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  // ========== GESTION CLIENTS ==========
  const handleSaveClient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const endpoint = editingItem?.noclt 
        ? `${API_URL}/clients/modifier`
        : `${API_URL}/clients/ajouter`;
      
      const response = await fetch(endpoint, {
        method: editingItem?.noclt ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        showNotification(editingItem ? 'Client modifié' : 'Client créé');
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        fetchAllData();
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  const handleDeleteClient = async (noclt) => {
    if (!window.confirm('Êtes-vous sûr?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/clients/supprimer/${noclt}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showNotification('Client supprimé');
        fetchAllData();
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  // ========== GESTION COMMANDES (pkg_gestion_commandes) ==========
  const handleChangeCommandeState = async (nocde, newState) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/commandes/modifier-etat`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nocde, nouvel_etat: newState })
      });

      if (response.ok) {
        showNotification('État modifié avec succès');
        fetchAllData();
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  // ========== GESTION LIVRAISONS (pkg_gestion_livraisons) ==========
  const handleChangeLivraisonState = async (nocde, dateliv, newState) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/livraisons/modifier`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nocde, dateliv, etatliv: newState })
      });

      if (response.ok) {
        showNotification('État de livraison modifié');
        fetchAllData();
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  // ========== GESTION PRIVILÈGES (pkg_gestion_privileges) ==========
  const handleCreerSchemas = async () => {
    if (!window.confirm('Créer tous les schémas externes (vues)?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/privileges/creer-schemas`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Schémas externes créés avec succès');
      }
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  const filteredData = (data, fields) => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchTerm) return data;
    return data.filter(item =>
      fields.some(field => 
        String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid">
            <StatCard icon={<Users size={24} />} title="Utilisateurs" value={stats.totalUsers} color="blue" />
            <StatCard icon={<Package size={24} />} title="Articles" value={stats.totalArticles} color="green" />
            <StatCard icon={<ShoppingCart size={24} />} title="Commandes" value={stats.totalCommandes} color="yellow" />
            <StatCard icon={<Truck size={24} />} title="Livraisons" value={stats.totalLivraisons} color="purple" />
            <StatCard icon={<UserCheck size={24} />} title="Clients" value={stats.totalClients} color="indigo" />
            <StatCard icon={<Briefcase size={24} />} title="Postes" value={stats.totalPostes} color="pink" />
            <StatCard icon={<Building2 size={24} />} title="Personnel" value={stats.totalPersonnel} color="cyan" />
          </div>
        );

      case 'users':
        return <UsersManagement 
          users={users} 
          postes={postes}
          onEdit={(item) => { setEditingItem(item); setFormData(item); setShowForm(true); }} 
          onDelete={handleDeleteUser} 
          onAdd={() => { setEditingItem(null); setFormData({}); setShowForm(true); }}
          searchTerm={searchTerm} 
          filteredData={filteredData} 
          showForm={showForm} 
          setShowForm={setShowForm} 
          editingItem={editingItem} 
          formData={formData} 
          setFormData={setFormData} 
          onSave={handleSaveUser} 
        />;

      case 'articles':
        return <ArticlesManagement 
          articles={articles} 
          onEdit={(item) => { setEditingItem(item); setFormData(item); setShowForm(true); }} 
          onDelete={handleDeleteArticle} 
          onAdd={() => { setEditingItem(null); setFormData({}); setShowForm(true); }}
          searchTerm={searchTerm} 
          filteredData={filteredData} 
          showForm={showForm} 
          setShowForm={setShowForm} 
          editingItem={editingItem} 
          formData={formData} 
          setFormData={setFormData} 
          onSave={handleSaveArticle} 
        />;

      case 'commandes':
        return <CommandesManagement 
          commandes={commandes} 
          onStateChange={handleChangeCommandeState} 
          searchTerm={searchTerm} 
          filteredData={filteredData} 
        />;

      case 'livraisons':
        return <LivraisonsManagement 
          livraisons={livraisons} 
          onStateChange={handleChangeLivraisonState} 
          searchTerm={searchTerm} 
          filteredData={filteredData} 
        />;

      case 'clients':
        return <ClientsManagement 
          clients={clients} 
          onEdit={(item) => { setEditingItem(item); setFormData(item); setShowForm(true); }} 
          onDelete={handleDeleteClient} 
          onAdd={() => { setEditingItem(null); setFormData({}); setShowForm(true); }}
          searchTerm={searchTerm} 
          filteredData={filteredData} 
          showForm={showForm} 
          setShowForm={setShowForm} 
          editingItem={editingItem} 
          formData={formData} 
          setFormData={setFormData} 
          onSave={handleSaveClient} 
        />;

      case 'postes':
        return <PostesManagement postes={postes} searchTerm={searchTerm} filteredData={filteredData} />;

      case 'personnel':
        return <PersonnelManagement personnel={personnel} postes={postes} searchTerm={searchTerm} filteredData={filteredData} />;

      case 'privileges':
        return <PrivilegesManagement postes={postes} onCreerSchemas={handleCreerSchemas} />;

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-header">
        <div className="header-content">
          <h1 className="header-title">Admin Dashboard</h1>
          <div className="header-user">
            <span>Bienvenue, {user.nompers} {user.prenompers}</span>
            <button onClick={onLogout} className="logout-btn">
              <LogOut size={20} /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <TabButton icon={<Package size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <TabButton icon={<Users size={20} />} label="Utilisateurs" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <TabButton icon={<Package size={20} />} label="Articles" active={activeTab === 'articles'} onClick={() => setActiveTab('articles')} />
        <TabButton icon={<ShoppingCart size={20} />} label="Commandes" active={activeTab === 'commandes'} onClick={() => setActiveTab('commandes')} />
        <TabButton icon={<Truck size={20} />} label="Livraisons" active={activeTab === 'livraisons'} onClick={() => setActiveTab('livraisons')} />
        <TabButton icon={<UserCheck size={20} />} label="Clients" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
        <TabButton icon={<Briefcase size={20} />} label="Postes" active={activeTab === 'postes'} onClick={() => setActiveTab('postes')} />
        <TabButton icon={<Building2 size={20} />} label="Personnel" active={activeTab === 'personnel'} onClick={() => setActiveTab('personnel')} />
        <TabButton icon={<Shield size={20} />} label="Privilèges" active={activeTab === 'privileges'} onClick={() => setActiveTab('privileges')} />
      </div>

      {activeTab !== 'dashboard' && activeTab !== 'privileges' && (
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="admin-content">
        {loading ? <div className="loading">Chargement...</div> : renderContent()}
      </div>
    </div>
  );
}

// ========== COMPOSANTS ==========
function TabButton({ icon, label, active, onClick }) {
  return (
    <button className={`tab-button ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className={`stat-card bg-${color}-50 border-${color}-200`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value || 0}</p>
      </div>
    </div>
  );
}

// Composants de gestion à ajouter dans AdminDashboard.js

// ========== USERS MANAGEMENT ==========
function UsersManagement({ users, postes, onEdit, onDelete, onAdd, searchTerm, filteredData, showForm, setShowForm, editingItem, formData, setFormData, onSave }) {
  const filtered = filteredData(users, ['login', 'nompers', 'prenompers']);
  const sorted = [...filtered].sort((a, b) => (a.idpers || 0) - (b.idpers || 0));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Utilisateurs (pkg_gestion_utilisateurs)</h2>
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {showForm && (
        <FormModal 
          title={editingItem ? 'Modifier' : 'Ajouter'}
          onClose={() => setShowForm(false)}
          onSubmit={onSave}
          formData={formData}
          setFormData={setFormData}
          fields={[
            { name: 'nompers', label: 'Nom', type: 'text', required: true },
            { name: 'prenompers', label: 'Prénom', type: 'text', required: true },
            { name: 'adrpers', label: 'Adresse', type: 'text', required: true },
            { name: 'villepers', label: 'Ville', type: 'text', required: true },
            { name: 'telpers', label: 'Téléphone (8 chiffres)', type: 'text', required: true, maxLength: 8 },
            { name: 'login', label: 'Login', type: 'text', required: true, disabled: !!editingItem },
            { name: 'motP', label: 'Mot de passe', type: 'password', required: !editingItem },
            { name: 'codeposte', label: 'Code Poste', type: 'select', required: true, options: postes.map(p => ({ value: p.codeposte, label: `${p.libposte} (${p.codeposte})` })) }
          ]}
        />
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Login</th>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Ville</th>
            <th>Poste</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(user => (
            <tr key={user.idpers}>
              <td>{user.idpers}</td>
              <td>{user.login}</td>
              <td>{user.nompers} {user.prenompers}</td>
              <td>{user.telpers}</td>
              <td>{user.villepers}</td>
              <td><span className="badge badge-pr">{user.poste_libelle}</span></td>
              <td>
                <button className="btn-edit" onClick={() => onEdit(user)}><Edit2 size={16} /></button>
                <button className="btn-delete" onClick={() => onDelete(user.idpers)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== ARTICLES MANAGEMENT ==========
function ArticlesManagement({ articles, onEdit, onDelete, onAdd, searchTerm, filteredData, showForm, setShowForm, editingItem, formData, setFormData, onSave }) {
  const filtered = filteredData(articles, ['refart', 'designation', 'categorie']);
  const sorted = [...filtered].sort((a, b) => (a.refart || '').localeCompare(b.refart || ''));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Articles</h2>
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {showForm && (
        <FormModal 
          title={editingItem ? 'Modifier' : 'Ajouter'}
          onClose={() => setShowForm(false)}
          onSubmit={onSave}
          formData={formData}
          setFormData={setFormData}
          fields={[
            { name: 'refart', label: 'Référence', type: 'text', required: true, disabled: !!editingItem, maxLength: 4 },
            { name: 'designation', label: 'Désignation', type: 'text', required: true },
            { name: 'prixA', label: 'Prix Achat', type: 'number', required: true, step: '0.01' },
            { name: 'prixV', label: 'Prix Vente', type: 'number', required: true, step: '0.01' },
            { name: 'categorie', label: 'Catégorie', type: 'text' },
            { name: 'qtestk', label: 'Stock', type: 'number', required: true },
            { name: 'codetva', label: 'Code TVA', type: 'text' }
          ]}
        />
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Réf</th>
            <th>Désignation</th>
            <th>Catégorie</th>
            <th>Prix Achat</th>
            <th>Prix Vente</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(art => (
            <tr key={art.refart}>
              <td>{art.refart}</td>
              <td>{art.designation}</td>
              <td>{art.categorie}</td>
              <td>{art.prixA} DT</td>
              <td>{art.prixV} DT</td>
              <td><span className={`badge ${art.qtestk < 10 ? 'badge-an' : art.qtestk < 50 ? 'badge-ec' : 'badge-lv'}`}>{art.qtestk}</span></td>
              <td>
                <button className="btn-edit" onClick={() => onEdit(art)}><Edit2 size={16} /></button>
                <button className="btn-delete" onClick={() => onDelete(art.refart)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== CLIENTS MANAGEMENT ==========
function ClientsManagement({ clients, onEdit, onDelete, onAdd, searchTerm, filteredData, showForm, setShowForm, editingItem, formData, setFormData, onSave }) {
  const filtered = filteredData(clients, ['nomclt', 'prenomclt', 'telclt']);
  const sorted = [...filtered].sort((a, b) => (a.noclt || 0) - (b.noclt || 0));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Clients</h2>
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={20} /> Ajouter
        </button>
      </div>

      {showForm && (
        <FormModal 
          title={editingItem ? 'Modifier' : 'Ajouter'}
          onClose={() => setShowForm(false)}
          onSubmit={onSave}
          formData={formData}
          setFormData={setFormData}
          fields={[
            { name: 'nomclt', label: 'Nom', type: 'text', required: true },
            { name: 'prenomclt', label: 'Prénom', type: 'text' },
            { name: 'telclt', label: 'Téléphone (8 chiffres)', type: 'text', required: true, maxLength: 8 },
            { name: 'adrmail', label: 'Email', type: 'email' },
            { name: 'adrclt', label: 'Adresse', type: 'text', required: true },
            { name: 'code_postal', label: 'Code Postal', type: 'text' },
            { name: 'villeclt', label: 'Ville', type: 'text', required: true }
          ]}
        />
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Ville</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(client => (
            <tr key={client.noclt}>
              <td>{client.noclt}</td>
              <td>{client.nomclt} {client.prenomclt}</td>
              <td>{client.telclt}</td>
              <td>{client.adrmail}</td>
              <td>{client.villeclt}</td>
              <td>
                <button className="btn-edit" onClick={() => onEdit(client)}><Edit2 size={16} /></button>
                <button className="btn-delete" onClick={() => onDelete(client.noclt)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== COMMANDES MANAGEMENT ==========
function CommandesManagement({ commandes, onStateChange, searchTerm, filteredData }) {
  const filtered = filteredData(commandes, ['nocde', 'nomclt', 'etatcde']);
  const sorted = [...filtered].sort((a, b) => new Date(b.datecde) - new Date(a.datecde));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Commandes (pkg_gestion_commandes)</h2>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Client</th>
            <th>Date</th>
            <th>Montant</th>
            <th>État</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(cmd => (
            <tr key={cmd.nocde}>
              <td>{cmd.nocde}</td>
              <td>{cmd.nomclt} {cmd.prenomclt}</td>
              <td>{new Date(cmd.datecde).toLocaleDateString('fr-FR')}</td>
              <td>{cmd.montant_total} DT</td>
              <td>
                <select 
                  value={cmd.etatcde || 'EC'} 
                  onChange={(e) => onStateChange(cmd.nocde, e.target.value)}
                  className="select-state"
                >
                  <option value="EC">EC - En Cours</option>
                  <option value="PR">PR - Prête</option>
                  <option value="LI">LI - Livrée</option>
                  <option value="SO">SO - Soldée</option>
                  <option value="AN">AN - Annulée</option>
                </select>
              </td>
              <td>
                <span className={`badge badge-${(cmd.etatcde || 'EC').toLowerCase()}`}>
                  {cmd.etatcde || 'EC'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== LIVRAISONS MANAGEMENT ==========
function LivraisonsManagement({ livraisons, onStateChange, searchTerm, filteredData }) {
  const filtered = filteredData(livraisons, ['nocde', 'nomclt', 'etatliv']);
  const sorted = [...filtered].sort((a, b) => new Date(b.dateliv) - new Date(a.dateliv));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Livraisons (pkg_gestion_livraisons)</h2>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>N° Commande</th>
            <th>Client</th>
            <th>Date Livraison</th>
            <th>Livreur</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(liv => (
            <tr key={`${liv.nocde}-${liv.dateliv}`}>
              <td>{liv.nocde}</td>
              <td>{liv.nomclt} {liv.prenomclt}</td>
              <td>{new Date(liv.dateliv).toLocaleDateString('fr-FR')}</td>
              <td>{liv.livreur_nom} {liv.livreur_prenom}</td>
              <td>
                <select 
                  value={liv.etatliv || 'EC'} 
                  onChange={(e) => {
                    const dateStr = new Date(liv.dateliv).toISOString().split('T')[0];
                    onStateChange(liv.nocde, dateStr, e.target.value);
                  }}
                  className="select-state"
                >
                  <option value="EC">EC - En Cours</option>
                  <option value="LI">LI - En Livraison</option>
                  <option value="AL">AL - Annulée</option>
                </select>
              </td>
              <td>
                <span className={`badge badge-${(liv.etatliv || 'EC').toLowerCase()}`}>
                  {liv.etatliv || 'EC'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== POSTES & PERSONNEL ==========
function PostesManagement({ postes, searchTerm, filteredData }) {
  const filtered = filteredData(postes, ['codeposte', 'libposte']);

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Postes</h2>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>Code</th><th>Libellé</th><th>Indice</th></tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.codeposte}>
              <td>{p.codeposte}</td>
              <td>{p.libposte}</td>
              <td>{p.indice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PersonnelManagement({ personnel, postes, searchTerm, filteredData }) {
  const filtered = filteredData(personnel, ['nompers', 'prenompers', 'codeposte']);

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion du Personnel</h2>
      </div>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Nom</th><th>Prénom</th><th>Poste</th></tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.idpers}>
              <td>{p.idpers}</td>
              <td>{p.nompers}</td>
              <td>{p.prenompers}</td>
              <td>{p.poste_libelle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========== PRIVILEGES MANAGEMENT ==========
function PrivilegesManagement({ postes, onCreerSchemas }) {
  const [formPriv, setFormPriv] = useState({ username: '', codeposte: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/privileges/gerer-par-poste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formPriv)
      });
      if (response.ok) {
        alert('Privilèges accordés avec succès');
        setFormPriv({ username: '', codeposte: '' });
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Privilèges (pkg_gestion_privileges)</h2>
      </div>

      <div className="grid" style={{gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem'}}>
        <div className="card">
          <h3>Créer les Schémas Externes</h3>
          <p>Crée toutes les vues nécessaires pour les différents rôles</p>
          <button onClick={onCreerSchemas} className="btn-primary" style={{marginTop: '1rem'}}>
            <Database size={20} /> Créer les Schémas
          </button>
        </div>

        <div className="card">
          <h3>Accorder Privilèges</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username Oracle</label>
              <input 
                type="text" 
                value={formPriv.username}
                onChange={(e) => setFormPriv({...formPriv, username: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Poste</label>
              <select 
                value={formPriv.codeposte}
                onChange={(e) => setFormPriv({...formPriv, codeposte: e.target.value})}
                required
              >
                <option value="">Sélectionner...</option>
                {postes.map(p => (
                  <option key={p.codeposte} value={p.codeposte}>{p.libposte}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">
              <Shield size={20} /> Accorder Privilèges
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ========== FORM MODAL ==========
function FormModal({ title, onClose, onSubmit, formData, setFormData, fields }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={onSubmit} className="form-body">
          {fields.map(field => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                >
                  <option value="">Sélectionner...</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  disabled={field.disabled}
                  maxLength={field.maxLength}
                  step={field.step}
                />
              )}
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" className="btn-save">Enregistrer</button>
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;