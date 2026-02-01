"""
Backend d'authentification : recherche de l'utilisateur par identifiant insensible à la casse.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class CaseInsensitiveAuthBackend(ModelBackend):
    """Permet de se connecter avec « demo », « Demo » ou « DEMO »."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        try:
            user = User.objects.get(username__iexact=username.strip())
        except User.DoesNotExist:
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
