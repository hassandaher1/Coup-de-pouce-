"""
Commande : python manage.py add_vaisselle_products
Ajoute les 6 produits Maison (vaisselle décorée, sets d'assiettes, verres, etc.).
"""
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings

from main.models import Product


PRODUCTS_DATA = [
    {
        "image_filename": "maison-assortiment-vaisselle-decoree.png",
        "title": "Assortiment de vaisselle en porcelaine décorée bleue et blanche",
        "description": (
            "Sur cette photo, un charmant assortiment de vaisselle en porcelaine ou céramique blanche, "
            "rehaussé de délicats motifs bleus floraux ou géométriques : théière avec couvercle, tasses à thé "
            "et diverses assiettes et bols. Dans la catégorie Maison, nous recevons toujours des produits "
            "pour les arts de la table : services à thé et café, assiettes, bols et vaisselle décorée.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Vaisselle porcelaine bleue et blanche, théière et tasses",
    },
    {
        "image_filename": "maison-set-assiettes-minimaliste.png",
        "title": "Set d'assiettes blanches design minimaliste",
        "description": (
            "Un set d'assiettes empilées, assiettes plates et à dessert, d'un blanc éclatant, "
            "design épuré avec bord légèrement surélevé. Dans la catégorie Maison, nous recevons toujours "
            "des produits pour la table : sets d'assiettes, vaisselle quotidienne et de fête.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Set d'assiettes blanches minimalistes",
    },
    {
        "image_filename": "maison-vaisselle-et-autres.png",
        "title": "Articles de cuisine et de table",
        "description": (
            "Une sélection d'articles de cuisine et de table : grand plat de cuisson rectangulaire en céramique blanche, "
            "bols profonds, saladier en verre, pot en céramique, maniques en silicone. Dans la catégorie Maison, "
            "nous recevons toujours des produits pour la cuisine et le service : plats de cuisson, bols, "
            "saladiers et accessoires de cuisine.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Plats de cuisson, bols, saladier et accessoires cuisine",
    },
    {
        "image_filename": "maison-set-assiettes-ondule.png",
        "title": "Set d'assiettes blanches à bord ondulé",
        "description": (
            "Ce set d'assiettes blanches se distingue par son bord élégamment texturé, "
            "motif ondulé ou strié subtil. Dans la catégorie Maison, nous recevons toujours des produits "
            "d'arts de la table : assiettes à bord travaillé, vaisselle élégante pour le quotidien ou les occasions.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Assiettes blanches à bord ondulé",
    },
    {
        "image_filename": "maison-verres-cannelures.png",
        "title": "Verres transparents à cannelures vintage",
        "description": (
            "Un ensemble de verres à boire transparents, à texture striée ou cannelée verticale, "
            "aspect classique et intemporel. Dans la catégorie Maison, nous recevons toujours des produits "
            "de verrerie : verres à eau, à jus, verres décorés et verres à motif vintage.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Verres transparents à cannelures",
    },
    {
        "image_filename": "maison-set-assiettes-bord-gris.png",
        "title": "Set d'assiettes blanches à bord gris anthracite",
        "description": (
            "Ces assiettes blanches présentent un design moderne avec un bord distinctif gris foncé ou anthracite. "
            "Le contraste crée un effet contemporain. Dans la catégorie Maison, nous recevons toujours des produits "
            "de vaisselle moderne : assiettes à bord contrastant, arts de la table épurés.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Assiettes blanches à bord gris anthracite",
    },
]


class Command(BaseCommand):
    help = "Ajoute les 6 produits Maison (vaisselle et arts de la table)."

    def handle(self, *args, **options):
        media_products = Path(settings.MEDIA_ROOT) / "products"
        created = 0
        for data in PRODUCTS_DATA:
            if Product.objects.filter(title=data["title"]).exists():
                self.stdout.write(f"Déjà présent : {data['title']}")
                continue
            image_path = media_products / data["image_filename"]
            if not image_path.exists():
                self.stdout.write(self.style.WARNING(f"Image absente : {image_path}"))
                continue
            product = Product(
                title=data["title"],
                description=data["description"],
                category="maison",
                image_alt=data["image_alt"],
                is_published=True,
            )
            with open(image_path, "rb") as f:
                product.image.save(data["image_filename"], File(f), save=False)
            product.save()
            created += 1
            self.stdout.write(self.style.SUCCESS(f"Ajouté : {product.title}"))
        self.stdout.write(self.style.SUCCESS(f"{created} produit(s) ajouté(s)."))
