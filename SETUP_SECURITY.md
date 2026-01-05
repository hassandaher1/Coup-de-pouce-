# 🔐 Configuration Sécurisée des Identifiants

## ⚠️ Important

Par défaut, le système utilise des identifiants temporaires :

- **Identifiant** : `admin`
- **Mot de passe** : `admin123`

**Vous DEVEZ les changer immédiatement après la première connexion !**

## 🔒 Comment changer vos identifiants de façon sécurisée

### Méthode 1 : Via l'interface admin (Recommandé)

1. Connectez-vous avec les identifiants par défaut
2. Allez dans la section **"Paramètres de sécurité"** en bas de la page admin
3. Entrez votre nouveau identifiant et/ou mot de passe
4. Cliquez sur **"Mettre à jour les paramètres"**

**Recommandations pour un mot de passe sécurisé :**

- ✅ Au moins 12 caractères
- ✅ Mélange de majuscules, minuscules, chiffres et symboles
- ✅ Évitez les mots du dictionnaire
- ✅ Utilisez une phrase de passe (ex: "MonChatSappelleMimi2024!")

**Exemples de mots de passe forts :**

- `Ressourcerie2024!Secure`
- `MaPhrase$ecrete123`
- `Admin@Ressource#2024`

### Méthode 2 : Via la console du navigateur

Si vous préférez configurer directement, ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Changer l'identifiant
localStorage.setItem("ressourcerie_admin_user", "votre-nouvel-identifiant");

// Pour changer le mot de passe, utilisez la fonction de hashage
async function setPassword(newPassword) {
  const encoder = new TextEncoder();
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
  const data = encoder.encode(newPassword + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  localStorage.setItem("ressourcerie_admin_salt", salt);
  localStorage.setItem("ressourcerie_admin_password_hash", hash);
  console.log("Mot de passe mis à jour avec succès !");
}

// Utilisation
await setPassword("VotreMotDePasseSecurise123!");
```

## 🛡️ Sécurité du système

### Ce qui est sécurisé :

- ✅ Les mots de passe sont **hashés avec SHA-256** (algorithme cryptographique)
- ✅ Chaque mot de passe utilise un **salt unique** (protection contre les attaques par dictionnaire)
- ✅ Les mots de passe ne sont **jamais stockés en clair**

### Limitations (site statique) :

- ⚠️ Le hashage se fait côté client (visible dans le code JavaScript)
- ⚠️ Pour une sécurité maximale, utilisez un serveur backend
- ⚠️ Le localStorage peut être consulté par quiconque a accès à l'ordinateur

### Recommandations supplémentaires :

1. **Ne partagez jamais** vos identifiants
2. **Changez régulièrement** votre mot de passe
3. **Utilisez un gestionnaire de mots de passe** (ex: Bitwarden, 1Password)
4. **Activez l'authentification à deux facteurs** si possible (nécessite un backend)

## 🔄 Réinitialisation des identifiants

Si vous avez oublié vos identifiants, vous pouvez les réinitialiser en exécutant dans la console :

```javascript
// Supprimer les identifiants existants
localStorage.removeItem("ressourcerie_admin_user");
localStorage.removeItem("ressourcerie_admin_password_hash");
localStorage.removeItem("ressourcerie_admin_salt");
localStorage.removeItem("ressourcerie_is_logged_in");

// Recharger la page pour réinitialiser avec les valeurs par défaut
location.reload();
```

## 📝 Notes

- Les identifiants sont stockés dans le **localStorage** du navigateur
- Chaque navigateur a son propre localStorage (identifiants séparés)
- Si vous changez de navigateur, vous devrez vous reconnecter
- Pour partager les identifiants entre appareils, vous devrez les configurer sur chaque appareil
