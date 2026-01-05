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
├── css/
│   └── styles.css      # Styles CSS
├── js/
│   ├── data.js         # Gestion des données (localStorage)
│   ├── app.js           # Logique de la page publique
│   ├── auth.js          # Authentification
│   └── manager.js       # Gestion des produits
└── images/
    └── logo.jpeg        # Logo du site
```

## ✨ Fonctionnalités

- ✅ Affichage des produits par catégorie
- ✅ Recherche de produits
- ✅ Filtrage par catégorie
- ✅ Modal de détail des produits
- ✅ Stockage des données dans le navigateur (localStorage)
- ✅ Design responsive mobile-first

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
