// Logique de la page admin

// Vérifier l'authentification au chargement
if (!AuthManager.requireAuth()) {
    // La redirection est gérée dans requireAuth
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

        const formData = new FormData(form);
        const imageFile = document.getElementById('productImage').files[0];
        
        if (!imageFile) {
            showError('Veuillez sélectionner une image.');
            return;
        }

        try {
            // Convertir l'image en base64
            const imageBase64 = await imageToBase64(imageFile);
            
            const product = {
                title: formData.get('title'),
                description: formData.get('description') || '',
                dimensions: formData.get('dimensions') || '',
                category: formData.get('category'),
                image: imageBase64,
                image_alt: formData.get('image_alt') || '',
                is_published: formData.get('is_published') === 'on'
            };

            // Valider les champs requis
            if (!product.title || !product.category) {
                showError('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            // Ajouter le produit
            ProductManager.add(product);
            
            // Réinitialiser le formulaire
            form.reset();
            document.getElementById('isPublished').checked = true;
            
            // Recharger la liste des produits
            renderLatestProducts();
            
            // Afficher un message de succès (optionnel)
            alert('Produit ajouté avec succès !');
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit:', error);
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

    const products = ProductManager.getAll().slice(0, 10);
    
    container.innerHTML = '';

    if (products.length === 0) {
        const emptyText = document.createElement('p');
        emptyText.className = 'empty-state-text';
        emptyText.textContent = 'Aucune publication pour le moment.';
        container.appendChild(emptyText);
        return;
    }

    products.forEach(product => {
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
            if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
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
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                AuthManager.logout();
                window.location.href = '/login.html';
            }
        });
    }
}

// Afficher l'identifiant actuel
function displayCurrentUsername() {
    const currentUsernameEl = document.getElementById('currentUsername');
    if (currentUsernameEl) {
        const username = localStorage.getItem('ressourcerie_admin_user') || 'admin';
        currentUsernameEl.textContent = username;
    }
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

        try {
            let hasChanges = false;
            const messages = [];

            // Changer l'identifiant si fourni
            if (newUsername) {
                const result = AuthManager.changeUsername(newUsername);
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

            // Changer le mot de passe si fourni
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    showSecurityError('Les mots de passe ne correspondent pas.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Mettre à jour les paramètres';
                    return;
                }

                const result = await AuthManager.changePassword(newPassword);
                if (result.success) {
                    hasChanges = true;
                    messages.push(result.message);
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                } else {
                    showSecurityError(result.message);
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
            console.error('Erreur lors de la mise à jour:', error);
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

