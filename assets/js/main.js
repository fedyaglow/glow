// ===============================
// STATE MANAGEMENT
// ===============================

const state = {
    cart: JSON.parse(localStorage.getItem('fedya-cart')) || [],
    products: [],
    categories: {}
};

window.productsData = [];
let selectedVariantIdx = -1;


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadAllProducts() {
    try {
        const response = await fetch('products/index.json');
        const productPaths = await response.json();

        const productPromises = productPaths.map(path =>
            fetch(path)
                .then(r => r.json())
                .catch(() => null)
        );

        const products = (await Promise.all(productPromises)).filter(Boolean);

        window.productsData = products;
        state.products = products;

        document.dispatchEvent(
            new CustomEvent('productsLoaded', { detail: products })
        );

        return products;

    } catch (err) {
        console.error(err);
        return [];
    }
}


// ===============================
// CART SYSTEM
// ===============================

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

    const existing = state.cart.find(
        i => i.id === item.id && i.size === item.size
    );

    if (existing) existing.quantity++;
    else state.cart.push(item);

    saveCart();
    alert("Produit ajouté au panier !");
}

function updateCartCount() {
    const count = state.cart.reduce((s, i) => s + i.quantity, 0);
    const badge = document.querySelector(".cart-count");
    if (badge) badge.textContent = count;
}


// ===============================
// HELPERS
// ===============================

function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

const FALLBACK_IMAGE = 'assets/images/placeholder.jpg';

function getValidImage(img) {
    if (!img) return FALLBACK_IMAGE;
    return img.startsWith('/') ? img.substring(1) : img;
}


// ===============================
// PRODUCTS GRID
// ===============================

function renderProducts(products, containerId) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = products.map(product => {

        const image = getValidImage(
            product.image ||
            product.variants?.[0]?.images?.[0]
        );

        const price = formatPrice(product.variants[0].price);

        return `
        <div class="product-card">

            <a href="product.html?id=${product.id}">
                <img src="${image}">
            </a>

            <h3>${product.name}</h3>
            <p>${price}</p>

            <a href="product.html?id=${product.id}" class="btn-outline">
                Détails
            </a>

        </div>
        `;

    }).join('');
}


// ===============================
// PRODUCT PAGE
// ===============================

function renderProductDetails(product) {

    const container = document.getElementById("product-content");
    if (!container) return;

    selectedVariantIdx = 0;

    const variant = product.variants[0];

    container.innerHTML = `

    <div class="product-gallery">

        <img id="main-img"
             src="${getValidImage(variant.images[0])}">

        <div class="thumbnails">
            ${variant.images.map(img => `
                <div class="thumbnail active"
                     onclick="switchImage('${getValidImage(img)}', this)">
                     <img src="${getValidImage(img)}">
                </div>
            `).join('')}
        </div>

    </div>

    <div class="product-info">

        <h1>${product.name}</h1>

        <p id="product-price">
            ${formatPrice(variant.price)}
        </p>

        <p>${product.description}</p>

        <div class="size-selector">
            ${product.variants.map((v,i)=>`
                <button class="size-btn ${i===0?'active':''}"
                onclick="switchVariant(${i},'${product.id}')">
                ${v.size}
                </button>
            `).join('')}
        </div>

        <button class="btn-gold"
            onclick="handleAddToCart('${product.id}')">
            Ajouter au panier
        </button>

        <button class="btn-whatsapp"
            onclick="handleWhatsAppOrder('${product.id}')">
            Acheter via WhatsApp
        </button>

    </div>
    `;
}


// ===============================
// ⭐ FIXED VARIANT SWITCH
// ===============================

function switchVariant(idx, productId) {

    selectedVariantIdx = idx;

    const product = window.productsData.find(
        p => String(p.id) === String(productId)
    );

    const variant = product.variants[idx];

    // change price
    document.getElementById("product-price")
        .textContent = formatPrice(variant.price);

    // change main image
    document.getElementById("main-img")
        .src = getValidImage(variant.images[0]);

    // rebuild thumbnails
    const thumbs = document.querySelector(".thumbnails");

    thumbs.innerHTML = variant.images.map(img=>`
        <div class="thumbnail active"
             onclick="switchImage('${getValidImage(img)}',this)">
             <img src="${getValidImage(img)}">
        </div>
    `).join('');

    // update active button
    document.querySelectorAll(".size-btn")
        .forEach((btn,i)=>{
            btn.classList.toggle("active",i===idx);
        });
}


// ===============================
// IMAGE SWITCH
// ===============================

function switchImage(src, el) {

    document.getElementById("main-img").src = src;

    document.querySelectorAll(".thumbnail")
        .forEach(t=>t.classList.remove("active"));

    el.classList.add("active");
}


// ===============================
// ADD TO CART BUTTON
// ===============================

function handleAddToCart(productId) {

    const product = window.productsData.find(
        p => String(p.id) === String(productId)
    );

    addToCart(product, selectedVariantIdx);
}


// ===============================
// WHATSAPP ORDER
// ===============================

const WHATSAPP_PHONE = "33605821519";

function handleWhatsAppOrder(productId) {

    const product = window.productsData.find(
        p => String(p.id) === String(productId)
    );

    const variant = product.variants[selectedVariantIdx];

    const message =
`Bonjour Fedya Glow ✨

Produit: ${product.name}
Taille: ${variant.size}
Prix: ${formatPrice(variant.price)}
`;

    window.open(
        `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
}


// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded",()=>{
    updateCartCount();
});