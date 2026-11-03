import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'dsa',
  database: 'shopify_db',
  waitForConnections: true,
  connectionLimit: 10,
})

const CATEGORIES_DATA = {
  Mobiles: {
    brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Google Pixel', 'Realme', 'Motorola', 'Vivo', 'Oppo', 'Nothing'],
    models: ['Pro Max', 'Ultra 5G', 'Plus 256GB', 'Lite Edition', 'Fold Series', 'Flip Series', 'Prime Edition', 'Neo 5G', 'Edge Pro', 'Turbo Edition'],
    priceRange: [12999, 149999],
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80',
    ]
  },
  Laptops: {
    brands: ['Apple MacBook', 'Dell XPS', 'HP Pavilion', 'Lenovo Legion', 'ASUS ROG', 'Acer Predator', 'MSI Gaming', 'Samsung Galaxy Book', 'LG Gram'],
    models: ['16GB RAM 512GB SSD', 'Core i7 RTX 4060', 'M3 Max 1TB SSD', 'Ryzen 7 16GB', 'OLED Touch 14-inch', 'Ultra-Slim Evo', 'Gaming Beast Edition', '13-inch Retina'],
    priceRange: [34990, 249990],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
    ]
  },
  Electronics: {
    brands: ['Sony', 'Bose', 'JBL', 'Canon', 'Sennheiser', 'Marshall', 'Boat', 'GoPro', 'Dji', 'Anker'],
    models: ['Wireless Noise Cancelling Headphone', 'Bluetooth Portable Speaker', '4K Action Camera', 'Earbuds with ANC', 'Studio Monitor', 'Vlog Camera Kit', 'Power Bank 20000mAh'],
    priceRange: [1499, 69999],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    ]
  },
  Fashion: {
    brands: ['Nike', 'Adidas', 'Puma', 'Zara', 'Levi\'s', 'Tommy Hilfiger', 'Calvin Klein', 'Under Armour', 'H&M', 'Jack & Jones'],
    models: ['Slim Fit Casual Denim Jacket', 'Cotton Graphic Hoodie', 'Formal Business Blazer', 'Classic Oxford Shirt', 'Athletic Track Pants', 'Polo Collar T-Shirt', 'Cargo Utility Pants'],
    priceRange: [799, 14999],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80',
    ]
  },
  Footwear: {
    brands: ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'Asics', 'Reebok', 'Vans', 'Converse', 'Timberland'],
    models: ['Air Max Running Sneakers', 'Retro High Top Basketball Shoes', 'Lightweight Training Shoes', 'Classic Leather Casual Loafers', 'Trail Hiking Waterproof Boots', 'Cloudfoam Comfort Slip-On'],
    priceRange: [1999, 24999],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
    ]
  },
  Watches: {
    brands: ['Rolex Look', 'Fossil', 'Casio G-Shock', 'Apple Watch', 'Samsung Galaxy Watch', 'Seiko', 'Titan', 'Garmin', 'Tissot', 'Citizen'],
    models: ['Analog Quartz Chronograph', 'GPS Smartwatch AMOLED Display', 'Classic Leather Strap Automatic', 'Rugged Tactical Solar Watch', 'Stainless Steel Business Edition', 'Fitness Tracker Pro'],
    priceRange: [2499, 64999],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&auto=format&fit=crop&q=80',
    ]
  },
  Gaming: {
    brands: ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo', 'Razer', 'Logitech G', 'Corsair', 'HyperX', 'SteelSeries', 'Alienware'],
    models: ['Wireless Pro Controller', 'Mechanical RGB Gaming Keyboard', 'Ultra-Lightweight Gaming Mouse 26K DPI', 'Surround Sound Gaming Headset', 'VR Headset 128GB', 'Ergonomic Gaming Chair'],
    priceRange: [1899, 54999],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    ]
  },
  'Home & Kitchen': {
    brands: ['Philips', 'Dyson', 'Nespresso', 'Instant Pot', 'KitchenAid', 'Prestige', 'Bosch', 'Samsung', 'LG'],
    models: ['Smart Air Purifier HEPA Filter', 'Automatic Espresso Coffee Maker', 'Multi-Cooker Electric Pressure Pot', 'Cordless Stick Vacuum Cleaner', 'Digital Touch Air Fryer 6L', 'Stainless Steel Cookware Set'],
    priceRange: [1999, 45999],
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80',
    ]
  }
}

const BADGES = ['Best Seller', 'Top Rated', 'Hot Deal', 'Deal of the Day', 'Trending', 'Limited Offer', null, null, null]

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seed10000Products() {
  console.log('🚀 Starting generation of 10,000 realistic e-commerce products...')
  const categoriesList = Object.keys(CATEGORIES_DATA)

  // Clear existing products
  await pool.query('TRUNCATE TABLE products')
  console.log('🧹 Cleaned existing products table.')

  const TOTAL_COUNT = 10000
  const BATCH_SIZE = 1000
  let inserted = 0

  for (let batch = 0; batch < TOTAL_COUNT / BATCH_SIZE; batch++) {
    const rows = []
    for (let i = 0; i < BATCH_SIZE; i++) {
      const catName = categoriesList[(batch * BATCH_SIZE + i) % categoriesList.length]
      const catData = CATEGORIES_DATA[catName]

      const brand = getRandomItem(catData.brands)
      const model = getRandomItem(catData.models)
      const uniqueSuffix = `#${1000 + batch * BATCH_SIZE + i}`
      const name = `${brand} ${model} ${uniqueSuffix}`

      const minPrice = catData.priceRange[0]
      const maxPrice = catData.priceRange[1]
      const price = Math.round(getRandomInt(minPrice, maxPrice) / 10) * 10
      const discountPercent = getRandomInt(10, 45)
      const originalPrice = Math.round((price / (1 - discountPercent / 100)) / 10) * 10
      const discount = `${discountPercent}% OFF`
      const rating = Number((3.8 + Math.random() * 1.2).toFixed(1))
      const reviews = getRandomInt(50, 8500)
      const image = getRandomItem(catData.images)
      const stock = getRandomInt(5, 500)
      const deliveryDays = getRandomInt(1, 4)
      const badge = getRandomItem(BADGES)

      rows.push([
        name,
        catName,
        brand,
        price,
        originalPrice,
        discount,
        rating,
        reviews,
        image,
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
    console.log(`✅ Inserted ${inserted} / ${TOTAL_COUNT} products into MySQL...`)
  }

  const [countResult] = await pool.query('SELECT COUNT(*) as total FROM products')
  console.log(`\n🎉 SUCCESS! Total products in database: ${countResult[0].total}`)
  await pool.end()
}

seed10000Products().catch((err) => {
  console.error('❌ Seeding error:', err)
  process.exit(1)
})
