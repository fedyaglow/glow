# 📦 Guide du Projet — Fedya Glow (Site Statique)

> **Version :** 1.0  
> **Marque :** Fedya Glow  
> **Type :** Site e-commerce statique (HTML/CSS/JS)

---

## 📁 Structure du Projet

```
project-static/
│
├── index.html              ← Page d'accueil
├── products.html           ← Catalogue des produits
├── product.html            ← Détail d'un produit
├── about.html              ← Page "À propos"
├── contact.html            ← Page de contact
├── cart.html               ← Panier
│
├── assets/
│   ├── css/
│   │   └── style.css       ← Feuille de styles principale
│   ├── js/
│   │   └── main.js         ← Logique JavaScript du site
│   └── images/             ← Images générales du site (hero, bannières, etc.)
│
├── images/                 ← Images des produits (organisées par catégorie/sous-catégorie)
│   └── [Catégorie]/
│       └── [Sous-catégorie]/
│           └── [nom-du-produit]/
│               ├── main.jpg         ← Image principale
│               ├── gallery1.jpg     ← Image galerie 1
│               ├── gallery2.jpg     ← Image galerie 2
│               └── variant-50ml.jpg ← Image variante
│
└── products/               ← Données des produits (JSON + images locales)
    └── [Catégorie]/
        └── [Sous-catégorie]/
            └── [nom-du-produit]/
                ├── product.json     ← Fiche produit (données)
                └── images/          ← Dossier réservé aux images du produit
```

---

## 🗂️ Catégories et Sous-catégories

Le catalogue est organisé en **8 catégories principales**, chacune avec ses sous-catégories :

| Catégorie | Sous-catégories |
|-----------|----------------|
| **Café et Alimentation** | Boissons chaudes, Café en capsules, Café moulu, Infusions |
| **Compléments Alimentaires** | Bien-être, Énergie, Immunité, Minceur et forme, Vitamines |
| **Entretien du Linge** | Adoucissants, Détachants, Lessives, Parfums de linge |
| **Huiles Essentielles** | Aromathérapie, Huiles énergisantes, Huiles relaxantes, Soins de la peau |
| **Maquillage** | Lèvres, Teint, Visage, Yeux |
| **Soins de la Maison** | Cuisine, Désinfectants, Nettoyage des sols, Nettoyants multi-surfaces, Parfums d'intérieur, Salle de bain |
| **Soins Personnels** | Déodorants, Hygiène bucco-dentaire, Parfums corporels, Soins des cheveux, Soins du corps, Soins du visage |
| **Soins pour Bébé** | Bain bébé, Hygiène bébé, Protection douce, Soins du corps bébé |

---

## ➕ Comment Ajouter un Nouveau Produit

### Étape 1 — Créer le dossier du produit

Dans `products/[Catégorie]/[Sous-catégorie]/`, créez un dossier avec le **nom-slug** du produit (en minuscules, tirets à la place des espaces) :

```
products/
└── Maquillage/
    └── Lèvres/
        └── rouge-a-levres-velours/     ← nouveau produit
            ├── product.json
            └── images/
```

### Étape 2 — Créer le fichier `product.json`

Copiez ce modèle et remplissez les champs :

```json
{
  "id": "id-categorie-sous-categorie-001",
  "name": "Nom du Produit",
  "category": "Maquillage",
  "subcategory": "Lèvres",
  "description": "Description du produit en français.",
  "brand": "Fedya Glow",
  "mainImage": "/images/Maquillage/Lèvres/rouge-a-levres-velours/main.jpg",
  "gallery": [
    "/images/Maquillage/Lèvres/rouge-a-levres-velours/gallery1.jpg",
    "/images/Maquillage/Lèvres/rouge-a-levres-velours/gallery2.jpg"
  ],
  "variants": [
    {
      "size": "5ml",
      "price": 199,
      "sku": "SKU-rouge-velours-5ml",
      "images": [
        "/images/Maquillage/Lèvres/rouge-a-levres-velours/variant-5ml.jpg"
      ],
      "stock": 20
    }
  ],
  "tags": ["Maquillage", "Lèvres", "Rouge à lèvres", "Nouveau"],
  "isFeatured": false,
  "createdAt": "2026-05-01T00:00:00.000Z"
}
```

### Étape 3 — Ajouter les images du produit

Dans `images/[Catégorie]/[Sous-catégorie]/[nom-du-produit]/`, placez :

| Fichier | Rôle | Taille recommandée |
|---------|------|-------------------|
| `main.jpg` | Image principale affichée dans le catalogue | 800×800 px |
| `gallery1.jpg` | 1ère image de la galerie | 800×800 px |
| `gallery2.jpg` | 2ème image de la galerie | 800×800 px |
| `variant-[taille].jpg` | Image par variante (ex: 50ml, 100ml) | 600×600 px |

> **Formats acceptés :** `.jpg`, `.jpeg`, `.png`, `.webp`

---

## 🖼️ Nomenclature des Images

Respectez cette convention pour que les chemins dans `product.json` correspondent :

```
/images/[Catégorie]/[Sous-catégorie]/[nom-du-produit]/[fichier]
```

**Exemple :**
```
/images/Soins Personnels/Soins du visage/serum-vitamine-c/main.jpg
/images/Soins Personnels/Soins du visage/serum-vitamine-c/gallery1.jpg
/images/Soins Personnels/Soins du visage/serum-vitamine-c/variant-30ml.jpg
```

---

## 📝 Description des Champs `product.json`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | Identifiant unique du produit |
| `name` | string | Nom complet du produit |
| `category` | string | Catégorie principale (doit correspondre exactement au dossier) |
| `subcategory` | string | Sous-catégorie (doit correspondre exactement au dossier) |
| `description` | string | Description courte du produit |
| `brand` | string | Marque (ex: "Fedya Glow") |
| `mainImage` | string | Chemin vers l'image principale |
| `gallery` | array | Liste des chemins images de la galerie |
| `variants` | array | Variantes du produit (taille, prix, stock, images) |
| `tags` | array | Mots-clés pour la recherche et le filtrage |
| `isFeatured` | boolean | `true` = produit mis en avant sur la page d'accueil |
| `createdAt` | string | Date de création au format ISO 8601 |

---

## ✅ Bonnes Pratiques

- **Noms de dossiers :** Utilisez les **noms exacts** des catégories/sous-catégories (avec accents) — ils doivent correspondre aux chemins dans `product.json`.
- **Images :** Optimisez les images avant upload (max **500 Ko** par fichier recommandé).
- **IDs uniques :** Chaque produit doit avoir un `id` unique. Convention : `id-[cat-slug]-[subcat-slug]-[numéro]`.
- **SKUs :** Les SKUs doivent être uniques pour chaque variante.
- **`isFeatured`:** Limitez à **6 produits** mis en avant pour ne pas surcharger la page d'accueil.

---

## 🚀 Lancement du Site en Local

Ouvrez un terminal dans le dossier `project-static/` et lancez :

```bash
# Avec Python 3
python3 -m http.server 8000

# Puis ouvrez dans le navigateur :
# http://localhost:8000
```

---

*Fedya Glow — Documentation interne — 2026*
