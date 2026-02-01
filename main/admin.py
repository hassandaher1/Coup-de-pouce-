from django.contrib import admin
from django.utils.html import format_html

from .models import Product

# Personnalisation de la page d'accueil admin (/admin/)
admin.site.site_header = "Ressourcerie — Administration"
admin.site.site_title = "Ressourcerie Admin"
admin.site.index_title = "Gestion du site"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category_display",
        "is_published",
        "created_at",
        "updated_at",
        "image_preview",
    )
    list_editable = ("is_published",)
    list_filter = ("category", "is_published", "created_at")
    search_fields = ("title", "description", "dimensions", "image_alt")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    list_per_page = 25

    fieldsets = (
        (
            "Contenu",
            {
                "fields": ("title", "description", "dimensions", "category"),
            },
        ),
        (
            "Image",
            {
                "fields": ("image", "image_alt"),
            },
        ),
        (
            "Publication",
            {
                "fields": ("is_published",),
            },
        ),
        (
            "Dates",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at")

    def category_display(self, obj):
        return dict(Product.CATEGORY_CHOICES).get(obj.category, obj.category)

    category_display.short_description = "Catégorie"

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 40px; max-width: 60px; object-fit: cover;" />',
                obj.image.url,
            )
        return "—"

    image_preview.short_description = "Photo"
