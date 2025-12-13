import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';

function Login({ onLoginSuccess }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Sauvegarder le token et les infos utilisateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Erreur lors de la connexion');
      }
    } catch (err) {
      setError('Erreur serveur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card de connexion */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
            <p className="text-gray-600">Système de Gestion de Livraisons</p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Login */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Identifiant
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Entrez votre login"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                required
              />
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Bouton Connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Info de test */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3 font-semibold">Comptes de test disponibles:</p>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="bg-blue-50 p-2 rounded">👤 <strong>Admin:</strong> admin / pass1234</p>
              <p className="bg-green-50 p-2 rounded">🚚 <strong>Chef Livreur:</strong> chef / pass1234</p>
              <p className="bg-yellow-50 p-2 rounded">📦 <strong>Magasinier:</strong> sami.b / pass1234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
