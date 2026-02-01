// Gestion des données avec localStorage

const CATEGORIES = {
    maison: "Maison",
    mode: "Mode",
    jouet: "Jouet",
    bricolage: "Bricolage",
    culture: "Culture",
    sport: "Sport",
    meubles: "Meubles"
};

const STORAGE_KEYS = {
    PRODUCTS: 'ressourcerie_products',
    ADMIN_USER: 'r_user',
    ADMIN_PASSWORD_HASH: 'r_pwd_hash',
    ADMIN_SALT: 'r_salt',
    IS_LOGGED_IN: 'r_auth'
};

// Fonction de hashage SHA-256
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Générer un salt aléatoire
function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Initialiser les données par défaut si nécessaire
async function initDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    }
    
    // Configuration utilisateur
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USER)) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, 'user');
    }
}

// Gestion des produits
const ProductManager = {
    getAll: function() {
        const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        return products ? JSON.parse(products) : [];
    },

    getPublished: function() {
        return this.getAll().filter(p => p.is_published);
    },

    getById: function(id) {
        const products = this.getAll();
        return products.find(p => p.id === id);
    },

    add: function(product) {
        const products = this.getAll();
        const newProduct = {
            id: Date.now().toString(), // ID simple basé sur le timestamp
            ...product,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        products.unshift(newProduct); // Ajouter au début
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return newProduct;
    },

    update: function(id, updates) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            return products[index];
        }
        return null;
    },

    delete: function(id) {
        const products = this.getAll();
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
        return filtered.length < products.length;
    },

    search: function(query, category) {
        let products = this.getPublished();
        
        if (category && category in CATEGORIES) {
            products = products.filter(p => p.category === category);
        }
        
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase().trim();
            products = products.filter(p => 
                p.title.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }
        
        return products;
    },

    getByCategory: function() {
        const products = this.getPublished();
        const grouped = {};
        
        Object.keys(CATEGORIES).forEach(catValue => {
            const catProducts = products.filter(p => p.category === catValue).slice(0, 5);
            if (catProducts.length > 0) {
                grouped[CATEGORIES[catValue]] = catProducts;
            }
        });
        
        return grouped;
    }
};

// Gestion de l'authentification
const AuthMgr = {
    login: async function(username, password) {
        const storedUser = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
        const storedHash = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD_HASH);
        const salt = localStorage.getItem(STORAGE_KEYS.ADMIN_SALT);
        
        if (!storedUser || !storedHash || !salt) {
            return false;
        }
        
        if (username !== storedUser) {
            return false;
        }
        
        const passwordHash = await hashPassword(password, salt);
        
        if (passwordHash === storedHash) {
            localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
            return true;
        }
        return false;
    },

    logout: function() {
        localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    },

    isLoggedIn: function() {
        return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    },

    requireAuth: function() {
        if (!this.isLoggedIn()) {
            window.location.href = '/setup.html';
            return false;
        }
        return true;
    },

    changePassword: async function(newPassword) {
        if (!newPassword || newPassword.length < 8) {
            return { success: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' };
        }
        
        const salt = generateSalt();
        const hash = await hashPassword(newPassword, salt);
        
        localStorage.setItem(STORAGE_KEYS.ADMIN_SALT, salt);
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD_HASH, hash);
        
        return { success: true, message: 'Mot de passe modifié avec succès.' };
    },

    changeUsername: function(newUsername) {
        if (!newUsername || newUsername.length < 3) {
            return { success: false, message: 'L\'identifiant doit contenir au moins 3 caractères.' };
        }
        
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, newUsername);
        return { success: true, message: 'Identifiant modifié avec succès.' };
    }
};

// Convertir une image en base64 pour le stockage
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Initialiser au chargement
initDefaultData().catch(console.error);

