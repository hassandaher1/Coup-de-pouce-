// Gestion des produits (Django API ou localStorage)

function isDjangoBackend() {
    return typeof window.__ALL_PRODUCTS__ !== 'undefined';
}
function getCsrfToken() {
    var el = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (el) return el.value;
    var m = document.cookie.match(/\bcsrftoken=([^;]+)/);
    return m ? m[1] : (window.__CSRF_TOKEN__ || '');
}
function getManagementProducts() {
    if (isDjangoBackend()) return window.__ALL_PRODUCTS__;
    return (typeof ProductManager !== 'undefined' ? ProductManager.getAll() : []).slice(0, 10);
}

// Vérifier l'authentification au chargement (static uniquement ; Django protège côté serveur)
if (!isDjangoBackend() && typeof AuthMgr !== 'undefined' && !AuthMgr.requireAuth()) {
    // redirection gérée dans requireAuth
}

// Initialiser la page
document.addEventListener('DOMContentLoaded', function() {
    initForm();
    renderLatestProducts();
    initLogout();
    initSecurityForm();
    displayCurrentUsername();
});

// Initialiser le formulaire
function initForm() {
    const form = document.getElementById('productForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const errorDiv = document.getElementById('formError');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        const imageFile = document.getElementById('productImage').files[0];
        if (!imageFile) {
            showError('Veuillez sélectionner une image.');
            return;
        }

        if (isDjangoBackend()) {
            try {
                const formData = new FormData(form);
                const r = await fetch('/api/products/create/', {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-CSRFToken': getCsrfToken() },
                    credentials: 'same-origin'
                });
                const data = await r.json();
                if (data.success && data.product) {
                    window.__ALL_PRODUCTS__.unshift(data.product);
                    form.reset();
                    if (document.getElementById('isPublished')) document.getElementById('isPublished').checked = true;
                    renderLatestProducts();
                    alert('Produit ajouté avec succès !');
                } else {
                    showError(data.error || 'Erreur lors de l\'ajout.');
                }
            } catch (err) {
                showError('Une erreur est survenue. Veuillez réessayer.');
            }
            return;
        }

        try {
            const imageBase64 = typeof imageToBase64 === 'function' ? await imageToBase64(imageFile) : '';
            const formData = new FormData(form);
            const product = {
                title: formData.get('title'),
                description: formData.get('description') || '',
                dimensions: formData.get('dimensions') || '',
                category: formData.get('category'),
                image: imageBase64,
                image_alt: formData.get('image_alt') || '',
                is_published: formData.get('is_published') === 'on'
            };
            if (!product.title || !product.category) {
                showError('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            ProductManager.add(product);
            form.reset();
            if (document.getElementById('isPublished')) document.getElementById('isPublished').checked = true;
            renderLatestProducts();
            alert('Produit ajouté avec succès !');
        } catch (error) {
            showError('Une erreur est survenue lors de l\'ajout du produit.');
        }
    });
}

// Afficher une erreur
function showError(message) {
    const errorDiv = document.getElementById('formError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Rendre les dernières publications
function renderLatestProducts() {
    const container = document.getElementById('latestProducts');
    if (!container) return;

    const products = getManagementProducts();
    const list = Array.isArray(products) ? products.slice(0, 10) : [];
    container.innerHTML = '';

    if (list.length === 0) {
        const emptyText = document.createElement('p');
        emptyText.className = 'empty-state-text';
        emptyText.textContent = 'Aucune publication pour le moment.';
        container.appendChild(emptyText);
        return;
    }

    list.forEach(function(product) {
        const card = document.createElement('article');
        card.className = 'card card--compact';
        
        const thumb = document.createElement('div');
        thumb.className = 'card__thumb';
        
        if (product.image) {
            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.image_alt || product.title;
            thumb.appendChild(img);
        }
        
        const body = document.createElement('div');
        body.className = 'card__body';
        
        const title = document.createElement('h3');
        title.className = 'card__title';
        title.textContent = product.title;
        body.appendChild(title);
        
        if (product.dimensions) {
            const dimensionsMeta = document.createElement('p');
            dimensionsMeta.className = 'card__meta';
            dimensionsMeta.textContent = product.dimensions;
            body.appendChild(dimensionsMeta);
        }
        
        if (product.category) {
            const categoryMeta = document.createElement('p');
            categoryMeta.className = 'card__meta';
            categoryMeta.textContent = CATEGORIES[product.category] || product.category;
            body.appendChild(categoryMeta);
        }
        
        if (product.created_at) {
            const dateMeta = document.createElement('p');
            dateMeta.className = 'card__date';
            const date = new Date(product.created_at);
            dateMeta.textContent = `Créé le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
            body.appendChild(dateMeta);
        }
        
        const deleteForm = document.createElement('form');
        deleteForm.className = 'card__delete-form';
        deleteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) return;
            if (isDjangoBackend()) {
                fetch('/api/products/' + product.id + '/delete/', {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCsrfToken() },
                    credentials: 'same-origin'
                }).then(function(r) { return r.json(); }).then(function(data) {
                    if (data.success) {
                        var idx = window.__ALL_PRODUCTS__.findIndex(function(p) { return String(p.id) === String(product.id); });
                        if (idx >= 0) window.__ALL_PRODUCTS__.splice(idx, 1);
                        renderLatestProducts();
                    }
                }).catch(function() { renderLatestProducts(); });
            } else {
                ProductManager.delete(product.id);
                renderLatestProducts();
            }
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'submit';
        deleteBtn.className = 'btn-delete';
        deleteBtn.setAttribute('aria-label', `Supprimer ${product.title}`);
        deleteBtn.textContent = '×';
        deleteForm.appendChild(deleteBtn);
        
        card.appendChild(thumb);
        card.appendChild(body);
        card.appendChild(deleteForm);
        container.appendChild(card);
    });
}

// Initialiser le bouton de déconnexion
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) return;
        if (isDjangoBackend()) {
            window.location.href = '/logout/';
        } else {
            if (typeof AuthMgr !== 'undefined') AuthMgr.logout();
            window.location.href = '/setup.html';
        }
    });
}

// Afficher l'identifiant actuel (Django : déjà dans le template)
function displayCurrentUsername() {
    if (isDjangoBackend()) return;
    const currentUsernameEl = document.getElementById('currentUsername');
    if (currentUsernameEl) currentUsernameEl.textContent = localStorage.getItem('r_user') || 'user';
}

// Initialiser le formulaire de sécurité
function initSecurityForm() {
    const form = document.getElementById('securityForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const errorDiv = document.getElementById('securityError');
        const successDiv = document.getElementById('securitySuccess');
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        errorDiv.textContent = '';
        successDiv.textContent = '';

        const newUsername = document.getElementById('newUsername').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mise à jour...';

        if (isDjangoBackend()) {
            try {
                var body = new URLSearchParams();
                body.append('csrfmiddlewaretoken', getCsrfToken());
                if (newUsername) body.append('new_username', newUsername);
                if (newPassword) body.append('new_password', newPassword);
                body.append('confirm_password', confirmPassword);
                var r = await fetch('/account/settings/', {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCsrfToken(), 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body.toString(),
                    credentials: 'same-origin'
                });
                var data = await r.json();
                if (data.success) {
                    showSecuritySuccess('Paramètres mis à jour.');
                    if (data.username && document.getElementById('currentUsername')) document.getElementById('currentUsername').textContent = data.username;
                    form.reset();
                } else {
                    showSecurityError(data.error || 'Erreur.');
                }
            } catch (err) {
                showSecurityError('Une erreur est survenue.');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Mettre à jour les paramètres';
            return;
        }

        try {
            var hasChanges = false;
            var messages = [];
            if (newUsername) {
                var result = (typeof AuthMgr !== 'undefined' && AuthMgr.changeUsername) ? AuthMgr.changeUsername(newUsername) : { success: false, message: 'Non disponible.' };
                if (result.success) {
                    hasChanges = true;
                    messages.push(result.message);
                    displayCurrentUsername();
                    document.getElementById('newUsername').value = '';
                } else {
                    showSecurityError(result.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Mettre à jour les paramètres';
                    return;
                }
            }
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    showSecurityError('Les mots de passe ne correspondent pas.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Mettre à jour les paramètres';
                    return;
                }
                var resultPwd = typeof AuthMgr !== 'undefined' && AuthMgr.changePassword ? await AuthMgr.changePassword(newPassword) : { success: false, message: 'Non disponible.' };
                if (resultPwd.success) {
                    hasChanges = true;
                    messages.push(resultPwd.message);
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                } else {
                    showSecurityError(resultPwd.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Mettre à jour les paramètres';
                    return;
                }
            }
            if (hasChanges) {
                showSecuritySuccess(messages.join(' '));
                form.reset();
            } else {
                showSecurityError('Veuillez remplir au moins un champ.');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Mettre à jour les paramètres';
        } catch (error) {
            showSecurityError('Une erreur est survenue. Veuillez réessayer.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Mettre à jour les paramètres';
        }
    });
}

// Afficher une erreur de sécurité
function showSecurityError(message) {
    const errorDiv = document.getElementById('securityError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Afficher un succès de sécurité
function showSecuritySuccess(message) {
    const successDiv = document.getElementById('securitySuccess');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        // Masquer après 5 secondes
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

