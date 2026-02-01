"""
Commande : python manage.py add_maison_products
Ajoute les 4 produits Maison (cuisine/couture, déco Noël, électroménager cuisine, fers à repasser).
"""
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings

from main.models import Product


PRODUCTS_DATA = [
    {
        "image_filename": "maison-cuisine-couture.png",
        "title": "Ustensiles de cuisine et machine à coudre Brother",
        "description": (
            "Sur cette photo, un pot en céramique blanc garni d’ustensiles de cuisine (fouet, spatule, louche) "
            "à côté d’une machine à coudre Brother blanche et bleue. Dans la catégorie Maison, nous recevons "
            "toujours des produits pour équiper votre intérieur : ustensiles de cuisine, petit électroménager, "
            "machines à coudre et accessoires de couture.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Ustensiles de cuisine en pot céramique et machine à coudre Brother",
    },
    {
        "image_filename": "maison-deco-table-noel.png",
        "title": "Décoration de table festive de Noël",
        "description": (
            "Une table dressée pour les fêtes : pièce maîtresse avec structure blanche, nœud doré et boules rouges, "
            "vase avec fleurs artificielles, petit sapin de Noël, gnome décoratif, assiettes et verres à motifs. "
            "Dans la catégorie Maison, nous recevons toujours des produits de décoration, arts de la table et "
            "accessoires festifs pour égayer vos repas de fin d’année.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Décoration de table de Noël, centre de table et vaisselle festive",
    },
    {
        "image_filename": "maison-electromenager-cuisine.png",
        "title": "Électroménager et ustensiles de cuisine",
        "description": (
            "Un assortiment d’appareils électriques de cuisine : bouilloire blanche, grille-pain inox, "
            "robot pâtissier rouge, cafetière, poêle à frire. Dans la catégorie Maison, nous recevons toujours "
            "des produits tels que bouilloires, grille-pain, robots, cafetières et ustensiles de cuisson "
            "pour équiper votre cuisine.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Bouilloire, grille-pain, robot pâtissier, cafetière et poêle",
    },
    {
        "image_filename": "maison-fers-repasser.png",
        "title": "Fers à repasser à vapeur et tables à repasser",
        "description": (
            "Plusieurs fers à vapeur (bleu et blanc, blanc et violet) et des tables à repasser avec housses. "
            "Dans la catégorie Maison, nous recevons toujours des produits pour l’entretien du linge : "
            "fers à vapeur, tables à repasser et accessoires de repassage.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Fers à repasser à vapeur et tables à repasser",
    },
]


class Command(BaseCommand):
    help = "Ajoute les 4 produits Maison (cuisine/couture, déco Noël, électroménager, fers à repasser)."

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
