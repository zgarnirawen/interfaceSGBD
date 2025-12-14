import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, Truck, UserCheck, Briefcase, Building2, LogOut, Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import './AdminDashboard.css';

const API_URL = 'http://localhost:3001/api';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // States for each section
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [livraisons, setLivraisons] = useState([]);
  const [clients, setClients] = useState([]);
  const [postes, setPostes] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [stats, setStats] = useState({});

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch all data on component mount
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

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || usersData || []);
      }
      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.data || articlesData || []);
      }
      if (commandesRes.ok) {
        const commandesData = await commandesRes.json();
        setCommandes(commandesData.data || commandesData || []);
      }
      if (livraisonsRes.ok) {
        const livraisonsData = await livraisonsRes.json();
        setLivraisons(livraisonsData.data || livraisonsData || []);
      }
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.data || clientsData || []);
      }
      if (postesRes.ok) {
        const postesData = await postesRes.json();
        setPostes(postesData.data || postesData || []);
      }
      if (personnelRes.ok) {
        const personnelData = await personnelRes.json();
        setPersonnel(personnelData.data || personnelData || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || statsData || {});
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
    setLoading(false);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const url = editingItem?.idpers 
        ? `${API_URL}/users/modifier`
        : `${API_URL}/users/ajouter`;
      
      const method = editingItem?.idpers ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        fetchAllData();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteUser = async (idpers) => {
    if (!window.confirm('Êtes-vous sûr?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/users/supprimer/${idpers}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAllData();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const endpoint = editingItem?.refart 
        ? `${API_URL}/articles/modifier`
        : `${API_URL}/articles/ajouter`;
      
      const method = editingItem?.refart ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        fetchAllData();
      }
    } catch (error) {
      console.error('Erreur:', error);
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
        fetchAllData();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const endpoint = editingItem?.noclt 
        ? `${API_URL}/clients/modifier`
        : `${API_URL}/clients/ajouter`;
      
      const method = editingItem?.noclt ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        fetchAllData();
      }
    } catch (error) {
      console.error('Erreur:', error);
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
        fetchAllData();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleChangeCommandeState = async (nocde, newState) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/commandes/modifier-etat`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nocde, newetat: newState })
      });

      if (response.ok) {
        fetchAllData();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

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
        fetchAllData();
      } else {
        alert('Erreur lors de la modification de la livraison');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur: ' + error.message);
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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users size={24} />} title="Utilisateurs" value={stats.totalUsers} color="blue" />
            <StatCard icon={<Package size={24} />} title="Articles" value={stats.totalArticles} color="green" />
            <StatCard icon={<ShoppingCart size={24} />} title="Commandes" value={stats.totalCommandes} color="yellow" />
            <StatCard icon={<Truck size={24} />} title="Livraisons" value={stats.totalLivraisons} color="purple" />
            <StatCard icon={<UserCheck size={24} />} title="Clients" value={stats.totalClients} color="indigo" />
            <StatCard icon={<Briefcase size={24} />} title="Postes" value={stats.totalPostes} color="pink" />
            <StatCard icon={<Building2 size={24} />} title="Personnels" value={stats.totalPersonnel} color="cyan" />
          </div>
        );

      case 'users':
        return <UsersManagement users={users} onEdit={editUser} onDelete={handleDeleteUser} onAdd={() => addNewUser()} searchTerm={searchTerm} filteredData={filteredData} showForm={showForm} setShowForm={setShowForm} editingItem={editingItem} formData={formData} setFormData={setFormData} onSave={handleSaveUser} />;

      case 'articles':
        return <ArticlesManagement articles={articles} onEdit={editArticle} onDelete={handleDeleteArticle} onAdd={() => addNewArticle()} searchTerm={searchTerm} filteredData={filteredData} showForm={showForm} setShowForm={setShowForm} editingItem={editingItem} formData={formData} setFormData={setFormData} onSave={handleSaveArticle} />;

      case 'commandes':
        return <CommandesManagement commandes={commandes} onStateChange={handleChangeCommandeState} searchTerm={searchTerm} filteredData={filteredData} />;

      case 'livraisons':
        return <LivraisonsManagement livraisons={livraisons} onStateChange={handleChangeLivraisonState} searchTerm={searchTerm} filteredData={filteredData} />;

      case 'clients':
        return <ClientsManagement clients={clients} onEdit={editClient} onDelete={handleDeleteClient} onAdd={() => addNewClient()} searchTerm={searchTerm} filteredData={filteredData} showForm={showForm} setShowForm={setShowForm} editingItem={editingItem} formData={formData} setFormData={setFormData} onSave={handleSaveClient} />;

      case 'postes':
        return <PostesManagement postes={postes} searchTerm={searchTerm} filteredData={filteredData} />;

      case 'personnel':
        return <PersonnelManagement personnel={personnel} postes={postes} searchTerm={searchTerm} filteredData={filteredData} />;

      default:
        return null;
    }
  };

  const editUser = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const addNewUser = () => {
    setEditingItem(null);
    setFormData({ login: '', nompers: '', prenompers: '', codeposte: '' });
    setShowForm(true);
  };

  const editArticle = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const addNewArticle = () => {
    setEditingItem(null);
    setFormData({ libart: '', prixu: '', qtestock: '' });
    setShowForm(true);
  };

  const editClient = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const addNewClient = () => {
    setEditingItem(null);
    setFormData({ nomclt: '', prenomclt: '', telclt: '', adrclt: '' });
    setShowForm(true);
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1 className="header-title">Admin Dashboard</h1>
          <div className="header-user">
            <span>Bienvenue, {user.nompers || user.nomp} {user.prenompers || user.prenomp}</span>
            <button onClick={onLogout} className="logout-btn">
              <LogOut size={20} /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <TabButton icon={<Package size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <TabButton icon={<Users size={20} />} label="Utilisateurs" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <TabButton icon={<Package size={20} />} label="Articles" active={activeTab === 'articles'} onClick={() => setActiveTab('articles')} />
        <TabButton icon={<ShoppingCart size={20} />} label="Commandes" active={activeTab === 'commandes'} onClick={() => setActiveTab('commandes')} />
        <TabButton icon={<Truck size={20} />} label="Livraisons" active={activeTab === 'livraisons'} onClick={() => setActiveTab('livraisons')} />
        <TabButton icon={<UserCheck size={20} />} label="Clients" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
        <TabButton icon={<Briefcase size={20} />} label="Postes" active={activeTab === 'postes'} onClick={() => setActiveTab('postes')} />
        <TabButton icon={<Building2 size={20} />} label="Personnel" active={activeTab === 'personnel'} onClick={() => setActiveTab('personnel')} />
      </div>

      {/* Search bar (except dashboard) */}
      {activeTab !== 'dashboard' && (
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

      {/* Main content */}
      <div className="admin-content">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      className={`tab-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
    pink: 'bg-pink-50 border-pink-200',
    cyan: 'bg-cyan-50 border-cyan-200'
  };

  return (
    <div className={`stat-card ${colors[color]}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value || 0}</p>
      </div>
    </div>
  );
}

function UsersManagement({ users, onEdit, onDelete, onAdd, searchTerm, filteredData, showForm, setShowForm, editingItem, formData, setFormData, onSave }) {
  const filtered = filteredData(users, ['login', 'nompers', 'prenompers']);
  
  // Trier par ID
  const sorted = [...filtered].sort((a, b) => (a.idpers || 0) - (b.idpers || 0));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Utilisateurs</h2>
        <span className="section-count">Total: {sorted.length}</span>
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={20} /> Ajouter un utilisateur
        </button>
      </div>

      {showForm && (
        <FormModal 
          title={editingItem ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          onClose={() => setShowForm(false)}
          onSubmit={onSave}
          formData={formData}
          setFormData={setFormData}
          fields={[
            { name: 'login', label: 'Login', type: 'text', required: true },
            { name: 'nompers', label: 'Nom', type: 'text', required: true },
            { name: 'prenompers', label: 'Prénom', type: 'text', required: true },
            { name: 'telpers', label: 'Téléphone', type: 'text', required: false },
            { name: 'adrpers', label: 'Adresse', type: 'text', required: false },
            { name: 'villepers', label: 'Ville', type: 'text', required: false },
            { name: 'codeposte', label: 'Code Poste (P001/P002/P003)', type: 'text', required: true }
          ]}
        />
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Login</th>
            <th>Nom Complet</th>
            <th>Téléphone</th>
            <th>Adresse</th>
            <th>Ville</th>
            <th>Poste</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(user => (
            <tr key={user.idpers}>
              <td><strong>{user.idpers}</strong></td>
              <td>{user.login}</td>
              <td>{user.nompers} {user.prenompers}</td>
              <td>{user.telpers || '-'}</td>
              <td>{user.adrpers || '-'}</td>
              <td>{user.villepers || '-'}</td>
              <td><span className="badge badge-pr">{user.codeposte}</span></td>
              <td>
                <button className="btn-edit" onClick={() => onEdit(user)} title="Modifier"><Edit2 size={16} /></button>
                <button className="btn-delete" onClick={() => onDelete(user.idpers)} title="Supprimer"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArticlesManagement({ articles, onEdit, onDelete, onAdd, searchTerm, filteredData, showForm, setShowForm, editingItem, formData, setFormData, onSave }) {
  const filtered = filteredData(articles, ['libart', 'refart', 'designation']);
  
  // Trier par référence
  const sorted = [...filtered].sort((a, b) => (a.refart || '').localeCompare(b.refart || ''));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Articles</h2>
        <span className="section-count">Total: {sorted.length}</span>
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={20} /> Ajouter un article
        </button>
      </div>

      {showForm && (
        <FormModal 
          title={editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
          onClose={() => setShowForm(false)}
          onSubmit={onSave}
          formData={formData}
          setFormData={setFormData}
          fields={[
            { name: 'refart', label: 'Référence', type: 'text', required: !editingItem },
            { name: 'designation', label: 'Désignation', type: 'text', required: true },
            { name: 'prixA', label: 'Prix d\'Achat', type: 'number', required: true },
            { name: 'prixV', label: 'Prix de Vente', type: 'number', required: true },
            { name: 'categorie', label: 'Catégorie', type: 'text', required: false },
            { name: 'qtestk', label: 'Quantité Stock', type: 'number', required: true },
            { name: 'codetva', label: 'Code TVA', type: 'text', required: false }
          ]}
        />
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Catégorie</th>
            <th>Prix Achat</th>
            <th>Prix Vente</th>
            <th>Stock</th>
            <th>TVA</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(article => (
            <tr key={article.refart}>
              <td><strong>{article.refart}</strong></td>
              <td>{article.designation}</td>
              <td>{article.categorie || '-'}</td>
              <td className="text-right">{article.prixA || 0} DT</td>
              <td className="text-right">{article.prixV || 0} DT</td>
              <td><span className="badge badge-info">{article.qtestk}</span></td>
              <td>{article.codetva || '-'}</td>
              <td>
                <button className="btn-edit" onClick={() => onEdit(article)} title="Modifier"><Edit2 size={16} /></button>
                <button className="btn-delete" onClick={() => onDelete(article.refart)} title="Supprimer"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClientsManagement({ clients, onEdit, onDelete, onAdd, searchTerm, filteredData, showForm, setShowForm, editingItem, formData, setFormData, onSave }) {
  const filtered = filteredData(clients, ['nomclt', 'prenomclt', 'telclt', 'adrmail']);
  
  // Trier par numéro de client
  const sorted = [...filtered].sort((a, b) => (a.noclt || 0) - (b.noclt || 0));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Clients</h2>
        <span className="section-count">Total: {sorted.length}</span>
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={20} /> Ajouter un client
        </button>
      </div>

      {showForm && (
        <FormModal 
          title={editingItem ? 'Modifier le client' : 'Ajouter un client'}
          onClose={() => setShowForm(false)}
          onSubmit={onSave}
          formData={formData}
          setFormData={setFormData}
          fields={[
            { name: 'nomclt', label: 'Nom', type: 'text', required: true },
            { name: 'prenomclt', label: 'Prénom', type: 'text', required: true },
            { name: 'telclt', label: 'Téléphone', type: 'text', required: true },
            { name: 'adrmail', label: 'Email', type: 'email', required: false },
            { name: 'adrclt', label: 'Adresse', type: 'text', required: false },
            { name: 'code_postal', label: 'Code Postal', type: 'text', required: false },
            { name: 'villeclt', label: 'Ville', type: 'text', required: false }
          ]}
        />
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Nom Complet</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Adresse</th>
            <th>Code Postal</th>
            <th>Ville</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(client => (
            <tr key={client.noclt}>
              <td><strong>{client.noclt}</strong></td>
              <td>{client.nomclt} {client.prenomclt}</td>
              <td>{client.telclt || '-'}</td>
              <td>{client.adrmail || '-'}</td>
              <td>{client.adrclt || '-'}</td>
              <td>{client.code_postal || '-'}</td>
              <td>{client.villeclt || '-'}</td>
              <td>
                <button className="btn-edit" onClick={() => onEdit(client)} title="Modifier"><Edit2 size={16} /></button>
                <button className="btn-delete" onClick={() => onDelete(client.noclt)} title="Supprimer"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommandesManagement({ commandes, onStateChange, searchTerm, filteredData }) {
  const filtered = filteredData(commandes, ['nocde', 'nomclt', 'etatcde']);

  // Trier par date décroissante
  const sorted = [...filtered].sort((a, b) => new Date(b.datecde) - new Date(a.datecde));

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Commandes</h2>
        <span className="section-count">Total: {sorted.length} commande(s)</span>
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
              <td><strong>{cmd.nocde}</strong></td>
              <td>{cmd.nomclt} {cmd.prenomclt}</td>
              <td>{new Date(cmd.datecde).toLocaleDateString('fr-FR')}</td>
              <td className="text-right">{cmd.montant_total} DT</td>
              <td>
                <select 
                  value={cmd.etatcde || 'EC'} 
                  onChange={(e) => onStateChange(cmd.nocde, e.target.value)}
                  className="select-state"
                >
                  <option value="EC">EC - En Cours</option>
                  <option value="PR">PR - Prête</option>
                  <option value="LV">LV - Livrée</option>
                  <option value="AN">AN - Annulée</option>
                </select>
              </td>
              <td>
                <span className={`badge badge-${(cmd.etatcde || 'EC').toLowerCase()}`}>{cmd.etatcde || 'EC'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LivraisonsManagement({ livraisons, onStateChange, searchTerm, filteredData }) {
  const filtered = filteredData(livraisons, ['nocde', 'nomclt', 'etatliv']);

  // Trier par date de livraison décroissante
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.dateliv || 0);
    const dateB = new Date(b.dateliv || 0);
    return dateB - dateA;
  });

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Livraisons</h2>
        <span className="section-count">Total: {sorted.length} | En cours: {sorted.filter(l => l.etatliv === 'LI').length}</span>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>N° Commande</th>
            <th>Client</th>
            <th>Date Commande</th>
            <th>Date Livraison</th>
            <th>Livreur</th>
            <th>Mode Paiement</th>
            <th>État</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(liv => (
            <tr key={`${liv.nocde}-${liv.dateliv}`}>
              <td><strong>{liv.nocde}</strong></td>
              <td>{liv.nomclt} {liv.prenomclt}</td>
              <td>{new Date(liv.datecde).toLocaleDateString('fr-FR')}</td>
              <td><strong>{new Date(liv.dateliv).toLocaleDateString('fr-FR')}</strong></td>
              <td>{liv.livreur_prenom} {liv.livreur_nom}</td>
              <td>
                <span className="badge badge-info">
                  {liv.modepay === 'avant_livraison' ? 'Avant' : 'Après'}
                </span>
              </td>
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

function PostesManagement({ postes, searchTerm, filteredData }) {
  const filtered = filteredData(postes, ['codeposte', 'libposte']);

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Gestion des Postes</h2>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Code Poste</th>
            <th>Libellé</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(poste => (
            <tr key={poste.codeposte}>
              <td>{poste.codeposte}</td>
              <td>{poste.libposte}</td>
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
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Poste</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(pers => (
            <tr key={pers.idpers}>
              <td>{pers.idpers}</td>
              <td>{pers.nompers}</td>
              <td>{pers.prenompers}</td>
              <td>{pers.codeposte}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormModal({ title, onClose, onSubmit, formData, setFormData, fields }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="form-body">
          {fields.map(field => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
              />
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
