const fs = require('fs');
const path = require('path');
const { generateProductJson } = require('./generate-product.js');

const productsDir = path.join(__dirname, '../products');
const indexFile = path.join(productsDir, 'index.json');
const placeholderPath = path.join(__dirname, '../assets/images/placeholder.jpg');

if (!fs.existsSync(placeholderPath)) {
    const placeholderBase64 = "R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
    fs.mkdirSync(path.dirname(placeholderPath), { recursive: true });
    fs.writeFileSync(placeholderPath, Buffer.from(placeholderBase64, 'base64'));
    console.log('[+] Created fallback placeholder.jpg');
}

const productPaths = [];

function scanDirectory(currentPath, depth, category, subcategory) {
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
        if (item === 'index.json' || item.endsWith('.json')) continue;
        
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            if (depth === 0) {
                scanDirectory(itemPath, 1, item, null);
            } else if (depth === 1) {
                scanDirectory(itemPath, 2, category, item);
            } else if (depth === 2) {
                const slug = item;
                const jsonPath = path.join(itemPath, 'product.json');
                
                if (!fs.existsSync(jsonPath)) {
                    generateProductJson(itemPath, category, subcategory, slug);
                    console.log(`[+] Auto-generated product.json for ${slug}`);
                }
                
                // Construct relative path using forward slashes
                const relativePath = `products/${category}/${subcategory}/${slug}/product.json`;
                productPaths.push(relativePath);
            }
        }
    }
}

console.log('Scanning products directory...');
scanDirectory(productsDir, 0, null, null);

fs.writeFileSync(indexFile, JSON.stringify(productPaths, null, 2), 'utf8');
console.log(`[OK] products/index.json updated with ${productPaths.length} products.`);
