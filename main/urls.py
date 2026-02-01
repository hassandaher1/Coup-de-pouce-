from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="home"),
    path("setup/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("admin/", views.admin_redirect),
    path("management/", views.management, name="management"),
    path("api/products/", views.api_products),
    path("api/products/create/", views.api_products_create),
    path("api/products/<int:pk>/delete/", views.api_product_delete),
    path("account/settings/", views.account_settings),
]
