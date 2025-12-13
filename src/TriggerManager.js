import React, { useState, useEffect } from 'react';
import './TriggerManager.css';

const TriggerManager = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [triggers, setTriggers] = useState({
    articles: [
      {
        id: 1,
        name: 'trg_verif_article_unique',
        type: 'BEFORE INSERT',
        table: 'ARTICLES',
        description: 'Vérifie l\'unicité de la référence article',
        purpose: 'Prévient les doublons',
        event: 'Levée de l\'erreur -20016 si article existe déjà'
      }
    ],
    clients: [
      {
        id: 2,
        name: 'trg_verif_client_unique',
        type: 'BEFORE INSERT',
        table: 'CLIENTS',
        description: 'Vérifie l\'unicité du client (nom + prénom + tél)',
        purpose: 'Prévient les doublons de clients',
        event: 'Levée de l\'erreur -20017 si client existe déjà'
      }
    ],
    commandes: [
      {
        id: 3,
        name: 'trg_date_commande',
        type: 'BEFORE INSERT',
        table: 'COMMANDES',
        description: 'Initialise la date et l\'état de la commande',
        purpose: 'Définit automatiquement datecde=SYSDATE et etatcde=\'EC\'',
        event: 'À chaque insertion de commande'
      },
      {
        id: 4,
        name: 'trg_audit_commandes',
        type: 'AFTER UPDATE',
        table: 'COMMANDES',
        description: 'Enregistre les modifications de statut',
        purpose: 'Crée une trace d\'audit des changements d\'état',
        event: 'Insertion dans audit_commandes avec ancien/nouvel état'
      }
    ],
    ligcdes: [
      {
        id: 5,
        name: 'trg_maj_stock',
        type: 'AFTER INSERT',
        table: 'LIGCDES',
        description: 'Met à jour le stock après ajout d\'une ligne de commande',
        purpose: 'Décrémente automatiquement la quantité en stock',
        event: 'Réduit qtestk de l\'article par qtecde'
      }
    ],
    livraison: [
      {
        id: 6,
        name: 'trg_limite_livraisons',
        type: 'BEFORE INSERT OR UPDATE',
        table: 'LIVRAISONCOM',
        description: 'Contrôle les limites de livraisons',
        purpose: 'Valide les règles de livraison',
        event: 'Levée d\'erreur si règles non respectées'
      },
      {
        id: 7,
        name: 'trg_heure_maj_livraison',
        type: 'AFTER UPDATE',
        table: 'LIVRAISONCOM',
        description: 'Enregistre la date/heure de modification',
        purpose: 'Met à jour l\'historique des modifications',
        event: 'Mise à jour de heure_maj_livraison'
      }
    ]
  });

  const [crudData, setCrudData] = useState({
    articles: [],
    clients: [],
    commandes: [],
    personnel: []
  });

  const [formData, setFormData] = useState({
    refart: '',
    designation: '',
    prixA: '',
    prixV: '',
    codetva: '1',
    categorie: '',
    qtestk: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/articles');
      const data = await response.json();
      if (data.success) {
        setCrudData(prev => ({ ...prev, articles: data.data || [] }));
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    
    if (!formData.refart || !formData.designation || !formData.prixA || !formData.prixV) {
      setMessage('Tous les champs obligatoires doivent être remplis');
      return;
    }

    if (parseFloat(formData.prixV) <= parseFloat(formData.prixA)) {
      setMessage('Le prix de vente doit être supérieur au prix d\'achat');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Article ajouté avec succès!');
        setFormData({
          refart: '',
          designation: '',
          prixA: '',
          prixV: '',
          codetva: '1',
          categorie: '',
          qtestk: ''
        });
        fetchArticles();
      } else {
        setMessage(`Erreur: ${data.message}`);
      }
    } catch (error) {
      setMessage(`Erreur: ${error.message}`);
    }
  };

  const getTriggerColor = (type) => {
    switch(type) {
      case 'BEFORE INSERT': return '#FF6B6B';
      case 'BEFORE UPDATE': return '#FF8C42';
      case 'AFTER INSERT': return '#4ECDC4';
      case 'AFTER UPDATE': return '#45B7D1';
      case 'BEFORE INSERT OR UPDATE': return '#FFA07A';
      default: return '#95E1D3';
    }
  };

  const getTriggerTypeLabel = (type) => {
    const labels = {
      'BEFORE INSERT': '🔒 Avant Insertion',
      'BEFORE UPDATE': '🔒 Avant Modification',
      'AFTER INSERT': '✓ Après Insertion',
      'AFTER UPDATE': '✓ Après Modification',
      'BEFORE INSERT OR UPDATE': '🔒 Avant Insert/Modif'
    };
    return labels[type] || type;
  };

  return (
    <div className="trigger-manager">
      <div className="trigger-container">
        <h1 className="main-title">🔥 Gestionnaire de Triggers Oracle</h1>
        <p className="subtitle">Gestion complète des triggers et CRUD des données</p>

        {message && (
          <div className={`message ${message.includes('Erreur') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'triggers' ? 'active' : ''}`}
            onClick={() => setActiveTab('triggers')}
          >
            🔥 Triggers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            📦 Articles (CRUD)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            👥 Clients
          </button>
          <button 
            className={`tab-btn ${activeTab === 'commandes' ? 'active' : ''}`}
            onClick={() => setActiveTab('commandes')}
          >
            📋 Commandes
          </button>
        </div>

        {activeTab === 'triggers' && (
          <div className="triggers-section">
            <h2>📋 Vue d'ensemble des Triggers</h2>
            
            <div className="trigger-categories">
              {Object.entries(triggers).map(([category, triggerList]) => (
                <div key={category} className="trigger-category">
                  <h3 className="category-title">
                    {category === 'articles' && '📦 Table ARTICLES'}
                    {category === 'clients' && '👥 Table CLIENTS'}
                    {category === 'commandes' && '📋 Table COMMANDES'}
                    {category === 'ligcdes' && '📝 Table LIGCDES'}
                    {category === 'livraison' && '🚚 Table LIVRAISONCOM'}
                  </h3>
                  
                  <div className="triggers-grid">
                    {triggerList.map(trigger => (
                      <div key={trigger.id} className="trigger-card">
                        <div className="trigger-header" style={{ borderLeftColor: getTriggerColor(trigger.type) }}>
                          <div className="trigger-title">
                            <h4>{trigger.name}</h4>
                            <span className="trigger-type" style={{ backgroundColor: getTriggerColor(trigger.type) }}>
                              {getTriggerTypeLabel(trigger.type)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="trigger-content">
                          <div className="trigger-item">
                            <strong>📌 Description:</strong>
                            <p>{trigger.description}</p>
                          </div>
                          
                          <div className="trigger-item">
                            <strong>🎯 Objectif:</strong>
                            <p>{trigger.purpose}</p>
                          </div>
                          
                          <div className="trigger-item">
                            <strong>⚡ Événement:</strong>
                            <p>{trigger.event}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="trigger-summary">
              <h3>📊 Résumé des Triggers</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="count">3</span>
                  <span className="label">BEFORE TRIGGERS</span>
                  <p>Validations avant insertion/modification</p>
                </div>
                <div className="summary-item">
                  <span className="count">3</span>
                  <span className="label">AFTER TRIGGERS</span>
                  <p>Actions après insertion/modification</p>
                </div>
                <div className="summary-item">
                  <span className="count">7</span>
                  <span className="label">TOTAL TRIGGERS</span>
                  <p>Appliqués sur la base de données</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="crud-section">
            <h2>📦 Gestion des Articles</h2>
            
            <form onSubmit={handleAddArticle} className="crud-form">
              <div className="form-group">
                <label>Référence Article *</label>
                <input 
                  type="text" 
                  name="refart" 
                  value={formData.refart}
                  onChange={handleInputChange}
                  placeholder="ex: A011"
                  maxLength="4"
                />
              </div>

              <div className="form-group">
                <label>Désignation *</label>
                <input 
                  type="text" 
                  name="designation" 
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="ex: Stylo bleu"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix Achat *</label>
                  <input 
                    type="number" 
                    name="prixA" 
                    value={formData.prixA}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Prix Vente * (doit être > Prix Achat)</label>
                  <input 
                    type="number" 
                    name="prixV" 
                    value={formData.prixV}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Code TVA</label>
                  <select name="codetva" value={formData.codetva} onChange={handleInputChange}>
                    <option value="1">1 (Taux réduit)</option>
                    <option value="2">2 (Taux normal)</option>
                    <option value="3">3 (Taux majoré)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Catégorie</label>
                  <input 
                    type="text" 
                    name="categorie" 
                    value={formData.categorie}
                    onChange={handleInputChange}
                    placeholder="ex: Bureau"
                  />
                </div>

                <div className="form-group">
                  <label>Quantité Stock</label>
                  <input 
                    type="number" 
                    name="qtestk" 
                    value={formData.qtestk}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit">
                ➕ Ajouter Article
              </button>
            </form>

            <div className="articles-list">
              <h3>📋 Tous les Articles</h3>
              {loading ? (
                <p>Chargement...</p>
              ) : crudData.articles.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Désignation</th>
                      <th>Prix Achat</th>
                      <th>Prix Vente</th>
                      <th>Stock</th>
                      <th>Catégorie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crudData.articles.map(article => (
                      <tr key={article.REFART}>
                        <td>{article.REFART}</td>
                        <td>{article.DESIGNATION}</td>
                        <td>{parseFloat(article.PRIXA).toFixed(2)} TND</td>
                        <td>{parseFloat(article.PRIX_V).toFixed(2)} TND</td>
                        <td className={article.QTESTK < 50 ? 'low-stock' : ''}>{article.QTESTK}</td>
                        <td>{article.CATEGORIE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun article trouvé</p>
              )}
            </div>

            <div className="trigger-info">
              <h4>🔥 Triggers appliqués sur ARTICLES:</h4>
              <ul>
                <li><strong>trg_verif_article_unique</strong> (BEFORE INSERT) - Vérifie que la référence est unique</li>
                <li>Lors de l'insertion: Si un article avec la même ref existe → Erreur -20016</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="crud-section">
            <h2>👥 Gestion des Clients</h2>
            <div className="placeholder-content">
              <p>Module clients en construction...</p>
              <h4>🔥 Triggers appliqués sur CLIENTS:</h4>
              <ul>
                <li><strong>trg_verif_client_unique</strong> (BEFORE INSERT)</li>
                <li>Vérifie l'unicité: NOM + PRÉNOM + TÉLÉPHONE</li>
                <li>Si client existe → Erreur -20017</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'commandes' && (
          <div className="crud-section">
            <h2>📋 Gestion des Commandes</h2>
            <div className="placeholder-content">
              <p>Module commandes en construction...</p>
              <h4>🔥 Triggers appliqués sur COMMANDES:</h4>
              <ul>
                <li><strong>trg_date_commande</strong> (BEFORE INSERT) - Date = SYSDATE, État = 'EC'</li>
                <li><strong>trg_audit_commandes</strong> (AFTER UPDATE) - Enregistre les changements d'état</li>
                <li><strong>trg_maj_stock</strong> (AFTER INSERT sur LIGCDES) - Décrémente le stock</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriggerManager;
