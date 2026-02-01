"""
Créer un utilisateur pour la connexion à l'interface de gestion.

Usage:
  python manage.py create_user IDENTIFIANT MOT_DE_PASSE

Exemple:
  python manage.py create_user monadmin MonMotDePasse123
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Crée un utilisateur (identifiant + mot de passe) pour se connecter à /setup/."

    def add_arguments(self, parser):
        parser.add_argument("username", type=str, help="Identifiant de connexion")
        parser.add_argument("password", type=str, help="Mot de passe")

    def handle(self, *args, **options):
        username = (options["username"] or "").strip()
        password = options["password"] or ""

        if not username:
            self.stderr.write(self.style.ERROR("Identifiant vide. Usage: create_user IDENTIFIANT MOT_DE_PASSE"))
            return

        if len(password) < 8:
            self.stderr.write(self.style.ERROR("Le mot de passe doit contenir au moins 8 caractères."))
            return

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": username + "@example.com",
                "is_staff": True,
                "is_active": True,
            },
        )
        if not created:
            user.is_staff = True
            user.is_active = True
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS("Utilisateur créé : %s" % username))
        else:
            self.stdout.write(self.style.SUCCESS("Mot de passe mis à jour pour : %s" % username))
        self.stdout.write("Connexion : http://127.0.0.1:8000/setup/  identifiant: %s  mot de passe: (celui que vous venez de taper)" % username)
