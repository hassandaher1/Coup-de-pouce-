"""
Commande : python manage.py ensure_demo_user
Crée ou met à jour l'utilisateur « demo » avec un mot de passe connu pour la connexion.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()
USERNAME = "demo"
PASSWORD = "demo123"
EMAIL = "demo@example.com"


class Command(BaseCommand):
    help = "Crée ou réinitialise l'utilisateur demo (mot de passe: demo123)."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username=USERNAME,
            defaults={"email": EMAIL, "is_staff": True, "is_active": True},
        )
        if not created:
            user.email = EMAIL
            user.is_staff = True
            user.is_active = True
        user.set_password(PASSWORD)
        user.save()
        self.stdout.write(
            self.style.SUCCESS(
                "Utilisateur %s prêt. Connexion : identifiant=%s, mot de passe=%s"
                % (USERNAME, USERNAME, PASSWORD)
            )
        )
