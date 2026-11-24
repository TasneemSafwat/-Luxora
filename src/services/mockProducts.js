import { SIZES } from '../utils/constants';
import { productArt } from '../utils/placeholderArt';

/**
 * Curated local catalogue used when the remote API is unreachable.
 * Shapes mirror the normalised product model so the UI never has to branch.
 */

const C = {
  Black: '#171717',
  Ivory: '#F2EDE4',
  Cream: '#E8DFCF',
  Camel: '#C2A176',
  Gold: '#B89B72',
  Silver: '#C7C9CC',
  Chocolate: '#6B4A34',
  Navy: '#26303F',
  Forest: '#41503F',
  Burgundy: '#6E2F2C',
  Rose: '#C9989C',
  Slate: '#5A6472',
  Stone: '#B6ADA0',
  Cognac: '#8A5A3B',
};

const swatch = (name) => ({ name, value: C[name] ?? C.Black });

/** name, category, price, discount, rating, stock, brand, material, colourways, sizeSet */
const SEEDS = [
  // ————— Women's dresses —————
  {
    title: 'Silk Column Midi Dress',
    category: 'womens-dresses',
    brand: 'LUXORA Atelier',
    price: 480,
    discount: 12,
    rating: 4.8,
    stock: 24,
    material: '100% mulberry silk, satin finish',
    colors: ['Ivory', 'Black', 'Forest'],
    sizeSet: 'apparel',
    description:
      'A biased, floor-skimming silhouette cut from heavyweight mulberry silk. Fluid on the body, sharp at the shoulder — the definition of quiet luxury.',
    tags: ['silk', 'midi', 'occasion'],
  },
  {
    title: 'Bias-Cut Slip Dress',
    category: 'womens-dresses',
    brand: 'Maison Lune',
    price: 320,
    discount: 18,
    rating: 4.6,
    stock: 41,
    material: 'Silk-viscose blend',
    colors: ['Champagne', 'Black', 'Rose'],
    sizeSet: 'apparel',
    description:
      'Cut on the bias for a liquid drape, finished with a fine French seam. Wear it alone or layered over a fine knit.',
    tags: ['slip', 'evening', 'layering'],
  },
  {
    title: 'Wool Crepe Shift Dress',
    category: 'womens-dresses',
    brand: 'LUXORA Atelier',
    price: 690,
    discount: 0,
    rating: 4.9,
    stock: 12,
    material: 'Italian virgin wool crepe',
    colors: ['Black', 'Navy', 'Stone'],
    sizeSet: 'apparel',
    description:
      'An architectural shift in double-faced virgin wool from a family mill in Biella. Structured, weighty, and quietly authoritative.',
    tags: ['wool', 'tailoring', 'workwear'],
  },
  {
    title: 'Pleated Silk Tea Dress',
    category: 'womens-dresses',
    brand: 'Aurelia',
    price: 395,
    discount: 22,
    rating: 4.5,
    stock: 33,
    material: 'Silk georgette, hand-pleated',
    colors: ['Cream', 'Burgundy', 'Slate'],
    sizeSet: 'apparel',
    description:
      'Fine knife pleats fall from a self-tie waist, catching light with every movement. Finished with covered buttons.',
    tags: ['pleated', 'tea-dress'],
  },

  // ————— Women's bags —————
  {
    title: 'Structured Leather Tote',
    category: 'womens-bags',
    brand: 'LUXORA Atelier',
    price: 850,
    discount: 10,
    rating: 4.9,
    stock: 18,
    material: 'Vegetable-tanned calf leather',
    colors: ['Black', 'Cognac', 'Stone'],
    sizeSet: null,
    description:
      'A day-to-evening tote in vegetable-tanned calf, hand-burnished at the edges and lined in suede. Ages into something better.',
    tags: ['leather', 'tote', 'everyday'],
  },
  {
    title: 'Quilted Chain Shoulder Bag',
    category: 'womens-bags',
    brand: 'Maison Lune',
    price: 1180,
    discount: 0,
    rating: 4.7,
    stock: 9,
    material: 'Lambskin, palladium hardware',
    colors: ['Black', 'Ivory', 'Burgundy'],
    sizeSet: null,
    description:
      'Hand-quilted lambskin with a fine palladium chain. Small enough to feel considered, large enough for everything essential.',
    tags: ['quilted', 'chain', 'icon'],
  },
  {
    title: 'Woven Raffia Bucket Bag',
    category: 'womens-bags',
    brand: 'Costa Atelier',
    price: 420,
    discount: 15,
    rating: 4.4,
    stock: 27,
    material: 'Hand-woven raffia, leather trim',
    colors: ['Cream', 'Chocolate'],
    sizeSet: null,
    description:
      'Woven by hand over three days in a Portuguese workshop. Light, structured, and made for long light evenings.',
    tags: ['raffia', 'summer', 'handmade'],
  },

  // ————— Jewellery —————
  {
    title: '18k Gold Vermeil Chain',
    category: 'womens-jewellery',
    brand: 'Ferro & Co.',
    price: 260,
    discount: 0,
    rating: 4.8,
    stock: 52,
    material: '18k gold vermeil on sterling silver',
    colors: ['Gold', 'Silver'],
    sizeSet: 'jewellery',
    description:
      'A weighty, close-link chain with a lobster clasp, plated in 18k gold over recycled sterling silver. Hypoallergenic and built to last.',
    tags: ['gold', 'chain', 'everyday'],
  },
  {
    title: 'Pearl Drop Earrings',
    category: 'womens-jewellery',
    brand: 'Ferro & Co.',
    price: 340,
    discount: 18,
    rating: 4.7,
    stock: 21,
    material: 'Freshwater pearls, 14k gold posts',
    colors: ['Gold', 'Ivory'],
    sizeSet: null,
    description:
      'Baroque freshwater pearls suspended from a hand-forged gold wire. No two pairs are identical — that is the point.',
    tags: ['pearl', 'earrings', 'occasion'],
  },
  {
    title: 'Sculpted Signet Ring',
    category: 'womens-jewellery',
    brand: 'Ferro & Co.',
    price: 385,
    discount: 0,
    rating: 4.6,
    stock: 15,
    material: 'Recycled sterling silver',
    colors: ['Silver', 'Gold'],
    sizeSet: null,
    description:
      'A bold, softly domed signet cast from recycled silver and hand-polished to a satin finish. Engravable on request.',
    tags: ['signet', 'ring'],
  },

  // ————— Women's shoes —————
  {
    title: 'Leather Slingback Heel',
    category: 'womens-shoes',
    brand: 'Marchetti',
    price: 520,
    discount: 14,
    rating: 4.5,
    stock: 30,
    material: 'Nappa leather, leather sole',
    colors: ['Black', 'Cream', 'Cognac'],
    sizeSet: 'shoes',
    description:
      'Hand-finished in Marche, with a 65mm sculpted heel and a cushioned leather insole built for real days.',
    tags: ['heel', 'leather', 'italian'],
  },
  {
    title: 'Suede Ankle Boot',
    category: 'womens-shoes',
    brand: 'Marchetti',
    price: 610,
    discount: 0,
    rating: 4.8,
    stock: 16,
    material: 'Italian suede, stacked leather heel',
    colors: ['Chocolate', 'Black', 'Stone'],
    sizeSet: 'shoes',
    description:
      'A lean ankle boot in water-resistant Italian suede, on a stacked leather heel with a discreet inside zip.',
    tags: ['boot', 'suede', 'winter'],
  },

  // ————— Women's watches —————
  {
    title: 'Slim Case Leather Watch',
    category: 'womens-watches',
    brand: 'Cortina Time',
    price: 745,
    discount: 10,
    rating: 4.7,
    stock: 11,
    material: 'Sapphire crystal, calf strap',
    colors: ['Gold', 'Silver'],
    sizeSet: null,
    description:
      'A 32mm brushed case with a sapphire crystal and Swiss quartz movement, on a hand-stitched calf strap.',
    tags: ['watch', 'quartz', 'swiss'],
  },

  // ————— Men's shirts —————
  {
    title: 'Egyptian Cotton Poplin Shirt',
    category: 'mens-shirts',
    brand: 'LUXORA Atelier',
    price: 210,
    discount: 15,
    rating: 4.8,
    stock: 64,
    material: 'Giza cotton poplin, 120s two-ply',
    colors: ['Ivory', 'Navy', 'Slate'],
    sizeSet: 'apparel',
    description:
      'Cut from two-ply Giza cotton with a soft-fused collar and mother-of-pearl buttons. The shirt that fixes everything.',
    tags: ['shirt', 'cotton', 'essential'],
  },
  {
    title: 'Silk-Blend Camp Collar Shirt',
    category: 'mens-shirts',
    brand: 'Aurelia',
    price: 285,
    discount: 0,
    rating: 4.5,
    stock: 38,
    material: 'Silk-cotton blend, relaxed fit',
    colors: ['Cream', 'Forest', 'Black'],
    sizeSet: 'apparel',
    description:
      'An open camp collar in a liquid silk-cotton blend. Cut relaxed through the body for an easy, unforced drape.',
    tags: ['silk', 'relaxed', 'resort'],
  },

  // ————— Men's shoes —————
  {
    title: 'Hand-Stitched Derby',
    category: 'mens-shoes',
    brand: 'Marchetti',
    price: 640,
    discount: 0,
    rating: 4.9,
    stock: 14,
    material: 'Box calf, Goodyear welted',
    colors: ['Black', 'Chocolate', 'Cognac'],
    sizeSet: 'shoes',
    description:
      'Goodyear-welted and hand-stitched over a 90-year-old last. Resoleable, and better in five years than today.',
    tags: ['derby', 'goodyear', 'formal'],
  },
  {
    title: 'Suede Chelsea Boot',
    category: 'mens-shoes',
    brand: 'Marchetti',
    price: 580,
    discount: 20,
    rating: 4.6,
    stock: 22,
    material: 'Calf suede, elastic gusset',
    colors: ['Stone', 'Chocolate', 'Black'],
    sizeSet: 'shoes',
    description:
      'A clean Chelsea in dense calf suede with twin elastic gussets and a leather-lined, Blake-stitched sole.',
    tags: ['chelsea', 'suede', 'boot'],
  },

  // ————— Men's watches —————
  {
    title: 'Automatic Steel Watch',
    category: 'mens-watches',
    brand: 'Cortina Time',
    price: 1450,
    discount: 8,
    rating: 4.9,
    stock: 7,
    material: '316L steel, automatic movement',
    colors: ['Silver', 'Black'],
    sizeSet: null,
    description:
      'A 39mm steel case housing a Swiss automatic movement with a 72-hour reserve. Sapphire front and back.',
    tags: ['automatic', 'steel', 'swiss'],
  },

  // ————— Sunglasses —————
  {
    title: 'Acetate Oversized Sunglasses',
    category: 'sunglasses',
    brand: 'Vela Eyewear',
    price: 310,
    discount: 12,
    rating: 4.6,
    stock: 45,
    material: 'Italian acetate, CR-39 lenses',
    colors: ['Black', 'Chocolate', 'Cream'],
    sizeSet: null,
    description:
      'Hand-polished Italian acetate with category-3 lenses and a keyhole bridge. Comes with a leather case.',
    tags: ['sunglasses', 'acetate', 'uv400'],
  },
  {
    title: 'Titanium Aviator Sunglasses',
    category: 'sunglasses',
    brand: 'Vela Eyewear',
    price: 395,
    discount: 0,
    rating: 4.7,
    stock: 19,
    material: 'Beta-titanium frame, polarised lenses',
    colors: ['Silver', 'Gold'],
    sizeSet: null,
    description:
      'A featherweight beta-titanium aviator with polarised lenses and adjustable silicone nose pads.',
    tags: ['titanium', 'polarised', 'aviator'],
  },

  // ————— Tops & knitwear —————
  {
    title: 'Cashmere Ribbed Knit',
    category: 'tops',
    brand: 'LUXORA Atelier',
    price: 445,
    discount: 10,
    rating: 4.9,
    stock: 26,
    material: 'Grade-A Mongolian cashmere, 12gg',
    colors: ['Cream', 'Black', 'Rose', 'Forest'],
    sizeSet: 'apparel',
    description:
      'Spun from grade-A Mongolian cashmere at 12 gauge — fine, warm and impossibly soft against the skin.',
    tags: ['cashmere', 'knit', 'essential'],
  },
  {
    title: 'Silk Camisole',
    category: 'tops',
    brand: 'Maison Lune',
    price: 180,
    discount: 0,
    rating: 4.5,
    stock: 58,
    material: '22-momme sand-washed silk',
    colors: ['Ivory', 'Black', 'Burgundy'],
    sizeSet: 'apparel',
    description:
      'A 22-momme sand-washed silk camisole with adjustable straps and a clean bias finish. Layers under everything.',
    tags: ['silk', 'camisole', 'layering'],
  },

  // ————— Beauty & fragrance —————
  {
    title: 'Botanical Face Serum',
    category: 'beauty',
    brand: 'Herbier',
    price: 96,
    discount: 18,
    rating: 4.7,
    stock: 88,
    material: 'Cold-pressed botanicals, 30ml',
    colors: ['Cream'],
    sizeSet: null,
    description:
      'A lightweight, cold-pressed serum of squalane, rosehip and vitamin C. Fragrance-free and dermatologist tested.',
    tags: ['serum', 'skincare', 'clean-beauty'],
  },
  {
    title: 'Oud & Amber Eau de Parfum',
    category: 'fragrances',
    brand: 'Maison Lune',
    price: 240,
    discount: 0,
    rating: 4.8,
    stock: 40,
    material: 'Eau de parfum, 100ml',
    colors: ['Black'],
    sizeSet: null,
    description:
      'Smoked oud wrapped in amber and a thread of saffron. Deep, resinous and quietly magnetic. 100ml.',
    tags: ['oud', 'amber', 'unisex'],
  },
  {
    title: 'Neroli & Vetiver Eau de Parfum',
    category: 'fragrances',
    brand: 'Herbier',
    price: 195,
    discount: 12,
    rating: 4.6,
    stock: 47,
    material: 'Eau de parfum, 100ml',
    colors: ['Ivory'],
    sizeSet: null,
    description:
      'Bright Tunisian neroli over a dry Haitian vetiver base. Wears like a white shirt, in the best sense. 100ml.',
    tags: ['neroli', 'vetiver', 'fresh'],
  },
  {
    title: 'Hydrating Rose Cream',
    category: 'skin-care',
    brand: 'Herbier',
    price: 128,
    discount: 0,
    rating: 4.5,
    stock: 62,
    material: 'Damask rose, ceramides, 50ml',
    colors: ['Rose'],
    sizeSet: null,
    description:
      'A cushiony cream of Damask rose water, ceramides and squalane that restores the barrier overnight.',
    tags: ['cream', 'hydration', 'skincare'],
  },

  // ————— Home & living —————
  {
    title: 'Hand-Thrown Ceramic Vase',
    category: 'home-decoration',
    brand: 'Terra Studio',
    price: 165,
    discount: 15,
    rating: 4.6,
    stock: 35,
    material: 'Stoneware, matte glaze',
    colors: ['Stone', 'Cream', 'Black'],
    sizeSet: null,
    description:
      'Thrown on the wheel and glazed in a soft matte stone finish. Each piece carries the maker’s marks.',
    tags: ['ceramic', 'vase', 'handmade'],
  },
  {
    title: 'Copper Espresso Set',
    category: 'kitchen-accessories',
    brand: 'Terra Studio',
    price: 210,
    discount: 0,
    rating: 4.7,
    stock: 29,
    material: 'Hammered copper, brass handles',
    colors: ['Cognac', 'Gold'],
    sizeSet: null,
    description:
      'A hammered copper espresso pot with four matching cups, lined in food-safe tin. Made to be used daily.',
    tags: ['copper', 'espresso', 'kitchen'],
  },
  {
    title: 'Oak Lounge Chair',
    category: 'furniture',
    brand: 'Nord Atelier',
    price: 1890,
    discount: 10,
    rating: 4.9,
    stock: 6,
    material: 'Solid European oak, wool bouclé',
    colors: ['Cream', 'Stone', 'Chocolate'],
    sizeSet: null,
    description:
      'A low, generous lounge chair in solid European oak with a hand-tailored wool bouclé seat. Built by joiners, not machines.',
    tags: ['oak', 'lounge', 'furniture'],
  },
];

const REVIEWERS = [
  ['Amelia Hart', 'amelia.hart@example.com'],
  ['Noor Al-Farsi', 'noor.alfarsi@example.com'],
  ['Julien Mercier', 'julien.mercier@example.com'],
  ['Sofia Lindqvist', 'sofia.l@example.com'],
  ['Rahul Mehta', 'rahul.mehta@example.com'],
  ['Clara Bennett', 'clara.bennett@example.com'],
  ['Youssef Hamdy', 'youssef.hamdy@example.com'],
  ['Ingrid Solberg', 'ingrid.solberg@example.com'],
];

const REVIEW_BODIES = [
  'Exceptional quality — the material feels far more expensive than the price. Would buy again without hesitation.',
  'Beautifully packaged and the fit is exactly as described. The finish is genuinely luxurious.',
  'A quiet, considered piece. It has already become the most worn thing in my wardrobe.',
  'Delivery was fast and the craftsmanship is impeccable. The colour is true to the photographs.',
  'Superb attention to detail. I purchased a second one for a gift and it was equally well received.',
  'Elegant and understated — exactly what I wanted. Sizing runs true.',
  'The texture and weight are perfect. Customer care was helpful when I had a question about care instructions.',
];

const sizeSets = {
  apparel: SIZES.apparel,
  shoes: SIZES.shoes,
  jewellery: SIZES.jewellery,
};

/** Build the normalised product objects from the seed list. */
function buildProducts() {
  return SEEDS.map((seed, index) => {
    const id = index + 1;
    const price = seed.price;
    // A whole-unit price gets a whole-unit "was" price ($545, not $545.45) so both read as one price scale.
    const rawOriginal = price / (1 - seed.discount / 100);
    const originalPrice = seed.discount > 0 ? (Number.isInteger(price) ? Math.round(rawOriginal) : Math.round(rawOriginal * 100) / 100) : null;
    const sizes = seed.sizeSet ? sizeSets[seed.sizeSet] : [];

    const reviewCount = 4 + (id % 4);
    const reviews = Array.from({ length: reviewCount }, (_, r) => {
      const [name, email] = REVIEWERS[(id + r) % REVIEWERS.length];
      const daysAgo = 4 + ((id * r + r) % 90);
      return {
        id: `${id}-${r + 1}`,
        rating: Math.min(5, Math.max(3, Math.round(seed.rating) - (r % 3 === 0 ? 0 : 1))),
        title: ['Beautifully made', 'Exceeded expectations', 'A true investment piece', 'Worth every penny'][r % 4],
        comment: REVIEW_BODIES[(id + r) % REVIEW_BODIES.length],
        date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
        reviewerName: name,
        reviewerEmail: email,
        verified: r % 4 !== 3,
        helpful: 3 + ((id * 7 + r * 3) % 24),
      };
    });

    // Four deterministic compositions per product (full view, detail, editorial, surface).
    const images = [0, 1, 2, 3].map((variant) => productArt(seed.title, seed.category, variant));

    return {
      id,
      title: seed.title,
      slug: seed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: seed.brand,
      category: seed.category,
      price,
      originalPrice,
      discountPercentage: seed.discount,
      rating: seed.rating,
      reviewCount: Math.round((seed.rating * 13) % 40) + 12, // an integer — it used to leak floats like 31.799999999999997
      stock: seed.stock,
      sku: `LUX-${String(1000 + id * 7)}`,
      material: seed.material,
      description: seed.description,
      colors: seed.colors.map(swatch),
      sizes,
      tags: seed.tags,
      images,
      thumbnail: images[0],
      weight: 0.4 + (id % 9) * 0.3,
      dimensions: { width: 12 + (id % 20), height: 6 + (id % 14), depth: 3 + (id % 9) },
      warrantyInformation: '2-year house guarantee on craftsmanship',
      shippingInformation: 'Dispatched within 24 hours from our regional atelier',
      returnPolicy: 'Complimentary returns within 30 days',
      availabilityStatus: seed.stock > 0 ? (seed.stock < 12 ? 'Low Stock' : 'In Stock') : 'Out of Stock',
      minimumOrderQuantity: 1,
      reviews,
      meta: { createdAt: new Date(Date.now() - (index + 1) * 86400000 * 6).toISOString() },
    };
  });
}

export const MOCK_PRODUCTS = buildProducts();

export const MOCK_CATEGORIES = [
  'beauty',
  'fragrances',
  'furniture',
  'home-decoration',
  'kitchen-accessories',
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'skin-care',
  'sunglasses',
  'tops',
  'womens-bags',
  'womens-dresses',
  'womens-jewellery',
  'womens-shoes',
  'womens-watches',
];
