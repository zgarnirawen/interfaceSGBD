#!/bin/bash
# Script de vérification et démarrage de l'application

echo "🔍 Vérification de l'environnement..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non installé"
    exit 1
fi
echo "✅ Node.js: $(node -v)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm non installé"
    exit 1
fi
echo "✅ npm: $(npm -v)"

# Vérifier .env
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé"
    echo "Copie de .env.example..."
    cp .env.example .env
    echo "⚠️  Veuillez configurer le fichier .env avec vos paramètres Oracle"
    exit 1
fi
echo "✅ Fichier .env trouvé"

# Vérifier node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
else
    echo "✅ node_modules trouvé"
fi

# Vérifier les fichiers essentiels
files=(
    "server.js"
    "src/App.js"
    "src/Login.js"
    "src/AdminDashboard.js"
    "src/ChefLivreurDashboard.js"
    "src/MagasinierDashboard.js"
    "public/index.html"
)

for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier manquant: $file"
        exit 1
    fi
done
echo "✅ Tous les fichiers essentiels sont présents"

echo ""
echo "🚀 Démarrage de l'application..."
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend: http://localhost:3001"
echo "🔐 Comptes de test disponibles dans GUIDE_UTILISATION.md"
echo ""

npm run dev
