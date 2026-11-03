import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'dsa',
  database: 'shopify_db',
  waitForConnections: true,
  connectionLimit: 10,
})

// REAL WORLD DIVERSE INDIAN MARKET CATALOG
const REAL_CATALOG = {
  Mobiles: {
    Vivo: [
      { model: 'Vivo X100 Pro 5G (ZEISS APO Telephoto, 16GB, 512GB)', mrp: 99999, price: 89999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'Vivo X100 5G (ZEISS Optics, 12GB, 256GB)', mrp: 69999, price: 63999, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      { model: 'Vivo V30 Pro 5G (50MP Eye-AF, 512GB)', mrp: 46999, price: 41999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Vivo V30 5G (Studio Aura Light, 256GB)', mrp: 38999, price: 33999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
      { model: 'Vivo V30e 5G (5500 mAh Slim Battery, 128GB)', mrp: 32999, price: 27999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'Vivo T3 Pro 5G (Snapdragon 7 Gen 3, 256GB)', mrp: 29999, price: 24999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Vivo T3 5G (Dimensity 7200, 128GB)', mrp: 22999, price: 19999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
      { model: 'Vivo T3x 5G (6000 mAh Turbo Battery, 128GB)', mrp: 17999, price: 13499, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'Vivo T3 Lite 5G (Sony AI Camera, 128GB)', mrp: 14499, price: 10499, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      { model: 'Vivo Y200e 5G (EcoFiber Leather, 128GB)', mrp: 25999, price: 20999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'Vivo Y58 5G (6000mAh, Sunlight Display, 128GB)', mrp: 23999, price: 19499, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Vivo Y28 5G (Crystal Design, 128GB)', mrp: 19999, price: 13999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
      { model: 'Vivo Y18e (5000 mAh, 64GB)', mrp: 9999, price: 7999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
    ],
    Samsung: [
      { model: 'Galaxy S24 Ultra 5G (AI Enabled, 256GB)', mrp: 134999, price: 121999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
      { model: 'Galaxy S24 Plus 5G (256GB)', mrp: 109999, price: 94999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
      { model: 'Galaxy S24 5G (128GB)', mrp: 82999, price: 74999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
      { model: 'Galaxy S23 Ultra 5G (200MP Camera, 256GB)', mrp: 124999, price: 89999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
      { model: 'Galaxy S23 FE 5G (128GB)', mrp: 59999, price: 38999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Galaxy Z Fold 6 5G (AI Foldable, 256GB)', mrp: 174999, price: 164999, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      { model: 'Galaxy Z Flip 6 5G (Compact AI, 256GB)', mrp: 119999, price: 109999, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      { model: 'Galaxy A55 5G (Gorilla Glass Victus, 128GB)', mrp: 44999, price: 39999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Galaxy A35 5G (Super AMOLED 120Hz, 128GB)', mrp: 33999, price: 27999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Galaxy M35 5G (6000 mAh Battery, 128GB)', mrp: 21999, price: 16999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'Galaxy M15 5G (sAMOLED 90Hz, 128GB)', mrp: 15999, price: 12999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'Galaxy F54 5G (108MP No Shake OIS, 256GB)', mrp: 29999, price: 22999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
    ],
    Apple: [
      { model: 'iPhone 16 Pro Max (Desert Titanium, 256GB)', mrp: 144900, price: 144900, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'iPhone 16 Pro (Natural Titanium, 128GB)', mrp: 119900, price: 119900, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'iPhone 16 (Ultramarine Blue, 128GB)', mrp: 79900, price: 79900, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      { model: 'iPhone 16 Plus (Pink, 128GB)', mrp: 89900, price: 89900, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      { model: 'iPhone 15 Pro Max (Blue Titanium, 256GB)', mrp: 159900, price: 148900, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'iPhone 15 Pro (128GB)', mrp: 134900, price: 124900, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'iPhone 15 (Dynamic Island, 128GB)', mrp: 79900, price: 65999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'iPhone 15 Plus (128GB)', mrp: 89900, price: 75999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'iPhone 14 (Midnight, 128GB)', mrp: 69900, price: 54999, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      { model: 'iPhone 13 (Starlight, 128GB)', mrp: 59900, price: 48999, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
      { model: 'iPhone SE 3rd Gen (A15 Bionic, 64GB)', mrp: 49900, price: 32999, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
    ],
    OnePlus: [
      { model: 'OnePlus 12 5G (Hasselblad Camera, 16GB, 512GB)', mrp: 69999, price: 64999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'OnePlus 12R 5G (Snapdragon 8 Gen 2, 256GB)', mrp: 45999, price: 42999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'OnePlus Open Foldable 5G (512GB)', mrp: 149999, price: 139999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'OnePlus Nord 4 5G (Metal Unibody, 256GB)', mrp: 32999, price: 29999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'OnePlus Nord CE4 5G (100W SUPERVOOC, 128GB)', mrp: 27999, price: 24999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'OnePlus Nord CE4 Lite 5G (Sony LYTIA, 128GB)', mrp: 21999, price: 19999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
    ],
    Xiaomi: [
      { model: 'Xiaomi 14 Ultra 5G (Leica Quad 50MP, 512GB)', mrp: 119999, price: 99999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Xiaomi 14 5G (Snapdragon 8 Gen 3, 512GB)', mrp: 79999, price: 59999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Redmi Note 13 Pro+ 5G (IP68, 200MP, 256GB)', mrp: 33999, price: 27999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Redmi Note 13 Pro 5G (Snapdragon 7s Gen 2, 128GB)', mrp: 28999, price: 21999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Redmi Note 13 5G (108MP 120Hz, 128GB)', mrp: 20999, price: 15999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Redmi 13C 5G (Star Trail Design, 128GB)', mrp: 13999, price: 9999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
    ],
    Realme: [
      { model: 'Realme GT 6 5G (AI Flagship, 256GB)', mrp: 44999, price: 40999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'Realme 12 Pro+ 5G (Periscope Portrait, 256GB)', mrp: 34999, price: 29999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'Realme 12 Pro 5G (Submarine Design, 128GB)', mrp: 27999, price: 21999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'Realme Narzo 70 Pro 5G (Air Gestures, 128GB)', mrp: 24999, price: 17999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
      { model: 'Realme P1 5G (Phoenix Design, 128GB)', mrp: 20999, price: 14999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
    ],
    'Google Pixel': [
      { model: 'Pixel 9 Pro XL (Google Tensor G4, 256GB)', mrp: 124999, price: 124999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'Pixel 9 5G (Gemini AI Built-in, 128GB)', mrp: 79999, price: 79999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'Pixel 8 Pro (Pro Camera Controls, 128GB)', mrp: 106999, price: 89999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
      { model: 'Pixel 8a (7 Years OS Updates, 128GB)', mrp: 52999, price: 49999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
    ],
    Motorola: [
      { model: 'Edge 50 Ultra 5G (Real Wood Finish, 512GB)', mrp: 64999, price: 54999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Edge 50 Pro 5G (Pantone Validated, 256GB)', mrp: 36999, price: 29999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Edge 50 Fusion 5G (IP68 Underwater Protection, 128GB)', mrp: 25999, price: 22999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Moto G85 5G (Curved pOLED Display, 128GB)', mrp: 20999, price: 17999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
      { model: 'Moto G34 5G (Vegan Leather, 128GB)', mrp: 13999, price: 10999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
    ]
  },

  'Home & Kitchen': {
    Prestige: [
      { model: 'Iris 750 Watt Mixer Grinder with 4 Stainless Jars', mrp: 6295, price: 2899, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Deluxe Alpha Outer Lid Stainless Steel Pressure Cooker 3L', mrp: 2890, price: 2150, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'PIC 20 1200-Watt Induction Cooktop with Push Buttons', mrp: 3495, price: 1799, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { model: 'Omega Deluxe Granite Non-Stick Kitchen Set (Fry Pan, Omni Tawa, Kadai)', mrp: 4950, price: 2499, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'Marvel Plus 3 Burner Toughened Glass Gas Stove', mrp: 8195, price: 4299, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Electric Grill Sandwich & Panini Maker PGMFB', mrp: 1695, price: 1199, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { model: 'Electric Kettle PKOSS 1.5 Litre 1500W', mrp: 1295, price: 649, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    ],
    Hawkins: [
      { model: 'Contura Black Hard Anodised Pressure Cooker 3L', mrp: 2350, price: 1999, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'Futura Nonstick Frying Pan 26cm with Stay-Cool Handle', mrp: 1750, price: 1475, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'Classic Aluminium Pressure Cooker Inner Lid 5L', mrp: 2150, price: 1845, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'Tri-ply Stainless Steel Deep Kadhai 2.5L with Glass Lid', mrp: 2600, price: 2190, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
    ],
    Philips: [
      { model: 'Digital Air Fryer HD9252/90 with Rapid Air Technology 4.1L', mrp: 12995, price: 7499, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'HL7756/00 750W Mixer Grinder with 3 Heavy Duty Jars', mrp: 5295, price: 3299, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Daily Collection 2-Slice 830W Pop-up Toaster HD2582', mrp: 2195, price: 1499, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { model: 'Promix 650W Hand Blender with Chopper and Whisk Attachment', mrp: 3495, price: 2199, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Viva Collection 2L Electric Rice Cooker with Automatic Warm Mode', mrp: 3295, price: 2399, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    ],
    Bajaj: [
      { model: 'Rex 500W Mixer Grinder with 3 Stainless Steel Jars', mrp: 3620, price: 1999, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: '20L Grill Microwave Oven (2005 ETB, White)', mrp: 8500, price: 5699, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { model: 'Majesty 1603 T 16L Oven Toaster Griller (OTG)', mrp: 5200, price: 3499, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { model: 'Immersion Electric Water Heater Rod 1500 Watt', mrp: 999, price: 599, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Popular Plus 2 Burner Stainless Steel Gas Cooktop', mrp: 3499, price: 2199, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    ],
    Kent: [
      { model: 'Grand Plus RO+UV+UF+TDS Water Purifier 9L Tank', mrp: 20000, price: 14999, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'Instant Automatic Egg Boiler 360W 7 Eggs Capacity', mrp: 1800, price: 999, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { model: 'Smart Chef 250W Electric Vegetable & Onion Chopper', mrp: 2000, price: 1299, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    ],
    Wonderchef: [
      { model: 'Nutri-blend 400W 22000 RPM Mixer Grinder & Smoothie Maker', mrp: 5000, price: 2499, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Royal Velvet Non-Stick Cookware Induction Friendly 4 Pcs Set', mrp: 4000, price: 2199, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'Prato Compact 2.5L Oil-Free Air Fryer 1000W', mrp: 5500, price: 2999, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    ],
    Pigeon: [
      { model: 'by Stovekraft 4 Burner Toughened Glass Gas Cooktop', mrp: 6995, price: 3199, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Sheen 750 Watt Mixer Grinder with 3 Jars', mrp: 3595, price: 1699, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Stainless Steel 1.5L Electric Cordless Kettle', mrp: 1195, price: 549, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { model: 'Special Aluminium Inner Lid Pressure Cooker 3L', mrp: 1495, price: 749, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
    ],
    Milton: [
      { model: 'Thermosteel Flip Lid 1000ml Hot & Cold Flask 24 Hours', mrp: 1165, price: 849, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'Executive Insulated Lunch Box with 3 Stainless Containers', mrp: 680, price: 449, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { model: 'Microelite Casserole Set of 3 Food Grade Heatproof', mrp: 1999, price: 1299, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
    ],
    Borosil: [
      { model: '100% Borosilicate Glass Mixing & Serving Bowls (Set of 3)', mrp: 1390, price: 899, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
      { model: 'Super Pro 1000W Non-Stick Grill Sandwich Maker', mrp: 2690, price: 1799, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },
      { model: 'Stainless Steel Vacuum Insulated Hydra Trek Flask 700ml', mrp: 1195, price: 899, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
    ],
  },

  Laptops: {
    Apple: [
      { model: 'MacBook Air M2 13.6-inch (8GB Unified, 256GB SSD)', mrp: 99900, price: 84990, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
      { model: 'MacBook Air M3 15-inch (16GB Unified, 512GB SSD)', mrp: 154900, price: 139990, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
      { model: 'MacBook Pro M3 14-inch (16GB Unified, 512GB SSD)', mrp: 169900, price: 154990, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
      { model: 'MacBook Pro M3 Max 16-inch (36GB RAM, 1TB SSD)', mrp: 349900, price: 329900, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
    ],
    Dell: [
      { model: 'XPS 13 9340 Intel Core Ultra 7 (16GB, 512GB SSD, OLED)', mrp: 149990, price: 129990, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
      { model: 'Inspiron 15 3520 Intel Core i5 12th Gen (16GB, 512GB SSD)', mrp: 61990, price: 47990, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
      { model: 'G15 5530 Gaming Intel Core i7 13th Gen RTX 4060', mrp: 119990, price: 99990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { model: 'Vostro 14 3420 Intel Core i3 11th Gen 8GB 512GB', mrp: 44990, price: 32990, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
    ],
    HP: [
      { model: 'Pavilion 15 Intel Core i5 13th Gen (16GB, 512GB SSD, FHD)', mrp: 68990, price: 54990, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
      { model: 'Victus Gaming AMD Ryzen 7 7840HS RTX 3050 16GB', mrp: 86990, price: 68990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { model: 'Envy x360 2-in-1 Touch Intel Core Ultra 5 16GB OLED', mrp: 104990, price: 89990, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
      { model: '15s Intel Core i3 12th Gen 8GB 512GB SSD', mrp: 47990, price: 35990, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
    ],
    Lenovo: [
      { model: 'Legion Pro 5 Intel Core i7 14th Gen RTX 4070 32GB', mrp: 189990, price: 154990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { model: 'LOQ 15 Gaming Intel Core i5 13th Gen RTX 3050 16GB', mrp: 84990, price: 64990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { model: 'IdeaPad Slim 3 Intel Core i5 12th Gen 16GB 512GB', mrp: 62990, price: 47990, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
      { model: 'Yoga 7 2-in-1 Touch AMD Ryzen 7 16GB 1TB OLED', mrp: 114990, price: 92990, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
    ],
    ASUS: [
      { model: 'TUF Gaming F15 Intel Core i5 11th Gen RTX 2050 16GB', mrp: 74990, price: 49990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { model: 'ROG Strix G16 Intel Core i7 13th Gen RTX 4060 16GB', mrp: 149990, price: 124990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { model: 'Vivobook 15 Intel Core i3 12th Gen 8GB 512GB', mrp: 45990, price: 34990, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
      { model: 'Zenbook 14 OLED Intel Core Ultra 7 16GB 1TB', mrp: 122990, price: 104990, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
    ],
    Acer: [
      { model: 'Nitro V Gaming Intel Core i5 13th Gen RTX 4050 16GB', mrp: 86990, price: 69990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { model: 'Predator Helios 16 Intel Core i9 14th Gen RTX 4080', mrp: 249990, price: 219990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
      { model: 'Aspire Lite AMD Ryzen 5 5500U 16GB 512GB SSD', mrp: 54990, price: 35990, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
    ],
  },

  Footwear: {
    Nike: [
      { model: 'Air Max 270 Men\'s Breathable Running Shoes', mrp: 13995, price: 10495, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Air Force 1 \'07 Triple White Leather Classic', mrp: 8195, price: 7495, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
      { model: 'Air Zoom Pegasus 40 Road Running Shoes', mrp: 11895, price: 8995, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Revolution 6 Next Nature Everyday Road Running', mrp: 3695, price: 2495, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Court Vision Low Men\'s Retro Basketball Sneakers', mrp: 4995, price: 3995, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
    ],
    Adidas: [
      { model: 'Ultraboost Light Men\'s High Performance Running', mrp: 17999, price: 12999, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
      { model: 'Stan Smith Classic White Leather Tennis Shoes', mrp: 7999, price: 5499, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
      { model: 'Samba OG Leather Streetwear Low Sneakers', mrp: 10999, price: 9999, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
      { model: 'Cloudfoam Pure 2.0 Women\'s Slip-On Walking Shoes', mrp: 4999, price: 2799, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600' },
      { model: 'Superstar Classic Shell-Toe Originals', mrp: 8999, price: 6999, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
    ],
    Puma: [
      { model: 'Smash V2 Leather Unisex Casual Sneakers', mrp: 3999, price: 1899, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600' },
      { model: 'Ferrari Drift Cat Decima Motorsport Driving Shoes', mrp: 6999, price: 4499, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Darter Pro High Cushioning Road Running Shoes', mrp: 5499, price: 2999, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Suede Classic XXI Low-Top Heritage Sneakers', mrp: 6499, price: 4799, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600' },
    ],
    Jordan: [
      { model: 'Air Jordan 1 Low Chicago Red / White', mrp: 8995, price: 8295, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600' },
      { model: 'Air Jordan 1 Mid Men\'s Basketball Classic', mrp: 11495, price: 10495, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600' },
      { model: 'Jordan Stay Loyal 3 Cushion Lifestyle Shoes', mrp: 9995, price: 7495, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600' },
    ],
    Asics: [
      { model: 'Gel-Nimbus 26 Max Cushion Running Shoes', mrp: 15999, price: 12499, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Gel-Kayano 30 Stability Distance Road Shoes', mrp: 16999, price: 13999, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Japan S Vintage Court Basketball Sneakers', mrp: 6999, price: 4999, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
    ],
    Woodland: [
      { model: 'Men\'s Camel Leather High-Ankle Outdoor Trekking Boots', mrp: 5495, price: 3845, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Genuine Leather Khaki Casual Loafers', mrp: 4295, price: 2995, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600' },
    ],
    Campus: [
      { model: 'North Plus Running Shoes with Memory Foam Insole', mrp: 1899, price: 1299, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
      { model: 'Oxyfit Breathable Mesh Everyday Walking Shoes', mrp: 1299, price: 899, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
    ]
  },

  Electronics: {
    Sony: [
      { model: 'WH-1000XM5 Wireless Noise Cancelling Headphones (30h Battery)', mrp: 34990, price: 26990, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { model: 'WF-1000XM5 True Wireless Noise Cancelling Earbuds', mrp: 29990, price: 21990, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { model: 'SRS-XB100 Wireless Ultra-Portable Bluetooth Speaker', mrp: 4990, price: 3990, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' },
      { model: 'ZV-1F Vlog Camera with 20mm Ultra-Wide Lens', mrp: 54990, price: 46990, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600' },
    ],
    boAt: [
      { model: 'Airdopes 141 Bluetooth True Wireless Earbuds with 42H Playtime', mrp: 4490, price: 1299, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
      { model: 'Rockerz 450 Bluetooth On-Ear Headphones with 15H Playtime', mrp: 3990, price: 1499, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { model: 'Stone 350 10W Wireless Bluetooth Speaker with RGB LED', mrp: 3490, price: 1499, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' },
      { model: 'Rockerz 255 Pro+ In-Ear Bluetooth Neckband with ASAP Charge', mrp: 3990, price: 1299, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
    ],
    JBL: [
      { model: 'Flip 6 Powerful Bluetooth Speaker IP67 Waterproof', mrp: 13999, price: 9999, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' },
      { model: 'Tune 770NC Wireless Over-Ear Active Noise Cancelling', mrp: 9999, price: 5999, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { model: 'Go 3 Ultra-Portable Waterproof Bluetooth Speaker', mrp: 3999, price: 2899, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' },
      { model: 'Wave 200 TWS Earbuds Deep Bass Sound', mrp: 4999, price: 2499, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
    ],
    Apple: [
      { model: 'AirPods Pro (2nd Generation) with MagSafe Case USB-C', mrp: 24900, price: 20990, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { model: 'AirPods (3rd Generation) with Lightning Charging Case', mrp: 19900, price: 15990, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { model: 'AirPods Max Wireless Over-Ear Active Noise Cancelling', mrp: 59900, price: 54990, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
    ],
    Bose: [
      { model: 'QuietComfort Ultra Wireless Noise Cancelling Headphones', mrp: 35900, price: 29900, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
      { model: 'SoundLink Flex Bluetooth Portable Waterproof Speaker', mrp: 15900, price: 12900, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' },
    ],
    Canon: [
      { model: 'EOS R50 4K Mirrorless Camera with RF-S 18-45mm IS STM Lens', mrp: 62995, price: 54990, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600' },
      { model: 'EOS 1500D 24.1MP Digital SLR Camera with 18-55mm Lens', mrp: 47995, price: 41990, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600' },
    ]
  },

  Watches: {
    Apple: [
      { model: 'Apple Watch Series 9 GPS 45mm Sport Band', mrp: 44900, price: 38990, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { model: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium', mrp: 89900, price: 84990, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { model: 'Apple Watch SE 2nd Gen GPS 44mm Midnight', mrp: 32900, price: 27990, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    ],
    Samsung: [
      { model: 'Galaxy Watch 6 Bluetooth 44mm Sapphire Crystal', mrp: 29999, price: 19999, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { model: 'Galaxy Watch Ultra 47mm LTE Titanium Gray', mrp: 59999, price: 54999, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { model: 'Galaxy Watch 4 Classic Bluetooth 46mm', mrp: 34999, price: 10999, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    ],
    Casio: [
      { model: 'G-Shock GA-2100-1A1DR All Black Carbon Core Guard', mrp: 8995, price: 7495, img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600' },
      { model: 'Vintage Digital Gold Tone Metal Strap A168WG', mrp: 4495, price: 3795, img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600' },
      { model: 'Edifice Tachymeter Chronograph Sapphire Glass EF-539D', mrp: 12995, price: 9995, img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600' },
    ],
    Titan: [
      { model: 'Workwear Contemporary Brown Leather Dial Analog Watch', mrp: 4995, price: 3495, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' },
      { model: 'Edge Ultra-Slim All Black Ceramic Analog Luxury Watch', mrp: 24995, price: 19995, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' },
      { model: 'Neo Splash Blue Sunray Dial Stainless Steel', mrp: 6495, price: 4795, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' },
    ],
    Fossil: [
      { model: 'Grant Chronograph Light Brown Genuine Leather Watch', mrp: 12495, price: 7995, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' },
      { model: 'Neutra Automatic Skeleton Black Stainless Steel Watch', mrp: 18995, price: 13995, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' },
    ],
    Noise: [
      { model: 'ColorFit Pulse 3 AMOLED Display 1.96-inch Bluetooth Calling', mrp: 3999, price: 1499, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { model: 'Halo Plus Metallic Strap Smartwatch with 1.46 AMOLED', mrp: 7999, price: 2999, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    ]
  },

  Gaming: {
    Sony: [
      { model: 'PlayStation 5 Console (Disc Edition) with 1TB SSD & DualSense', mrp: 54990, price: 47990, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600' },
      { model: 'DualSense Wireless Controller White for PS5', mrp: 5990, price: 4990, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600' },
      { model: 'PULSE 3D Wireless Headset for PlayStation 5', mrp: 8990, price: 6990, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
    ],
    Microsoft: [
      { model: 'Xbox Series X 1TB Gaming Console 4K 120FPS', mrp: 55990, price: 48990, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600' },
      { model: 'Xbox Wireless Controller Robot White', mrp: 5990, price: 4690, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600' },
      { model: 'Xbox Series S 512GB All-Digital Gaming Console', mrp: 37990, price: 29990, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600' },
    ],
    Nintendo: [
      { model: 'Switch OLED Model with Neon Red & Neon Blue Joy-Con', mrp: 34990, price: 28990, img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600' },
    ],
    'Logitech G': [
      { model: 'G502 HERO High Performance Gaming Mouse 25K Sensor', mrp: 4995, price: 3495, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
      { model: 'G213 Prodigy RGB Gaming Keyboard Mech-Dome Keys', mrp: 4995, price: 3295, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
      { model: 'G435 LIGHTSPEED Wireless Gaming Headset Dolby Atmos', mrp: 7495, price: 4995, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
    ],
    Razer: [
      { model: 'BlackWidow V3 Mechanical Gaming Keyboard Green Switches', mrp: 12999, price: 8999, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
      { model: 'DeathAdder Essential Ergonomic Wired Gaming Mouse 6400 DPI', mrp: 2999, price: 1199, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
    ]
  },

  Fashion: {
    "Levi's": [
      { model: '511 Slim Fit Low Rise Stretchable Men\'s Jeans', mrp: 3499, price: 2199, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
      { model: '512 Tapered Fit Washed Stretch Denim Jeans', mrp: 3999, price: 2599, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
      { model: 'Classic Western Long Sleeve Casual Denim Shirt', mrp: 3299, price: 1999, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
      { model: 'Housemark Graphic Print Cotton Crew Neck T-Shirt', mrp: 1499, price: 899, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
    ],
    Zara: [
      { model: 'Textured Slim Fit Formal & Casual Dinner Blazer', mrp: 6990, price: 4590, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600' },
      { model: '100% Breathable Linen Long Sleeve Casual Shirt', mrp: 3590, price: 2290, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
      { model: 'Relaxed Fit Cotton Chino Trousers with Drawstring', mrp: 3290, price: 1990, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
    ],
    'Tommy Hilfiger': [
      { model: 'Classic Fit Pique Polo Shirt with Signature Flag Logo', mrp: 4299, price: 2799, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
      { model: 'Pure Cotton Casual Checked Full Sleeve Button Down Shirt', mrp: 4999, price: 3299, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
    ],
    Puma: [
      { model: 'Men\'s Fleece Tracksuit Zip Jacket & Track Pants Set', mrp: 5499, price: 2999, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
      { model: 'Ess Solid Regular Fit Cotton T-Shirt', mrp: 1299, price: 699, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
    ],
    Nike: [
      { model: 'Club Fleece Pullover Hooded Sweatshirt Kangaroo Pocket', mrp: 3995, price: 2795, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
      { model: 'Dri-FIT Mens Training Running Shorts with Pockets', mrp: 2195, price: 1595, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
    ]
  }
}

const BADGES = ['Best Seller', 'Top Rated', 'Hot Deal', 'Deal of the Day', 'Trending', null, null]

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seedMassiveDiverseCatalog() {
  console.log('🚀 Starting generation of 10,000 completely DIVERSE, AUTHENTIC products...')
  
  await pool.query('TRUNCATE TABLE products')

  // Collect all distinct models across every category and brand
  const allDistinctBaseItems = []
  
  for (const [catName, brandsObj] of Object.entries(REAL_CATALOG)) {
    for (const [brandName, modelsArr] of Object.entries(brandsObj)) {
      for (const m of modelsArr) {
        allDistinctBaseItems.push({
          category: catName,
          brand: brandName,
          model: m.model,
          mrp: m.mrp,
          price: m.price,
          img: m.img,
        })
      }
    }
  }

  console.log(`📦 Loaded ${allDistinctBaseItems.length} distinct genuine brand models. Now expanding into 10,000 distinct SKU variants...`)

  const TOTAL_COUNT = 10000
  const BATCH_SIZE = 1000
  let inserted = 0

  const specModifiers = [
    'Standard Edition',
    'Special Edition',
    'Matte Finish Edition',
    'Pro Pack',
    'Combo Edition',
    'Global Edition',
    'Limited Series',
    'Retail Pack',
  ]

  const colorways = [
    'Midnight Black',
    'Platinum Silver',
    'Ocean Blue',
    'Glacier White',
    'Space Grey',
    'Deep Forest Green',
    'Desert Gold',
    'Crimson Red',
    'Graphite',
    'Titanium',
    'Olive Khaki',
  ]

  for (let batch = 0; batch < TOTAL_COUNT / BATCH_SIZE; batch++) {
    const rows = []
    for (let i = 0; i < BATCH_SIZE; i++) {
      const globalIndex = batch * BATCH_SIZE + i
      const baseItem = allDistinctBaseItems[globalIndex % allDistinctBaseItems.length]

      const color = colorways[Math.floor(globalIndex / allDistinctBaseItems.length) % colorways.length]
      const modifier = specModifiers[Math.floor(globalIndex / (allDistinctBaseItems.length * 2)) % specModifiers.length]

      // Product Title: Brand + Model + Color + Edition (Unique & genuine)
      const name = `${baseItem.brand} ${baseItem.model} - ${color} (${modifier})`

      // Real Indian Market Pricing (Exact base price with small +/- 2% retailer offer fluctuation)
      const priceJitter = 1 + (getRandomInt(-1, 1) / 100)
      const finalPrice = Math.round((baseItem.price * priceJitter) / 10) * 10
      const finalMrp = baseItem.mrp
      const discountPercent = Math.max(5, Math.round(((finalMrp - finalPrice) / finalMrp) * 100))
      const discount = `${discountPercent}% OFF`

      const rating = Number((4.1 + Math.random() * 0.8).toFixed(1))
      const reviews = getRandomInt(150, 15800)
      const stock = getRandomInt(10, 350)
      const deliveryDays = getRandomInt(1, 3)
      const badge = BADGES[globalIndex % BADGES.length]

      rows.push([
        name,
        baseItem.category,
        baseItem.brand,
        finalPrice,
        finalMrp,
        discount,
        rating,
        reviews,
        baseItem.img,
        stock,
        deliveryDays,
        badge,
      ])
    }

    await pool.query(
      `INSERT INTO products 
      (name, category, brand, price, original_price, discount, rating, reviews_count, image, stock, delivery_days, badge)
      VALUES ?`,
      [rows]
    )

    inserted += rows.length
    console.log(`✅ Loaded ${inserted} / ${TOTAL_COUNT} products with brand diversity into MySQL...`)
  }

  console.log('🎉 FINISHED! Total products: 10,000 completely diverse brand items ready.')
  await pool.end()
}

seedMassiveDiverseCatalog().catch((err) => {
  console.error(err)
  process.exit(1)
})
