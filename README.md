# Ressourcerie - Site Web Statique

Site web statique pour une ressourcerie, déployable sur GitHub Pages sans serveur.

## 🚀 Déploiement sur GitHub Pages

1. Créez un nouveau repository sur GitHub
2. Poussez tous les fichiers de ce projet
3. Allez dans Settings > Pages
4. Sélectionnez la branche `main` (ou `master`) comme source
5. Votre site sera disponible à l'adresse : `https://votre-username.github.io/nom-du-repo/`

## 📁 Structure du projet

```
.
├── index.html          # Page publique principale
├── login.html          # Page de connexion
├── admin/
│   └── index.html      # Page d'administration (accessible via /admin/)
├── css/
│   └── styles.css      # Styles CSS
├── js/
│   ├── data.js         # Gestion des données (localStorage + authentification sécurisée)
│   ├── app.js           # Logique de la page publique
│   ├── admin.js         # Logique de la page admin
│   └── login.js         # Logique de la page de connexion
├── images/
│   └── logo.jpeg        # Logo du site
└── SETUP_SECURITY.md    # Guide de configuration sécurisée
```

## 🔐 Identifiants par défaut

**IMPORTANT** : Changez ces identifiants immédiatement après la première connexion !

- **Identifiant** : `admin`
- **Mot de passe** : `admin123`

### Comment changer vos identifiants

1. **Via l'interface admin (Recommandé)** :
   - Connectez-vous à `/admin/`
   - Allez dans la section "Paramètres de sécurité"
   - Entrez votre nouveau identifiant et/ou mot de passe
   - Cliquez sur "Mettre à jour les paramètres"

2. **Consultez `SETUP_SECURITY.md`** pour plus de détails sur la sécurité

### Sécurité

- ✅ Mots de passe hashés avec SHA-256
- ✅ Salt unique par mot de passe
- ✅ Mots de passe jamais stockés en clair

## ✨ Fonctionnalités

- ✅ Affichage des produits par catégorie
- ✅ Recherche de produits
- ✅ Filtrage par catégorie
- ✅ Modal de détail des produits
- ✅ Interface d'administration pour ajouter/supprimer des produits
- ✅ Authentification sécurisée (hashage SHA-256 avec salt)
- ✅ Gestion des identifiants depuis l'interface admin
- ✅ Stockage des données dans le navigateur (localStorage)
- ✅ Design responsive mobile-first
- ✅ URLs propres (/admin/ au lieu de admin.html)

## 📱 Catégories disponibles

- Maison
- Mode
- Jouet
- Bricolage
- Culture
- Sport
- Meubles

## 💾 Stockage des données

Les données sont stockées dans le **localStorage** du navigateur. Cela signifie que :
- Les données sont locales à chaque navigateur
- Les données persistent même après fermeture du navigateur
- Pour partager les données entre utilisateurs, vous devrez exporter/importer les données manuellement

## 🔧 Personnalisation

### Changer le numéro de téléphone

Modifiez le numéro dans `index.html` :

```html
<a href="tel:0123456789" ...>01 23 45 67 89</a>
```

### Ajouter des catégories

Modifiez l'objet `CATEGORIES` dans `js/data.js` :

```javascript
const CATEGORIES = {
    maison: "Maison",
    // ... ajoutez vos catégories ici
};
```

## 📝 Notes

- Les images sont converties en base64 et stockées dans localStorage
- La taille maximale recommandée pour les images est d'environ 1-2 MB par image
- Le site fonctionne entièrement hors ligne une fois chargé
