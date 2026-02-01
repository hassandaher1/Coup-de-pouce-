from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ("maison", "Maison"),
        ("mode", "Mode"),
        ("jouet", "Jouet"),
        ("bricolage", "Bricolage"),
        ("culture", "Culture"),
        ("sport", "Sport"),
        ("meubles", "Meubles"),
    ]

    title = models.CharField("Titre", max_length=255)
    description = models.TextField("Description", blank=True)
    dimensions = models.CharField("Dimensions", max_length=128, blank=True)
    category = models.CharField("Catégorie", max_length=32, choices=CATEGORY_CHOICES)
    image = models.ImageField("Photo", upload_to="products/", blank=True, null=True)
    image_alt = models.CharField("Texte alternatif image", max_length=255, blank=True)
    is_published = models.BooleanField("Publié", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
