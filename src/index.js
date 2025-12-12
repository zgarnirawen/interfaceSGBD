// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Créer la racine React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendre l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si vous voulez mesurer les performances de votre app, vous pouvez passer une fonction
// pour enregistrer les résultats (par exemple: reportWebVitals(console.log))
// ou l'envoyer à un endpoint d'analytics. En savoir plus: https://bit.ly/CRA-vitals
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();