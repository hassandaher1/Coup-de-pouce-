# Mettre la plateforme en ligne (VPS + domaine)

Quand tu as acheté ton **VPS** (ex. Hostinger VPS) et ton **nom de domaine**, voici les étapes pour mettre le site en ligne.

---

## 1. Préparer le VPS

- Connecte-toi en **SSH** à ton VPS (l’IP et le mot de passe te sont donnés par l’hébergeur).
- Mets à jour le système et installe Python 3, pip, et les outils utiles :

```bash
sudo apt update && sudo apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx git
```

---

## 2. Récupérer le projet sur le VPS

```bash
cd /var/www
sudo git clone https://github.com/hassandaher1/Coup-de-pouce.git
sudo chown -R $USER:$USER Coup-de-pouce
cd Coup-de-pouce
```

---

## 3. Environnement Python et dépendances

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

---

## 4. Variables d’environnement (obligatoire en production)

Crée un fichier `.env` **sur le VPS uniquement** (ne le pousse pas sur GitHub) :

```bash
nano .env
```

Contenu (à adapter) :

```
DJANGO_SECRET_KEY=ta-longue-cle-aleatoire-ici
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=ton-domaine.com,www.ton-domaine.com
```

- **DJANGO_SECRET_KEY** : génère une clé avec  
  `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`
- **DJANGO_DEBUG=0** : désactive le mode debug.
- **DJANGO_ALLOWED_HOSTS** : ton domaine (et www si tu l’utilises).

Le projet charge déjà le fichier `.env` s’il existe (via `python-dotenv` dans `config/settings.py`). Tu n’as rien à modifier.

---

## 5. Base de données et compte admin

```bash
source .venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
```

Tu choisis un identifiant et un mot de passe pour te connecter à `/setup/` et `/management/`.

---

## 6. Fichiers statiques et media

```bash
python manage.py collectstatic --noinput
```

Crée le dossier des uploads si besoin :

```bash
mkdir -p media
```

---

## 7. Tester avec Gunicorn

```bash
gunicorn --bind 0.0.0.0:8000 config.wsgi:application
```

Si la page répond en HTTP sur l’IP du VPS, c’est bon. Arrête avec Ctrl+C.

---

## 8. Domaine : pointer vers le VPS

Chez le registrar de ton **nom de domaine** (où tu l’as acheté) :

- Crée un enregistrement **A** (ou **AAAA** pour IPv6) :
  - **Nom / Host** : `@` (et éventuellement `www`)
  - **Valeur / Pointe vers** : l’**IP de ton VPS**
  - TTL : 300 ou 3600

Attends quelques minutes que la DNS se propage.

---

## 9. Nginx (reverse proxy + SSL)

Crée un fichier de config Nginx (remplace `ton-domaine.com` par ton vrai domaine) :

```bash
sudo nano /etc/nginx/sites-available/coup-de-pouce
```

Contenu type :

```nginx
server {
    listen 80;
    server_name ton-domaine.com www.ton-domaine.com;
    location /static/ { alias /var/www/Coup-de-pouce/staticfiles/; }
    location /media/  { alias /var/www/Coup-de-pouce/media/; }
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Active le site et recharge Nginx :

```bash
sudo ln -s /etc/nginx/sites-available/coup-de-pouce /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10. Certificat SSL (HTTPS)

```bash
sudo certbot --nginx -d ton-domaine.com -d www.ton-domaine.com
```

Suis les instructions. Certbot configure Nginx pour le HTTPS.

---

## 11. Lancer Django au démarrage (systemd)

Crée un service pour que Gunicorn tourne en permanence :

```bash
sudo nano /etc/systemd/system/gunicorn-coup-de-pouce.service
```

Contenu (adapte les chemins et l’utilisateur) :

```ini
[Unit]
Description=Gunicorn pour Coup de pouce
After=network.target

[Service]
User=ton-utilisateur
Group=www-data
WorkingDirectory=/var/www/Coup-de-pouce
Environment="PATH=/var/www/Coup-de-pouce/.venv/bin"
EnvironmentFile=/var/www/Coup-de-pouce/.env
ExecStart=/var/www/Coup-de-pouce/.venv/bin/gunicorn --workers 3 --bind unix:/var/www/Coup-de-pouce/gunicorn.sock config.wsgi:application

[Install]
WantedBy=multi-user.target
```

Pour que Django lise les variables du `.env` via le service, il faut soit :
- que ton code charge le `.env` (comme en étape 4),  
- soit mettre les variables dans `Environment=` (ex. `Environment="DJANGO_SECRET_KEY=xxx"`).

Ensuite, dans Nginx, remplace `proxy_pass http://127.0.0.1:8000` par :

```nginx
proxy_pass http://unix:/var/www/Coup-de-pouce/gunicorn.sock;
```

Puis :

```bash
sudo systemctl daemon-reload
sudo systemctl enable gunicorn-coup-de-pouce
sudo systemctl start gunicorn-coup-de-pouce
sudo systemctl reload nginx
```

---

## Récap

1. VPS : SSH, installer Python, Nginx, Certbot.
2. Cloner le repo, venv, `pip install`, `.env` avec **SECRET_KEY**, **DEBUG=0**, **ALLOWED_HOSTS=ton-domaine.com**.
3. `migrate`, `createsuperuser`, `collectstatic`.
4. Domaine : enregistrement A vers l’IP du VPS.
5. Nginx : reverse proxy vers Gunicorn, puis Certbot pour HTTPS.
6. Service systemd pour lancer Gunicorn au démarrage.

Après ça, ton site est accessible en **https://ton-domaine.com**, avec la page publique et l’accès admin via `/setup/` et `/management/`.
