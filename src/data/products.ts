export interface Product {
    id: string;
    name: string;
    category: "women" | "men" | "kids" | "home";
    subcategory: string;
    price: number;
    originalPrice?: number;
    images: string[];
    colors: { name: string; hex: string }[];
    sizes: string[];
    description: string;
    details: string[];
    care: string[];
    tags: string[];
    rating: number;
    reviews: number;
    isNew?: boolean;
    isSale?: boolean;
    isBestSeller?: boolean;
}

export const products: Product[] = [
    // WOMEN
    {
        id: "w001",
        name: "Embroidered Horizontal Stripes Polo Sweater",
        category: "women",
        subcategory: "Knitwear",
        price: 29.99,
        images: [
            "/photos/img2.1.webp",
            "/photos/img2.2.webp",
        ],
        colors: [
            { name: "Cream", hex: "#F5F0E8" },
            { name: "Black", hex: "#1A1A1A" },
            { name: "Navy", hex: "#1B2A4A" },
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        description:
            "Cozy slim-fit turtleneck sweater made from a soft ribbed fabric. Perfect for layering or wearing standalone.",
        details: [
            "Slim fit",
            "Ribbed fabric",
            "Turtleneck",
            "Long sleeves",
            "Composition: 80% cotton, 20% polyamide",
        ],
        care: ["Machine wash at 30°C", "Do not bleach", "Lay flat to dry"],
        tags: ["knitwear", "sweater", "winter", "bestseller"],
        rating: 4.5,
        reviews: 328,
        isBestSeller: true,
    },
    {
        id: "w002",
        name: "Wide-leg Linen Trousers",
        category: "women",
        subcategory: "Trousers",
        price: 34.99,
        images: [
            "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80",
            "https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=600&q=80",
        ],
        colors: [
            { name: "Beige", hex: "#D4C5A9" },
            { name: "White", hex: "#FFFFFF" },
            { name: "Black", hex: "#1A1A1A" },
        ],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        description:
            "Relaxed wide-leg trousers crafted from breathable linen blend. Features an elastic waistband and side pockets.",
        details: [
            "Wide-leg fit",
            "Elastic waistband",
            "Side pockets",
            "Composition: 55% linen, 45% viscose",
        ],
        care: ["Machine wash at 30°C", "Iron at medium temperature"],
        tags: ["trousers", "linen", "summer", "new"],
        rating: 4.3,
        reviews: 156,
        isNew: true,
    },
    {
        id: "w003",
        name: "Floral Wrap Dress",
        category: "women",
        subcategory: "Dresses",
        price: 39.99,
        originalPrice: 59.99,
        images: [
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
        ],
        colors: [
            { name: "Floral Pink", hex: "#E8A4B8" },
            { name: "Floral Blue", hex: "#A4B8E8" },
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        description:
            "Feminine wrap dress with a beautiful allover floral print. Features a V-neckline and a tie waist for a flattering silhouette.",
        details: [
            "Regular fit",
            "V-neckline",
            "Wrap front",
            "Tie waist",
            "Composition: 100% viscose",
        ],
        care: ["Hand wash", "Dry flat", "Do not tumble dry"],
        tags: ["dress", "floral", "summer", "sale"],
        rating: 4.7,
        reviews: 412,
        isSale: true,
    },
    {
        id: "w004",
        name: "Oversized Denim Jacket",
        category: "women",
        subcategory: "Jackets",
        price: 49.99,
        images: [
            "/photos/img3.2.webp",
            "/photos/img3.1.webp",
        ],
        colors: [
            { name: "Light Blue", hex: "#B8D4E8" },
            { name: "Dark Wash", hex: "#2C5282" },
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        description:
            "Classic oversized denim jacket with button closure and chest pockets. A wardrobe staple for every season.",
        details: [
            "Oversized fit",
            "Button closure",
            "Chest pockets",
            "Side pockets",
            "Composition: 100% cotton",
        ],
        care: ["Machine wash at 40°C", "Tumble dry low"],
        tags: ["jacket", "denim", "casual", "bestseller"],
        rating: 4.6,
        reviews: 287,
        isBestSeller: true,
    },
    {
        id: "w005",
        name: "V-Neck Knit Cardigan",
        category: "women",
        subcategory: "Knitwear",
        price: 27.99,
        images: [
            "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80",
            "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80",
        ],
        colors: [
            { name: "Sage Green", hex: "#8BAF9B" },
            { name: "Dusty Rose", hex: "#D4A5A5" },
            { name: "Oatmeal", hex: "#E8DDD0" },
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        description:
            "Soft button-up cardigan with a V-neckline and ribbed trims. Versatile piece that pairs well with anything.",
        details: [
            "Regular fit",
            "Button closure",
            "V-neckline",
            "Ribbed trims",
            "Composition: 50% cotton, 50% acrylic",
        ],
        care: ["Machine wash at 30°C", "Dry flat"],
        tags: ["cardigan", "knitwear", "layering"],
        rating: 4.4,
        reviews: 198,
        isNew: true,
    },
    {
        id: "w006",
        name: "High-Waist Skinny Jeans",
        category: "women",
        subcategory: "Jeans",
        price: 44.99,
        originalPrice: 54.99,
        images: [
            "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80",
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
        ],
        colors: [
            { name: "Dark Blue", hex: "#1B3A6B" },
            { name: "Black", hex: "#1A1A1A" },
            { name: "Mid Blue", hex: "#4A7AB5" },
        ],
        sizes: ["24", "25", "26", "27", "28", "29", "30", "31", "32"],
        description:
            "Super stretch high-waist skinny jeans with a flattering silhouette and 5-pocket design.",
        details: [
            "Skinny fit",
            "High waist",
            "5-pocket design",
            "Composition: 72% cotton, 26% polyester, 2% elastane",
        ],
        care: ["Machine wash at 40°C", "Do not tumble dry"],
        tags: ["jeans", "denim", "skinny", "sale"],
        rating: 4.2,
        reviews: 524,
        isSale: true,
    },
    // MEN
    {
        id: "m001",
        name: "Regular Fit Oxford Shirt",
        category: "men",
        subcategory: "Shirts",
        price: 24.99,
        images: [
            "/photos/img1.1.webp",
            "/photos/img1.3.webp",
        ],
        colors: [
            { name: "White", hex: "#FFFFFF" },
            { name: "Light Blue", hex: "#B8D4E8" },
            { name: "Navy", hex: "#1B2A4A" },
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        description:
            "Classic regular-fit Oxford shirt with a button-down collar. An essential piece for any wardrobe.",
        details: [
            "Regular fit",
            "Button-down collar",
            "Chest pocket",
            "Composition: 100% cotton",
        ],
        care: ["Machine wash at 40°C", "Iron at medium temperature"],
        tags: ["shirt", "oxford", "classic", "bestseller"],
        rating: 4.4,
        reviews: 389,
        isBestSeller: true,
    },
    {
        id: "m002",
        name: "Slim-fit Chino Trousers",
        category: "men",
        subcategory: "Trousers",
        price: 34.99,
        images: [
            "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        ],
        colors: [
            { name: "Khaki", hex: "#C8A96E" },
            { name: "Navy", hex: "#1B2A4A" },
            { name: "Olive", hex: "#6B7C4A" },
        ],
        sizes: ["28x30", "30x30", "32x30", "32x32", "34x30", "34x32", "36x32"],
        description:
            "Versatile slim-fit chino trousers with a straight leg and 5-pocket design. Perfect for smart-casual occasions.",
        details: [
            "Slim fit",
            "5-pocket design",
            "Slightly tapered leg",
            "Composition: 98% cotton, 2% elastane",
        ],
        care: ["Machine wash at 40°C", "Tumble dry low"],
        tags: ["chinos", "trousers", "smart-casual"],
        rating: 4.5,
        reviews: 267,
        isNew: true,
    },
    {
        id: "m003",
        name: "Merino Wool Crewneck Sweater",
        category: "men",
        subcategory: "Knitwear",
        price: 59.99,
        originalPrice: 79.99,
        images: [
            "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
            "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
        ],
        colors: [
            { name: "Charcoal", hex: "#4A4A4A" },
            { name: "Burgundy", hex: "#7C2D2D" },
            { name: "Forest Green", hex: "#2D5A3D" },
        ],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        description:
            "Luxurious merino wool crewneck sweater with a regular fit. Naturally soft and temperature-regulating.",
        details: [
            "Regular fit",
            "Crewneck",
            "Ribbed trims",
            "Composition: 100% merino wool",
        ],
        care: ["Hand wash", "Dry flat", "Do not tumble dry"],
        tags: ["sweater", "merino", "wool", "sale"],
        rating: 4.8,
        reviews: 143,
        isSale: true,
    },
    {
        id: "m004",
        name: "Regular-fit T-shirt",
        category: "men",
        subcategory: "T-shirts",
        price: 9.99,
        images: [
            "/photos/img4.1.webp",
            "/photos/img4.2.webp",
        ],
        colors: [
            { name: "White", hex: "#FFFFFF" },
            { name: "Black", hex: "#1A1A1A" },
            { name: "Gray", hex: "#9CA3AF" },
            { name: "Navy", hex: "#1B2A4A" },
        ],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        description:
            "Essential crew-neck t-shirt made from soft jersey fabric. A versatile everyday essential.",
        details: [
            "Regular fit",
            "Crew neck",
            "Short sleeves",
            "Composition: 100% cotton",
        ],
        care: ["Machine wash at 40°C", "Tumble dry low"],
        tags: ["t-shirt", "basic", "casual", "bestseller"],
        rating: 4.1,
        reviews: 892,
        isBestSeller: true,
    },
    {
        id: "m005",
        name: "Slim-fit Suit Jacket",
        category: "men",
        subcategory: "Suits & Blazers",
        price: 79.99,
        images: [
            "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80",
            "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
        ],
        colors: [
            { name: "Navy", hex: "#1B2A4A" },
            { name: "Charcoal", hex: "#3A3A3A" },
            { name: "Light Gray", hex: "#D1D5DB" },
        ],
        sizes: ["44", "46", "48", "50", "52", "54"],
        description:
            "Sharp slim-fit suit jacket with notched lapels and a two-button closure. Ideal for formal and smart occasions.",
        details: [
            "Slim fit",
            "Notched lapels",
            "Two-button closure",
            "Welt pockets",
            "Composition: 65% polyester, 35% viscose",
        ],
        care: ["Dry clean only"],
        tags: ["suit", "blazer", "formal", "new"],
        rating: 4.6,
        reviews: 78,
        isNew: true,
    },
    {
        id: "m006",
        name: "Relaxed-fit Cargo Shorts",
        category: "men",
        subcategory: "Shorts",
        price: 29.99,
        originalPrice: 34.99,
        images: [
            "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80",
            "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80",
        ],
        colors: [
            { name: "Khaki", hex: "#C8A96E" },
            { name: "Olive", hex: "#6B7C4A" },
            { name: "Black", hex: "#1A1A1A" },
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        description:
            "Casual cargo shorts with multiple pockets and a relaxed fit. Perfect for outdoor adventures.",
        details: [
            "Relaxed fit",
            "Cargo pockets",
            "Drawstring waist",
            "Composition: 100% cotton",
        ],
        care: ["Machine wash at 40°C", "Tumble dry low"],
        tags: ["shorts", "cargo", "casual", "summer", "sale"],
        rating: 4.3,
        reviews: 201,
        isSale: true,
    },
    // KIDS
    {
        id: "k001",
        name: "Hooded Sweatshirt (Kids)",
        category: "kids",
        subcategory: "Tops",
        price: 19.99,
        images: [
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
        ],
        colors: [
            { name: "Pink", hex: "#F9A8D4" },
            { name: "Blue", hex: "#93C5FD" },
            { name: "Green", hex: "#86EFAC" },
        ],
        sizes: ["2-4Y", "4-6Y", "6-8Y", "8-10Y", "10-12Y", "12-14Y"],
        description:
            "Soft cotton-blend hooded sweatshirt with a kangaroo pocket and adjustable drawstring hood.",
        details: [
            "Regular fit",
            "Drawstring hood",
            "Kangaroo pocket",
            "Ribbed cuffs and hem",
            "Composition: 80% cotton, 20% polyester",
        ],
        care: ["Machine wash at 40°C", "Tumble dry low"],
        tags: ["kids", "hoodie", "casual"],
        rating: 4.6,
        reviews: 312,
        isBestSeller: true,
    },
    {
        id: "k002",
        name: "Printed Cotton Leggings (Kids)",
        category: "kids",
        subcategory: "Bottoms",
        price: 9.99,
        images: [
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
        ],
        colors: [
            { name: "Unicorn Print", hex: "#E8B4D4" },
            { name: "Star Print", hex: "#B4C8E8" },
        ],
        sizes: ["2-4Y", "4-6Y", "6-8Y", "8-10Y", "10-12Y"],
        description:
            "Fun printed leggings made from soft jersey fabric with an elastic waistband. Great for active kids.",
        details: [
            "Slim fit",
            "Elastic waistband",
            "All-over print",
            "Composition: 95% cotton, 5% elastane",
        ],
        care: ["Machine wash at 40°C", "Do not tumble dry"],
        tags: ["kids", "leggings", "printed"],
        rating: 4.5,
        reviews: 187,
        isNew: true,
    },
    {
        id: "k003",
        name: "Denim Dungarees (Kids)",
        category: "kids",
        subcategory: "Bottoms",
        price: 24.99,
        images: [
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
            "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80",
        ],
        colors: [
            { name: "Light Denim", hex: "#B8D4E8" },
            { name: "Dark Denim", hex: "#1B3A6B" },
        ],
        sizes: ["2-4Y", "4-6Y", "6-8Y", "8-10Y", "10-12Y"],
        description:
            "Classic denim dungarees with adjustable shoulder straps and multiple pockets.",
        details: [
            "Regular fit",
            "Adjustable shoulder straps",
            "Front bib pocket",
            "Side pockets",
            "Composition: 100% cotton",
        ],
        care: ["Machine wash at 40°C", "Tumble dry low"],
        tags: ["kids", "denim", "dungarees"],
        rating: 4.7,
        reviews: 234,
        isBestSeller: true,
    },
    {
        id: "k004",
        name: "Unicorn Print Pyjama Set",
        category: "kids",
        subcategory: "Nightwear",
        price: 17.99,
        originalPrice: 22.99,
        images: [
            "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80",
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
        ],
        colors: [
            { name: "Lilac", hex: "#D8B4FE" },
            { name: "Pink", hex: "#F9A8D4" },
        ],
        sizes: ["2-4Y", "4-6Y", "6-8Y", "8-10Y", "10-12Y"],
        description:
            "Cosy pyjama set featuring an all-over unicorn print. Includes a long-sleeve top and matching trousers.",
        details: [
            "Set includes: top and trousers",
            "All-over print",
            "Elastic waistband on trousers",
            "Composition: 100% cotton",
        ],
        care: ["Machine wash at 40°C", "Tumble dry low"],
        tags: ["kids", "pyjama", "nightwear", "sale"],
        rating: 4.8,
        reviews: 156,
        isSale: true,
    },
    // HOME
    {
        id: "h001",
        name: "Washed Linen Duvet Cover Set",
        category: "home",
        subcategory: "Bedding",
        price: 69.99,
        images: [
            "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=600&q=80",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
        ],
        colors: [
            { name: "Natural", hex: "#E8DDD0" },
            { name: "Dusty Blue", hex: "#A4B8D4" },
            { name: "Sage", hex: "#8BAF9B" },
        ],
        sizes: ["Single", "Double", "King", "Super King"],
        description:
            "Luxuriously soft washed linen duvet cover and pillowcase set. Gets softer with every wash.",
        details: [
            "Set includes: 1 duvet cover + 2 pillowcases",
            "Button closure",
            "Composition: 100% washed linen",
            "Oeko-Tex certified",
        ],
        care: ["Machine wash at 60°C", "Tumble dry medium"],
        tags: ["bedding", "linen", "home", "bestseller"],
        rating: 4.7,
        reviews: 421,
        isBestSeller: true,
    },
    {
        id: "h002",
        name: "Stoneware Mug Set (4-pack)",
        category: "home",
        subcategory: "Dining",
        price: 24.99,
        images: [
            "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
        ],
        colors: [
            { name: "Mixed Earth", hex: "#C8A96E" },
            { name: "Sage", hex: "#8BAF9B" },
        ],
        sizes: ["One Size"],
        description:
            "Set of 4 handcrafted stoneware mugs in a variety of earthy tones. Microwave and dishwasher safe.",
        details: [
            "Set of 4 mugs",
            "Capacity: 350ml",
            "Microwave safe",
            "Dishwasher safe",
            "Material: stoneware",
        ],
        care: ["Dishwasher safe"],
        tags: ["mugs", "dining", "stoneware", "home"],
        rating: 4.9,
        reviews: 287,
        isNew: true,
    },
    {
        id: "h003",
        name: "Abstract Canvas Wall Art",
        category: "home",
        subcategory: "Art & Decor",
        price: 39.99,
        originalPrice: 49.99,
        images: [
            "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80",
            "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=600&q=80",
        ],
        colors: [
            { name: "Earth Tones", hex: "#C8A96E" },
            { name: "Blue & White", hex: "#B8D4E8" },
        ],
        sizes: ["40x50cm", "60x80cm", "80x100cm"],
        description:
            "Minimalist abstract canvas print with a contemporary design. Ready to hang with included hardware.",
        details: [
            "Ready to hang",
            "Includes hanging hardware",
            "Print on stretched canvas",
            "Multiple sizes available",
        ],
        care: ["Wipe clean with dry cloth"],
        tags: ["art", "decor", "wall art", "home", "sale"],
        rating: 4.5,
        reviews: 134,
        isSale: true,
    },
    {
        id: "h004",
        name: "Organic Cotton Throw Blanket",
        category: "home",
        subcategory: "Textiles",
        price: 29.99,
        images: [
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
            "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=600&q=80",
        ],
        colors: [
            { name: "Oatmeal", hex: "#E8DDD0" },
            { name: "Slate Blue", hex: "#6B89A5" },
            { name: "Terracotta", hex: "#C4704F" },
        ],
        sizes: ["130x170cm"],
        description:
            "Soft organic cotton throw blanket with a subtle woven texture. Perfect for cosying up on the sofa.",
        details: [
            "Composition: 100% organic cotton",
            "GOTS certified",
            "Woven texture",
            "Size: 130x170cm",
        ],
        care: ["Machine wash at 30°C", "Dry flat"],
        tags: ["blanket", "throw", "organic", "home"],
        rating: 4.6,
        reviews: 198,
        isBestSeller: true,
    },
];

export const getProductsByCategory = (category: string) =>
    products.filter((p) => p.category === category);

export const getProductById = (id: string) =>
    products.find((p) => p.id === id);

export const getRelatedProducts = (product: Product, limit = 4) =>
    products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, limit);

export const searchProducts = (query: string) => {
    const q = query.toLowerCase();
    return products.filter(
        (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some((t) => t.includes(q)) ||
            p.category.includes(q)
    );
};
