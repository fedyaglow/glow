// State Management
const state = {
    cart: JSON.parse(localStorage.getItem('fedya-cart')) || [],
    products: [],
    categories: {}
};

window.productsData = [];

/**
 * Product Loader System
 * Fetches index.json and then all product files
 */
async function loadAllProducts() {
    try {
        const response = await fetch('products/index.json');
        if (!response.ok) throw new Error('Failed to load products index');
        
        const productPaths = await response.json();
        
        const productPromises = productPaths.map(path => 
            fetch(path)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to load product: ${path}`);
                    return res.json();
                })
                .catch(err => {
                    console.warn(err.message);
                    return null;
                })
        );
        
        const products = (await Promise.all(productPromises)).filter(Boolean);
        
        window.productsData = products;
        state.products = products;
        
        // Build category/subcategory map
        state.categories = {};
        products.forEach(p => {
            if (!state.categories[p.category]) {
                state.categories[p.category] = new Set();
            }
            if (p.subcategory) {
                state.categories[p.category].add(p.subcategory);
            }
        });

        // Convert sets to arrays
        for (let cat in state.categories) {
            state.categories[cat] = Array.from(state.categories[cat]).sort();
        }
        
        // Trigger a custom event when products are loaded
        document.dispatchEvent(new CustomEvent('productsLoaded', { detail: products }));
        
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// Cart Functions
function saveCart() {
    localStorage.setItem('fedya-cart', JSON.stringify(state.cart));
    updateCartCount();
}

function addToCart(product, variantIndex) {
    const variant = product.variants[variantIndex];
    const item = {
        id: product.id,
        name: product.name,
        price: variant.price,
        size: variant.size,
        image: variant.images[0],
        quantity: 1
    };
    
    const existing = state.cart.find(i => i.id === item.id && i.size === item.size);
    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push(item);
    }
    
    saveCart();
    alert('Produit ajouté au panier !');
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    saveCart();
    renderCart();
}

function updateCartCount() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = count;
}

// UI Helpers
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
}

const FALLBACK_IMAGE = 'assets/images/placeholder.jpg';
const REMOTE_FALLBACK = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800';

function getValidImage(img) {
    if (!img) return FALLBACK_IMAGE;
    // Remove leading slash if it exists to make it relative to root
    return img.startsWith('/') ? img.substring(1) : img;
}

function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">Aucun produit trouvé.</p>';
        return;
    }

    container.innerHTML = products.map(product => {
        const image = getValidImage(product.image || (product.variants && product.variants[0]?.images[0]));
        const price = product.variants && product.variants[0] ? formatPrice(product.variants[0].price) : 'Prix sur demande';
        
        return `
            <div class="product-card">
                <a href="product.html?id=${product.id}" class="product-card-img">
                    <img src="${image}" 
                         alt="${product.name}" 
                         loading="lazy" 
                         onerror="this.onerror=null; this.src='${REMOTE_FALLBACK}';">
                </a>
                <div class="product-card-info">
                    <span class="product-category">${product.category}${product.subcategory ? ' &rsaquo; ' + product.subcategory : ''}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${price}</p>
                    <a href="product.html?id=${product.id}" class="btn-outline" style="padding: 0.5rem 1rem; font-size: 0.7rem; text-align: center;">Détails</a>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Product Details Rendering
 */
let selectedVariantIdx = -1;

function renderProductDetails(product, containerId = 'product-content') {
    const container = document.getElementById(containerId);
    if (!container || !product) return;

    const variant = selectedVariantIdx !== -1 ? product.variants[selectedVariantIdx] : (product.variants[0] || null);
    const displayImg = getValidImage(variant ? variant.images[0] : (product.image || FALLBACK_IMAGE));
    
    const priceDisplay = variant 
        ? formatPrice(variant.price) 
        : (product.variants && product.variants.length > 1 
            ? `À partir de ${formatPrice(Math.min(...product.variants.map(v => v.price)))}`
            : (product.variants && product.variants[0] ? formatPrice(product.variants[0].price) : 'Prix sur demande'));

    container.innerHTML = `
        <div class="product-gallery">
            <div class="gallery-main">
                <img id="main-img" src="${displayImg}" alt="${product.name}" onerror="this.src='${REMOTE_FALLBACK}'">
            </div>
            <div class="thumbnails">
                ${(variant ? variant.images : [product.image]).filter(Boolean).map((img, i) => `
                    <div class="thumbnail ${getValidImage(img) === displayImg ? 'active' : ''}" onclick="switchImage('${getValidImage(img)}', this)">
                        <img src="${getValidImage(img)}" alt="" onerror="this.src='${REMOTE_FALLBACK}'">
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="product-info">
            <span class="gold-text" style="text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.7rem; font-weight: bold; margin-bottom: 1rem; display: block;">${product.category} ${product.subcategory ? '&rsaquo; ' + product.subcategory : ''}</span>
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">${product.name}</h1>
            <div style="width: 60px; height: 3px; background-color: var(--gold); margin-bottom: 2rem;"></div>
            
            <p id="product-price" style="font-size: 2rem; color: var(--gold); font-family: var(--font-serif); font-weight: bold; margin-bottom: 2rem;">
                ${priceDisplay}
            </p>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.2em; color: #888; margin-bottom: 1rem;">Description</h4>
                <p style="color: #aaa; line-height: 1.8;">${product.description}</p>
            </div>
            
            <div style="margin-bottom: 3rem;">
                <h4 style="text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.2em; color: #888; margin-bottom: 1rem;">Choisir la contenance</h4>
                <div class="size-selector">
                    ${(product.variants || []).map((v, i) => `
                        <button class="size-btn ${i === selectedVariantIdx ? 'active' : ''}" onclick="switchVariant(${i}, '${product.id}')">
                            ${v.size}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <button class="btn-gold" style="width: 100%; padding: 1.25rem;" onclick="handleAddToCart('${product.id}')">
                    <i data-lucide="shopping-bag"></i> Ajouter au panier
                </button>
                
                <button id="whatsapp-btn" class="btn-whatsapp" onclick="handleWhatsAppOrder('${product.id}')">
                    <i data-lucide="message-circle"></i>
                    <span class="btn-text">👉 Acheter maintenant</span>
                </button>
            </div>
            
            <div style="margin-top: 3rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05);">
                <div style="text-align: center;">
                    <i data-lucide="shield-check" style="color: var(--gold); margin-bottom: 0.5rem;"></i>
                    <p style="font-size: 0.6rem; text-transform: uppercase; font-weight: bold;">Qualité Certifiée</p>
                </div>
                <div style="text-align: center;">
                    <i data-lucide="truck" style="color: var(--gold); margin-bottom: 0.5rem;"></i>
                    <p style="font-size: 0.6rem; text-transform: uppercase; font-weight: bold;">Livraison Offerte</p>
                </div>
                <div style="text-align: center;">
                    <i data-lucide="clock" style="color: var(--gold); margin-bottom: 0.5rem;"></i>
                    <p style="font-size: 0.6rem; text-transform: uppercase; font-weight: bold;">Service 24/7</p>
                </div>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

function switchImage(src, el) {
    const mainImg = document.getElementById('main-img');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
}

function switchVariant(idx, productId) {
    selectedVariantIdx = idx;
    const product = window.productsData.find(p => String(p.id) === String(productId));
    renderProductDetails(product);
}

function handleAddToCart(productId) {
    const product = window.productsData.find(p => String(p.id) === String(productId));
    if (!product.variants || product.variants.length === 0) {
        addToCart({ ...product, variants: [{ size: 'Unique', price: 0, images: [product.image] }] }, 0);
        return;
    }
    if (selectedVariantIdx === -1 && product.variants.length > 1) {
        alert("Veuillez sélectionner une taille");
        return;
    }
    addToCart(product, selectedVariantIdx === -1 ? 0 : selectedVariantIdx);
}

function handleWhatsAppOrder(productId) {
    const product = window.productsData.find(p => String(p.id) === String(productId));
    if (!product.variants || product.variants.length === 0) {
        const item = {
            name: product.name,
            size: 'Unique',
            price: 0,
            quantity: 1,
            image: product.image
        };
        sendWhatsAppOrder([item], document.getElementById('whatsapp-btn'));
        return;
    }
    if (selectedVariantIdx === -1 && product.variants.length > 1) {
        alert("Veuillez sélectionner une taille");
        return;
    }

    const btn = document.getElementById('whatsapp-btn');
    const variant = product.variants[selectedVariantIdx === -1 ? 0 : selectedVariantIdx];
    
    const item = {
        name: product.name,
        size: variant.size,
        price: variant.price,
        quantity: 1,
        image: variant.images[0] || product.image
    };

    sendWhatsAppOrder([item], btn);
}

function filterByCategory(category, subcategory = null, products = window.productsData) {
    let filtered = products;
    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    if (subcategory && subcategory !== 'all') {
        filtered = filtered.filter(p => p.subcategory === subcategory);
    }
    return filtered;
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        if (document.querySelector('.hero')) {
            navbar.classList.remove('scrolled');
        }
    }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

/**
 * WhatsApp Ordering System
 */
const WHATSAPP_PHONE = "33605821519"; // Format without + or spaces

function buildWhatsAppMessage(items) {
    let total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let message = "Bonjour Fedya Glow ✨\n\n";
    message += "Je souhaite passer une commande :\n\n";
    message += "---\n\n";
    message += "🛒 Produits commandés :\n\n";
    
    items.forEach(item => {
        const img = getValidImage(item.image);
        const imageUrl = img.startsWith('http') ? img : window.location.origin + (img.startsWith('/') ? '' : '/') + img;
        
        message += `Produit : ${item.name}\n`;
        message += `Taille : ${item.size}\n`;
        message += `Quantité : ${item.quantity}\n`;
        message += `Prix : ${formatPrice(item.price)}\n`;
        message += `Image : ${imageUrl}\n\n`;
    });
    
    message += "---\n\n";
    message += `💰 Total : ${formatPrice(total)}\n\n`;
    message += "---\n\n";
    message += "Mes informations :\n\n";
    message += "Nom :\n";
    message += "Adresse :\n";
    message += "Ville :\n";
    message += "Téléphone :\n\n";
    message += "Merci beaucoup 😊";
    
    return message;
}

function sendWhatsAppOrder(items, btnElement) {
    if (items.length === 0) {
        alert("Votre panier est vide");
        return;
    }

    if (btnElement) {
        btnElement.classList.add('loading');
        btnElement.disabled = true;
    }

    const message = buildWhatsAppMessage(items);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

    setTimeout(() => {
        if (btnElement) {
            btnElement.classList.remove('loading');
            btnElement.disabled = false;
        }
        window.open(whatsappUrl, '_blank');
    }, 800);
}
