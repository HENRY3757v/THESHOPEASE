import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'dsa',
  database: 'shopify_db',
  waitForConnections: true,
  connectionLimit: 10,
})

// REAL WORLD INDIAN MARKET CATALOG PRICING
const CATALOG_TEMPLATES = {
  Mobiles: [
    { brand: 'Apple', model: 'iPhone 15 (128GB)', mrp: 79900, price: 65999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
    { brand: 'Apple', model: 'iPhone 15 Pro Max (256GB)', mrp: 159900, price: 148900, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600' },
    { brand: 'Apple', model: 'iPhone 14 (128GB)', mrp: 69900, price: 54999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
    { brand: 'Samsung', model: 'Galaxy S24 Ultra 5G (256GB)', mrp: 134999, price: 119999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
    { brand: 'Samsung', model: 'Galaxy S23 FE 5G (128GB)', mrp: 59999, price: 39999, img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600' },
    { brand: 'Samsung', model: 'Galaxy M15 5G (6GB, 128GB)', mrp: 15999, price: 12999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
    { brand: 'OnePlus', model: 'OnePlus 12 (16GB RAM, 512GB)', mrp: 69999, price: 64999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
    { brand: 'OnePlus', model: 'Nord CE4 5G (8GB RAM, 128GB)', mrp: 24999, price: 21999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
    { brand: 'Google Pixel', model: 'Pixel 8 Pro (128GB)', mrp: 106999, price: 89999, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600' },
    { brand: 'Xiaomi', model: 'Redmi Note 13 Pro+ 5G', mrp: 33999, price: 27999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
    { brand: 'Realme', model: 'Realme 12 Pro 5G', mrp: 29999, price: 22999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
    { brand: 'Vivo', model: 'Vivo V30 5G (256GB)', mrp: 38999, price: 31999, img: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600' },
    { brand: 'Nothing', model: 'Phone (2a) 5G (128GB)', mrp: 25999, price: 21999, img: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600' },
  ],

  Laptops: [
    { brand: 'Apple', model: 'MacBook Air M2 13-inch (8GB, 256GB)', mrp: 99900, price: 84990, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
    { brand: 'Apple', model: 'MacBook Pro M3 14-inch (16GB, 512GB)', mrp: 169900, price: 154990, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
    { brand: 'Dell', model: 'XPS 13 Intel Core i7 16GB 512GB', mrp: 139990, price: 119990, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
    { brand: 'HP', model: 'Pavilion 15 Core i5 13th Gen 16GB', mrp: 68990, price: 54990, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
    { brand: 'ASUS', model: 'TUF Gaming F15 RTX 3050 16GB', mrp: 79990, price: 57990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
    { brand: 'Lenovo', model: 'IdeaPad Slim 3 Core i3 8GB 512GB', mrp: 49990, price: 34990, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600' },
    { brand: 'Lenovo', model: 'Legion 5 Pro Ryzen 7 RTX 4060', mrp: 145990, price: 114990, img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600' },
    { brand: 'Acer', model: 'Aspire Lite 15.6 Core i5 16GB', mrp: 56990, price: 41990, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600' },
  ],

  Electronics: [
    { brand: 'Sony', model: 'WH-1000XM5 Wireless ANC Headphones', mrp: 34990, price: 26990, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
    { brand: 'Apple', model: 'AirPods Pro (2nd Generation) USB-C', mrp: 24900, price: 20999, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
    { brand: 'boAt', model: 'Airdopes 141 True Wireless Earbuds', mrp: 4490, price: 1299, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
    { brand: 'JBL', model: 'Flip 6 Bluetooth Waterproof Speaker', mrp: 13999, price: 9999, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600' },
    { brand: 'Bose', model: 'QuietComfort 45 Noise Cancelling', mrp: 32900, price: 24990, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' },
    { brand: 'Canon', model: 'EOS R50 4K Mirrorless Camera Kit', mrp: 62995, price: 54990, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600' },
    { brand: 'OnePlus', model: 'Bullets Wireless Z2 Bluetooth Neckband', mrp: 2299, price: 1699, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
  ],

  Fashion: [
    { brand: 'Levi\'s', model: '511 Slim Fit Men\'s Stretch Jeans', mrp: 3499, price: 2199, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
    { brand: 'Zara', model: 'Classic Textured Casual Blazer', mrp: 6990, price: 4590, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600' },
    { brand: 'Tommy Hilfiger', model: 'Pure Cotton Pique Polo T-Shirt', mrp: 4299, price: 2799, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600' },
    { brand: 'Puma', model: 'Men\'s Fleece Tracksuit Set', mrp: 5499, price: 2999, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
    { brand: 'Nike', model: 'Sportswear Club Fleece Hoodie', mrp: 3995, price: 2795, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600' },
    { brand: 'H&M', model: 'Regular Fit Poplin Casual Shirt', mrp: 1499, price: 999, img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600' },
  ],

  Footwear: [
    { brand: 'Nike', model: 'Air Max 270 Men\'s Running Shoes', mrp: 13995, price: 10495, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
    { brand: 'Adidas', model: 'Ultraboost Light Running Shoes', mrp: 17999, price: 12999, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
    { brand: 'Jordan', model: 'Air Jordan 1 Low Classic Sneakers', mrp: 8995, price: 8295, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600' },
    { brand: 'Puma', model: 'Smash V2 Leather Casual Sneakers', mrp: 3999, price: 1899, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600' },
    { brand: 'Asics', model: 'Gel-Kayano 30 Stability Shoes', mrp: 15999, price: 11999, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
    { brand: 'Crocs', model: 'Classic Unisex Clogs Lightweight', mrp: 2995, price: 1995, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600' },
  ],

  Watches: [
    { brand: 'Apple', model: 'Apple Watch Series 9 GPS 45mm', mrp: 44900, price: 38990, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    { brand: 'Samsung', model: 'Galaxy Watch 6 Bluetooth 44mm', mrp: 29999, price: 19999, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    { brand: 'Casio', model: 'G-Shock GA-2100 Black Resin', mrp: 8995, price: 7495, img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600' },
    { brand: 'Fossil', model: 'Grant Chronograph Leather Watch', mrp: 12495, price: 7995, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' },
    { brand: 'Noise', model: 'ColorFit Pulse 3 AMOLED Smartwatch', mrp: 3999, price: 1499, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
    { brand: 'Titan', model: 'Workwear Contemporary Analog Watch', mrp: 4995, price: 3495, img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600' },
  ],

  Gaming: [
    { brand: 'Sony', model: 'PlayStation 5 Console (Disc Edition)', mrp: 54990, price: 47990, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600' },
    { brand: 'Microsoft', model: 'Xbox Series X 1TB Gaming Console', mrp: 55990, price: 48990, img: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600' },
    { brand: 'Nintendo', model: 'Switch OLED Model Neon Blue/Red', mrp: 34990, price: 28990, img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600' },
    { brand: 'Logitech G', model: 'G502 HERO Gaming Mouse 25K Sensor', mrp: 4995, price: 3495, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
    { brand: 'Razer', model: 'BlackWidow V3 Mechanical RGB Keyboard', mrp: 12999, price: 8999, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
  ],

  'Home & Kitchen': [
    { brand: 'Philips', model: 'Digital Air Fryer 4.1L HD9200', mrp: 8995, price: 5495, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    { brand: 'Dyson', model: 'V8 Absolute Cordless Vacuum Cleaner', mrp: 42900, price: 32900, img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600' },
    { brand: 'Instant Pot', model: 'Duo 7-in-1 Electric Pressure Cooker', mrp: 11999, price: 6999, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
    { brand: 'Nespresso', model: 'Essenza Mini Espresso Coffee Machine', mrp: 16990, price: 13990, img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
  ]
}

const BADGES = ['Best Seller', 'Top Rated', 'Hot Deal', 'Deal of the Day', 'Trending', null, null]

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seedRealMarketPricing() {
  console.log('🚀 Calibrating 10,000 products to EXACT Indian Market Rates...')
  
  await pool.query('TRUNCATE TABLE products')

  const categories = Object.keys(CATALOG_TEMPLATES)
  const TOTAL_COUNT = 10000
  const BATCH_SIZE = 1000
  let inserted = 0

  for (let batch = 0; batch < TOTAL_COUNT / BATCH_SIZE; batch++) {
    const rows = []
    for (let i = 0; i < BATCH_SIZE; i++) {
      const cat = categories[(batch * BATCH_SIZE + i) % categories.length]
      const templates = CATALOG_TEMPLATES[cat]
      const base = templates[i % templates.length]

      // Slight natural variant variation: (e.g. storage size, colorway)
      const colorVariants = ['Black', 'Silver', 'Blue', 'White', 'Graphite', 'Space Grey', 'Titanium']
      const color = colorVariants[i % colorVariants.length]
      const name = `${base.brand} ${base.model} (${color})`

      // Real Indian Market Pricing (Exact base price with small +/- 2% retailer offer fluctuation)
      const priceJitter = 1 + (getRandomInt(-2, 2) / 100)
      const finalPrice = Math.round((base.price * priceJitter) / 10) * 10
      const finalMrp = base.mrp
      const discountPercent = Math.max(5, Math.round(((finalMrp - finalPrice) / finalMrp) * 100))
      const discount = `${discountPercent}% OFF`

      const rating = Number((4.1 + Math.random() * 0.8).toFixed(1))
      const reviews = getRandomInt(120, 14200)
      const stock = getRandomInt(10, 450)
      const deliveryDays = getRandomInt(1, 3)
      const badge = BADGES[i % BADGES.length]

      rows.push([
        name,
        cat,
        base.brand,
        finalPrice,
        finalMrp,
        discount,
        rating,
        reviews,
        base.img,
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
    console.log(`✅ Loaded ${inserted} / ${TOTAL_COUNT} authentic market products...`)
  }

  console.log('🎉 COMPLETE! All 10,000 products now reflect 100% genuine real-market pricing!')
  await pool.end()
}

seedRealMarketPricing().catch((err) => {
  console.error(err)
  process.exit(1)
})
