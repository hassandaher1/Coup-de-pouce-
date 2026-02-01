"""
Commande : python manage.py add_jeux_products
Ajoute les 3 produits Jouet (peluches, jeux divers, jeux et déco Noël) avec titres et descriptions.
"""
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings

from main.models import Product


PRODUCTS_DATA = [
    {
        "image_filename": "jouet-peluches.png",
        "title": "Peluches adorables et jeux câlins",
        "description": (
            "Sur cette photo, une sélection de nos tendres peluches : un adorable lapin rose et blanc "
            "coiffé d’un bonnet à carreaux, aux côtés de personnages connus comme Winnie l’Ourson et d’autres "
            "compagnons tout doux. Dans la catégorie Jouet, nous recevons toujours des produits variés pour "
            "le plaisir des petits et des grands : oursons classiques, animaux de la ferme, héros de dessins animés "
            "et créatures fantastiques. Chaque article est choisi pour apporter joie et réconfort.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Pile de peluches, lapin à carreaux et Winnie l'Ourson",
    },
    {
        "image_filename": "jouet-jeux-divers.png",
        "title": "Jeux de société, jouets et loisirs créatifs",
        "description": (
            "Un coin de notre espace dédié aux jeux et jouets : étagères remplies de jeux de société et puzzles, "
            "banc de travail jouet, bac de billes, blocs en bois, jeux de construction et microscopes d’initiation. "
            "Dans la catégorie Jouet, nous recevons toujours des produits variés : jeux de société classiques, "
            "jeux éducatifs, jouets en bois, jeux de construction, peluches et kits créatifs.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Rayon jeux et jouets, jeux de société, billes, jouets en bois",
    },
    {
        "image_filename": "jouet-noel.png",
        "title": "Jeux et déco de Noël",
        "description": (
            "Un aperçu de nos tables lors d’un événement : jeux en boîte (Meccano, puzzles…), décorations de Noël, "
            "sapin orné de boules rouges, argent et or, guirlandes et petits Pères Noël. Dans la catégorie Jouet, "
            "nous recevons toujours des produits pour toute la famille : jeux de construction, puzzles, "
            "décorations de fête et idées cadeaux.\n\n"
            "Visitez nos locaux pour voir ce que nous avons !"
        ),
        "image_alt": "Événement jeux et déco Noël, sapin et jeux en boîte",
    },
]


class Command(BaseCommand):
    help = "Ajoute les 3 produits Jouet (peluches, jeux divers, jeux et déco Noël)."

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
                category="jouet",
                image_alt=data["image_alt"],
                is_published=True,
            )
            with open(image_path, "rb") as f:
                product.image.save(data["image_filename"], File(f), save=False)
            product.save()
            created += 1
            self.stdout.write(self.style.SUCCESS(f"Ajouté : {product.title}"))
        self.stdout.write(self.style.SUCCESS(f"{created} produit(s) ajouté(s)."))
