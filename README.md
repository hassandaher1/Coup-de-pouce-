# Coup de pouce

Site web Django pour une ressourcerie : page publique et espace de gestion des produits.

## Installation

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Python 3.10+ requis. En production, définir les variables d'environnement (voir `.env.example`).
