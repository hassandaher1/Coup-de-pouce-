from django.conf import settings
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie

from django.contrib.auth import get_user_model

from .forms import LoginForm
from .models import Product

User = get_user_model()


def _product_to_dict(p):
    data = {
        "id": str(p.id),
        "title": p.title,
        "description": p.description or "",
        "dimensions": p.dimensions or "",
        "category": p.category,
        "image_alt": p.image_alt or "",
        "is_published": p.is_published,
        "created_at": p.created_at.isoformat(),
        "updated_at": p.updated_at.isoformat(),
    }
    if p.image:
        data["image"] = p.image.url
    else:
        data["image"] = ""
    return data


@require_GET
def index(request):
    products = Product.objects.filter(is_published=True)
    products_list = [_product_to_dict(p) for p in products]
    return render(request, "main/index.html", {"products_list": products_list})


class SetupLoginView(LoginView):
    """Connexion setup -> management avec la vue officielle Django."""
    form_class = LoginForm
    template_name = "main/setup.html"
    redirect_authenticated_user = True

    def get_success_url(self):
        return getattr(settings, "LOGIN_REDIRECT_URL", "/management/")


def _app_login_url():
    return getattr(settings, "APP_LOGIN_URL", "/setup/")


@require_GET
def direct_login_view(request):
    """En mode DEBUG : connexion directe au tableau de bord (utilisateur admin)."""
    if not settings.DEBUG:
        return redirect(_app_login_url())
    user = User.objects.filter(username="admin").first()
    if not user:
        user = User.objects.filter(username="demo").first()
    if user:
        login(request, user)
        return redirect(getattr(settings, "LOGIN_REDIRECT_URL", "/management/"))
    return redirect(_app_login_url())


@require_GET
@login_required(login_url="/setup/")
def logout_view(request):
    logout(request)
    return redirect(getattr(settings, "LOGOUT_REDIRECT_URL", "/setup/"))


@require_GET
def admin_redirect(request):
    if request.user.is_authenticated:
        return redirect("/management/")
    return redirect(_app_login_url())


@require_GET
@login_required(login_url="/setup/")
def management(request):
    return _render_management(request, request.user)


@require_GET
def management_dev(request):
    """En DEBUG : accès direct au tableau de bord sans mot de passe (pour débloquer)."""
    if not settings.DEBUG:
        return redirect(_app_login_url())
    user = User.objects.filter(username="admin").first() or User.objects.filter(username="demo").first()
    if not user:
        return redirect(_app_login_url())
    login(request, user)
    request.session.save()
    return redirect("management")


def _render_management(request, user):
    products = list(Product.objects.all())
    products_list = [_product_to_dict(p) for p in products]
    return render(
        request,
        "main/management.html",
        {
            "products_list": products_list,
            "current_username": user.username,
        },
    )


@require_GET
def api_products(request):
    if request.user.is_authenticated:
        qs = Product.objects.all()
    else:
        qs = Product.objects.filter(is_published=True)
    only_published = request.GET.get("published")
    if only_published and not request.user.is_authenticated:
        qs = qs.filter(is_published=True)
    data = [_product_to_dict(p) for p in qs]
    return JsonResponse(data, safe=False)


@require_POST
@login_required
def api_products_create(request):
    title = request.POST.get("title", "").strip()
    category = request.POST.get("category", "").strip()
    if not title or not category:
        return JsonResponse({"success": False, "error": "Titre et catégorie requis."}, status=400)
    image_file = request.FILES.get("image")
    product = Product(
        title=title,
        description=request.POST.get("description", ""),
        dimensions=request.POST.get("dimensions", ""),
        category=category,
        image_alt=request.POST.get("image_alt", ""),
        is_published=request.POST.get("is_published") == "on",
    )
    if image_file:
        product.image = image_file
    product.save()
    return JsonResponse({"success": True, "product": _product_to_dict(product)})


@require_POST
@login_required(login_url="/setup/")
def api_product_delete(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return JsonResponse({"success": False, "error": "Produit introuvable."}, status=404)
    product.delete()
    return JsonResponse({"success": True})


@require_POST
@login_required(login_url="/setup/")
def account_settings(request):
    new_username = request.POST.get("new_username", "").strip()
    new_password = request.POST.get("new_password")
    confirm_password = request.POST.get("confirm_password")

    if new_username:
        if len(new_username) < 3:
            return JsonResponse({"success": False, "error": "L'identifiant doit contenir au moins 3 caractères."})
        request.user.username = new_username
        request.user.save()

    if new_password:
        if new_password != confirm_password:
            return JsonResponse({"success": False, "error": "Les mots de passe ne correspondent pas."})
        if len(new_password) < 8:
            return JsonResponse({"success": False, "error": "Le mot de passe doit contenir au moins 8 caractères."})
        request.user.set_password(new_password)
        request.user.save()
        update_session_auth_hash(request, request.user)

    return JsonResponse({"success": True, "username": request.user.username})
