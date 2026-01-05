// Logique de la page de connexion

// Vérifier si déjà connecté
if (AuthManager.isLoggedIn()) {
    window.location.href = '/admin/';
}

// Vérifier si un mot de passe a été configuré
function checkPasswordConfigured() {
    const hash = localStorage.getItem('ressourcerie_admin_password_hash');
    const salt = localStorage.getItem('ressourcerie_admin_salt');
    return !!(hash && salt);
}

// Initialiser le formulaire
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    // Afficher un message si le mot de passe n'est pas configuré
    if (!checkPasswordConfigured()) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = '<strong>Configuration requise :</strong> Aucun mot de passe configuré. Veuillez configurer un mot de passe via la console du navigateur (F12) ou consultez le README.md pour les instructions.';
        errorDiv.style.background = '#fef3c7';
        errorDiv.style.color = '#92400e';
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        errorDiv.style.background = '#fef2f2';
        errorDiv.style.color = '#b91c1c';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError('Veuillez remplir tous les champs.');
            return;
        }

        if (!checkPasswordConfigured()) {
            showError('Veuillez d\'abord configurer un mot de passe. Consultez le README.md pour les instructions.');
            return;
        }

        // Désactiver le bouton pendant la vérification
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';
        
        try {
            const success = await AuthManager.login(username, password);
            if (success) {
                window.location.href = '/admin/';
            } else {
                showError('Identifiant ou mot de passe incorrect.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            showError('Une erreur est survenue. Veuillez réessayer.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    });
});

// Afficher une erreur
function showError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

