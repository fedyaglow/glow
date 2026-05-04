const fs = require('fs');
const path = require('path');

function generateProductJson(productDirPath, category, subcategory, slug) {
    const assetsImagesDir = path.join(__dirname, '../assets/images/products');
    let imagePath = 'assets/images/placeholder.jpg';
    
    if (fs.existsSync(assetsImagesDir)) {
        const files = fs.readdirSync(assetsImagesDir);
        const img = files.find(f => f.toLowerCase().includes(slug.toLowerCase()) && /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
        if (img) {
            imagePath = `assets/images/products/${img}`;
        }
    }

    const formatName = (str) => {
        return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const productName = formatName(slug);
    const catName = formatName(category);
    const subcatName = formatName(subcategory);

    const productData = {
        id: `id-${category}-${subcategory}-${slug}`,
        name: productName,
        category: catName,
        subcategory: subcatName,
        description: `Découvrez notre ${productName} de la gamme ${catName}.`,
        price: 0.00,
        image: imagePath,
        gallery: [imagePath],
        slug: slug,
        seoTitle: `${productName} - Fedya Glow`,
        seoDescription: `Achetez ${productName}. Qualité garantie par Fedya Glow.`
    };

    const jsonPath = path.join(productDirPath, 'product.json');
    fs.writeFileSync(jsonPath, JSON.stringify(productData, null, 2), 'utf8');
    return jsonPath;
}

module.exports = { generateProductJson };
