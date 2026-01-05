// Logique de la page de connexion

// Vérifier si déjà connecté
if (AuthManager.isLoggedIn()) {
    window.location.href = '/admin/';
}

// Initialiser le formulaire
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError('Veuillez remplir tous les champs.');
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

