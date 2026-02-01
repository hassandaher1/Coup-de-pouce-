// Authentification (Django : formulaire POST ; static : localStorage)

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('authForm');
    if (!form) return;

    // Django : formulaire POST, pas de JS pour la soumission
    if (form.method && form.method.toLowerCase() === 'post') {
        return;
    }

    // Static : vérifier si déjà connecté
    if (typeof AuthMgr !== 'undefined' && AuthMgr.isLoggedIn()) {
        window.location.href = '/management/';
        return;
    }

    function checkPasswordConfigured() {
        const hash = localStorage.getItem('r_pwd_hash');
        const salt = localStorage.getItem('r_salt');
        return !!(hash && salt);
    }

    if (!checkPasswordConfigured()) {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = '<strong>Configuration requise :</strong> Aucun mot de passe configuré. Veuillez configurer un mot de passe via la console du navigateur (F12) ou consultez le README.md pour les instructions.';
            errorDiv.style.background = '#fef3c7';
            errorDiv.style.color = '#92400e';
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const errorDiv = document.getElementById('authError');
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        errorDiv.style.background = '#fef2f2';
        errorDiv.style.color = '#b91c1c';

        const username = document.getElementById('username').value.trim() || document.getElementById('id_username') && document.getElementById('id_username').value.trim();
        const password = (document.getElementById('password') || document.getElementById('id_password')).value;

        if (!username || !password) {
            showError('Veuillez remplir tous les champs.');
            return;
        }

        if (!checkPasswordConfigured()) {
            showError('Veuillez d\'abord configurer un mot de passe. Consultez le README.md pour les instructions.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';

        try {
            const success = await AuthMgr.login(username, password);
            if (success) {
                window.location.href = '/management/';
            } else {
                showError('Identifiant ou mot de passe incorrect.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        } catch (err) {
            showError('Une erreur est survenue. Veuillez réessayer.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    });
});

function showError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}
