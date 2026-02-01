// Logique de la page publique (Django ou static)

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q') || '';
const category = urlParams.get('category') || '';

// Produits : serveur (Django) ou localStorage
function getPublishedProducts() {
    if (typeof window.__PRODUCTS__ !== 'undefined') return window.__PRODUCTS__;
    return ProductManager ? ProductManager.getPublished() : [];
}
function getProductsByCategory() {
    const list = getPublishedProducts();
    if (typeof window.__PRODUCTS__ !== 'undefined') {
        const grouped = {};
        Object.keys(CATEGORIES || {}).forEach(function(catValue) {
            const catProducts = list.filter(function(p) { return p.category === catValue; }).slice(0, 5);
            if (catProducts.length > 0) grouped[CATEGORIES[catValue]] = catProducts;
        });
        return grouped;
    }
    return ProductManager ? ProductManager.getByCategory() : {};
}
function searchProducts(q, cat) {
    let list = getPublishedProducts();
    if (cat && CATEGORIES && cat in CATEGORIES) list = list.filter(function(p) { return p.category === cat; });
    if (q && q.trim()) {
        var term = q.toLowerCase().trim();
        list = list.filter(function(p) {
            return (p.title && p.title.toLowerCase().includes(term)) || (p.description && p.description.toLowerCase().includes(term));
        });
    }
    return list;
}

// Initialiser la page
document.addEventListener('DOMContentLoaded', function() {
    initFilters();
    renderProducts();
    initModal();
    initSearch();
    updateYear();
});

// Initialiser les filtres de catégories
function initFilters() {
    const filtersContainer = document.getElementById('filtersContainer');
    if (!filtersContainer) return;
    if (typeof CATEGORIES === 'undefined') return;

    const categories = Object.entries(CATEGORIES);
    const base = (typeof window.__PRODUCTS__ !== 'undefined') ? (window.location.pathname || '/') : 'index.html';

    categories.forEach(([value, label]) => {
        if (value === 'alaune' || value === '') return;
        const chip = document.createElement('a');
        chip.href = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'category=' + value + (query ? '&q=' + encodeURIComponent(query) : '');
        chip.className = 'filters__chip ' + (category === value ? 'filters__chip--active' : '');
        chip.textContent = label;
        chip.dataset.category = value;
        filtersContainer.appendChild(chip);
    });

    var alauneChip = filtersContainer.querySelector('[data-category="alaune"]');
    if (alauneChip) {
        alauneChip.href = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'category=alaune' + (query ? '&q=' + encodeURIComponent(query) : '');
        if (category === 'alaune') alauneChip.classList.add('filters__chip--active'); else alauneChip.classList.remove('filters__chip--active');
    }

    // Mettre à jour le lien "Tout"
    const allChip = filtersContainer.querySelector('[data-category=""]');
    if (allChip) {
        allChip.href = query ? base + (base.indexOf('?') >= 0 ? '&' : '?') + 'q=' + encodeURIComponent(query) : base;
        if (!category && !query) {
            allChip.classList.add('filters__chip--active');
        } else {
            allChip.classList.remove('filters__chip--active');
        }
    }
}

// Rendre les produits : en mode "Tout" = une section par catégorie ; sinon grille unique
function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    const isTout = !category && !query;
    container.innerHTML = '';

    if (isTout && typeof CATEGORIES !== 'undefined') {
        // Mode "Tout" : une section par catégorie (Sport, Jouet, Maison, etc.)
        const list = getPublishedProducts();
        const byCategory = {};
        (list || []).forEach(function(p) {
            var cat = (p && p.category) ? String(p.category).toLowerCase() : '';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(p);
        });
        const categoryOrder = Object.keys(CATEGORIES);
        var hasAny = false;
        categoryOrder.forEach(function(catValue) {
            var products = byCategory[catValue] || [];
            if (products.length > 0) {
                hasAny = true;
                var section = document.createElement('section');
                section.className = 'section';
                var title = document.createElement('h2');
                title.className = 'section-title';
                title.textContent = CATEGORIES[catValue] || catValue;
                var grid = document.createElement('div');
                grid.className = 'cards-grid';
                products.forEach(function(product) {
                    grid.appendChild(createProductCard(product));
                });
                section.appendChild(title);
                section.appendChild(grid);
                container.appendChild(section);
            }
        });
        if (!hasAny) {
            appendEmptyState(container);
        }
    } else {
        const products = isTout ? getPublishedProducts() : searchProducts(query, category);
        if (products && products.length > 0) {
            const section = document.createElement('section');
            section.className = 'section';
            const title = document.createElement('h2');
            title.className = 'section-title';
            title.textContent = category && CATEGORIES && CATEGORIES[category] ? CATEGORIES[category] : 'Résultats';
            const grid = document.createElement('div');
            grid.className = 'cards-grid';
            products.forEach(function(product) {
                grid.appendChild(createProductCard(product));
            });
            section.appendChild(title);
            section.appendChild(grid);
            container.appendChild(section);
        } else {
            appendEmptyState(container);
        }
    }
}

function appendEmptyState(container) {
    const section = document.createElement('section');
    section.className = 'section';
    const emptyText = document.createElement('p');
    emptyText.className = 'empty-state-text';
    emptyText.textContent = 'Aucun produit n\'est disponible pour le moment.';
    section.appendChild(emptyText);
    container.appendChild(section);
}

// Créer une carte produit (toujours en grille, même dimensions)
function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'card card--product';
    card.dataset.productId = product.id;
    card.dataset.productTitle = escapeHtml(product.title);
    card.dataset.productDescription = escapeHtml(product.description || '').replace(/\n/g, '<br>');
    card.dataset.productDimensions = escapeHtml(product.dimensions || '');
    card.dataset.productImage = product.image || '';
    card.dataset.productAlt = escapeHtml(product.image_alt || product.title);

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'card__image-wrapper';
    
    if (product.image) {
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.image_alt || product.title;
        imageWrapper.appendChild(img);
    }
    
    const body = document.createElement('div');
    body.className = 'card__body';
    
    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = product.title;
    
    body.appendChild(title);
    
    if (product.category) {
        const categoryMeta = document.createElement('p');
        categoryMeta.className = 'card__meta';
        categoryMeta.textContent = CATEGORIES[product.category] || product.category;
        body.appendChild(categoryMeta);
    }
    
    if (product.dimensions) {
        const dimensionsMeta = document.createElement('p');
        dimensionsMeta.className = 'card__meta';
        dimensionsMeta.textContent = product.dimensions;
        body.appendChild(dimensionsMeta);
    }
    
    if (product.description) {
        const excerpt = document.createElement('p');
        excerpt.className = 'card__excerpt';
        const maxLength = category && !query ? 60 : 80;
        excerpt.textContent = product.description.length > maxLength 
            ? product.description.substring(0, maxLength) + '...' 
            : product.description;
        body.appendChild(excerpt);
    }
    
    card.appendChild(imageWrapper);
    card.appendChild(body);
    
    return card;
}

// Initialiser la modal
function initModal() {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    const backdrop = modal.querySelector('.product-modal__backdrop');
    const closeBtn = modal.querySelector('.product-modal__close');
    const imageEl = document.getElementById('modalImage');
    const titleEl = document.getElementById('modalTitle');
    const dimensionsEl = document.getElementById('modalDimensions');
    const descriptionEl = document.getElementById('modalDescription');

    function openModal(card) {
        const title = card.getAttribute('data-product-title');
        const description = card.getAttribute('data-product-description');
        const dimensions = card.getAttribute('data-product-dimensions');
        const image = card.getAttribute('data-product-image');
        const alt = card.getAttribute('data-product-alt');

        titleEl.textContent = title || '';
        dimensionsEl.textContent = dimensions || '';
        descriptionEl.innerHTML = description || '';

        if (image) {
            imageEl.src = image;
            imageEl.alt = alt || title || '';
            imageEl.style.display = 'block';
        } else {
            imageEl.style.display = 'none';
        }

        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    // Ouvrir la modal au clic sur une carte
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.card--product');
        if (card) {
            openModal(card);
        }
    });

    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Initialiser la recherche
function initSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.value = query;
    }
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const queryValue = searchInput.value.trim();
            const categoryParam = category ? '&category=' + category : '';
            const base = (typeof window.__PRODUCTS__ !== 'undefined') ? (window.location.pathname || '/') : 'index.html';
            const qs = queryValue ? 'q=' + encodeURIComponent(queryValue) + categoryParam : (categoryParam ? categoryParam.slice(1) : '');
            window.location.href = base + (qs ? (base.indexOf('?') >= 0 ? '&' + qs : '?' + qs) : '');
        });
    }
}

// Mettre à jour l'année dans le footer
function updateYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// Échapper le HTML pour éviter les injections
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

