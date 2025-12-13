@echo off
REM Script de démarrage pour Windows
cls

echo 🔍 Verification de l'environnement...

REM Verifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js non installe
    pause
    exit /b 1
)
echo ✅ Node.js: 
node --version

REM Verifier npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm non installe
    pause
    exit /b 1
)
echo ✅ npm: 
npm --version

REM Verifier .env
if not exist .env (
    echo ⚠️  Fichier .env non trouvé
    echo Copie de .env.example...
    if exist .env.example (
        copy .env.example .env
    )
    echo.
    echo ⚠️  Veuillez configurer le fichier .env avec vos paramètres Oracle:
    echo   - DB_USER
    echo   - DB_PASSWORD
    echo   - DB_CONNECT_STRING
    pause
    exit /b 1
)
echo ✅ Fichier .env trouve

REM Verifier node_modules
if not exist node_modules (
    echo 📦 Installation des dépendances...
    call npm install
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation
        pause
        exit /b 1
    )
) else (
    echo ✅ node_modules trouve
)

REM Verifier les fichiers essentiels
echo.
echo 📋 Verification des fichiers essentiels...

for %%f in (
    "server.js"
    "src\App.js"
    "src\Login.js"
    "src\AdminDashboard.js"
    "src\ChefLivreurDashboard.js"
    "src\MagasinierDashboard.js"
    "public\index.html"
) do (
    if not exist %%f (
        echo ❌ Fichier manquant: %%f
        pause
        exit /b 1
    )
)
echo ✅ Tous les fichiers essentiels sont presents

echo.
echo 🚀 Demarrage de l'application...
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend: http://localhost:3001
echo.
echo 🔐 Comptes de test disponibles:
echo   - Login: admin / pass1234 (Admin)
echo   - Login: chef / pass1234 (Chef Livreur)
echo   - Login: sami.b / pass1234 (Magasinier)
echo.
echo Appuyez sur CTRL+C pour arreter les serveurs
echo.

call npm run dev

pause
