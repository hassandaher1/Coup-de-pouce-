# Commandes pour mettre à jour le dépôt GitHub

## Vérifications effectuées
- **.env** est bien dans `.gitignore` (ligne 36) — ne sera pas poussé.
- **backend_data.json** a été généré avec `dumpdata` (auth.User, main.Product, etc. ; contenttypes et sessions exclus).
- **media/** est dans `.gitignore` — on le force à l’ajout avec `git add -f media/`.

---

## Commandes à taper dans le terminal (PowerShell)

```powershell
cd c:\Users\PcUser\Downloads\Coup-de-pouce-1
.\venv\Scripts\Activate.ps1
python manage.py dumpdata --exclude contenttypes --exclude sessions --indent 2 -o backend_data.json
git add -A
git add -f media/
git status
git commit -m "Update: Fix Admin access & Backup Data"
git push
```

---

## Détail
1. **dumpdata** : recrée le backup (déjà fait une fois ; à relancer si tu modifies les données avant le push).
2. **git add -A** : ajoute tous les fichiers modifiés, ajoutés et supprimés.
3. **git add -f media/** : force l’ajout du dossier `media/` (photos produits) malgré le `.gitignore`.
4. **git status** : vérification avant commit (optionnel).
5. **commit** puis **push** : envoi vers GitHub.
