import pg from 'pg'

const { Pool } = pg

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.shaxsnjcircagqdggbwg:LEODAS8777%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

const CATEGORY_MAP = {
  smartphones: 'Mobiles',
  laptops: 'Laptops',
  tablets: 'Tablets',
  'mobile-accessories': 'Electronics',
  electronics: 'Electronics',
  'mens-watches': 'Watches',
  'womens-watches': 'Watches',
  'kitchen-accessories': 'Home & Kitchen',
  furniture: 'Home & Decor',
  'home-decoration': 'Home & Decor',
  'mens-shirts': 'Fashion',
  'womens-dresses': 'Fashion',
  tops: 'Fashion',
  'womens-bags': 'Fashion',
  'mens-shoes': 'Footwear',
  'womens-shoes': 'Footwear',
  beauty: 'Beauty & Care',
  fragrances: 'Beauty & Care',
  'skin-care': 'Beauty & Care',
  'womens-jewellery': 'Jewellery & Eyewear',
  jewelery: 'Jewellery & Eyewear',
  sunglasses: 'Jewellery & Eyewear',
  groceries: 'Groceries',
  'sports-accessories': 'Sports & Auto',
  motorcycle: 'Sports & Auto',
  vehicle: 'Sports & Auto',
  "men's clothing": 'Fashion',
  "women's clothing": 'Fashion',
}

const HUBS = [
  'Bhiwandi Mega Hub, Mumbai',
  'Whitefield Tech Logistics, Bengaluru',
  'Manesar Express Hub, Delhi NCR',
  'Sriperumbudur Hub, Chennai',
  'Dankuni Fulfillment Center, Kolkata',
  'Shamshabad Hub, Hyderabad',
]

function inferBrand(title, fallbackCategory) {
  const knownBrands = [
    'Apple', 'Samsung', 'Vivo', 'Oppo', 'Realme', 'Asus', 'Huawei', 'Lenovo', 'Dell',
    'Beats', 'Amazon', 'Sony', 'WD', 'SanDisk', 'Acer', 'Nike', 'Adidas', 'Puma',
    'Rolex', 'Omega', 'Longines', 'Fossil', 'Gucci', 'Dior', 'Chanel', 'Calvin Klein',
    'Dolce & Gabbana', 'Fjallraven', 'Kawasaki', 'Chrysler', 'Dodge', 'Essence',
  ]
  const lower = title.toLowerCase()
  for (const b of knownBrands) {
    if (lower.includes(b.toLowerCase())) return b
  }
  const firstWord = title.split(' ')[0]?.replace(/[^a-zA-Z0-9&'-]/g, '')
  if (firstWord && firstWord.length >= 3) return firstWord
  return fallbackCategory.split(' ')[0] || 'ShopEase Direct'
}

function toIndianPrice(usdPrice, category) {
  // Realistic Indian market conversion + neat retail rounding
  let inr = Math.round((Number(usdPrice) || 19.99) * 84)
  if (category === 'Mobiles' && inr < 7999) inr = Math.max(7999, inr * 2)
  if (category === 'Laptops' && inr < 34990) inr = Math.max(39990, inr)
  if (inr >= 1000) return Math.round(inr / 100) * 100 - 1
  if (inr >= 200) return Math.round(inr / 10) * 10 - 1
  return Math.max(49, inr)
}

function makeGstin(brand, idx) {
  const code = (brand || 'SH').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 5).padEnd(5, 'X')
  return `27${code}${String(1000 + (idx % 8999))}A1Z5`
}

async function setupSchema(client) {
  console.log('📐 Ensuring PostgreSQL tables and columns exist...')

  await client.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS seller_id INTEGER,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS source VARCHAR(40) DEFAULT 'catalog',
    ADD COLUMN IF NOT EXISTS seller_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS seller_rating NUMERIC(3,1) DEFAULT 4.8,
    ADD COLUMN IF NOT EXISTS seller_hub VARCHAR(150),
    ADD COLUMN IF NOT EXISTS seller_gstin VARCHAR(40),
    ADD COLUMN IF NOT EXISTS warranty_policy VARCHAR(200),
    ADD COLUMN IF NOT EXISTS is_brand_direct BOOLEAN DEFAULT TRUE;
  `)

  await client.query(`
    ALTER TABLE upi_accounts
    ADD COLUMN IF NOT EXISTS verified_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMPTZ;
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS phone_otps (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) NOT NULL,
      purpose VARCHAR(40) NOT NULL DEFAULT 'upi_verify',
      otp_hash VARCHAR(128) NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS sellers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      store_name VARCHAR(120) NOT NULL,
      owner_name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(160) NOT NULL,
      gstin VARCHAR(30),
      city_hub VARCHAR(100) NOT NULL,
      upi_id VARCHAR(120) NOT NULL,
      phone_verified BOOLEAN NOT NULL DEFAULT TRUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS seller_fee_ledger (
      id SERIAL PRIMARY KEY,
      seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
      item_count INTEGER NOT NULL,
      fee_per_item INTEGER NOT NULL DEFAULT 20,
      total_fee INTEGER NOT NULL,
      billing_date DATE NOT NULL DEFAULT CURRENT_DATE,
      admin_upi_id VARCHAR(120) NOT NULL DEFAULT 'shopease.platform@okicici',
      payment_status VARCHAR(30) NOT NULL DEFAULT 'paid',
      transaction_id VARCHAR(120),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

async function seedRealCatalog() {
  console.log('🌐 Fetching 100% real products with original studio photos...')
  const [djRes, fsRes] = await Promise.all([
    fetch('https://dummyjson.com/products?limit=200').then((r) => r.json()),
    fetch('https://fakestoreapi.com/products').then((r) => r.json()),
  ])

  const combined = []
  const seenImages = new Set()

  // 1. Process DummyJSON (194 real products with original product thumbnails)
  for (const p of djRes.products || []) {
    const img = p.thumbnail || p.images?.[0]
    if (!img || seenImages.has(img)) continue
    seenImages.add(img)

    const mappedCategory = CATEGORY_MAP[p.category] || 'Lifestyle'
    const brand = p.brand ? p.brand.trim() : inferBrand(p.title, mappedCategory)
    const finalPrice = toIndianPrice(p.price, mappedCategory)
    const discountPct = Math.min(65, Math.max(8, Math.round(p.discountPercentage || 15)))
    const originalPrice = Math.round((finalPrice / (1 - discountPct / 100)) / 10) * 10 - 1
    const groupPrice = Math.round((finalPrice * 0.88) / 10) * 10

    combined.push({
      name: p.title,
      category: mappedCategory,
      brand,
      price: finalPrice,
      original_price: Math.max(originalPrice, finalPrice + 50),
      discount: `${discountPct}% OFF`,
      rating: Number(Math.min(5.0, Math.max(3.8, p.rating || 4.4)).toFixed(1)),
      reviews_count: (p.reviews?.length || 3) * 140 + Math.floor(Math.random() * 800),
      image: img,
      stock: p.stock || 45,
      delivery_days: p.shippingInformation?.includes('overnight') ? 1 : 2,
      badge: p.rating >= 4.7 ? 'Top Rated' : discountPct >= 18 ? 'Hot Deal' : 'Verified Original',
      group_price: groupPrice,
      specs: {
        key_feature: p.description?.slice(0, 140) || `${brand} Official Original Product`,
        sku: p.sku || `SE-${p.id}`,
        warranty: p.warrantyInformation || '1 Year Official Brand Warranty',
        ideal_for: `${mappedCategory} • ${p.availabilityStatus || 'In Stock'}`,
        weight: p.weight ? `${p.weight * 100}g` : 'Standard Retail Pack',
        gallery: Array.isArray(p.images) ? p.images.slice(0, 4) : [img],
        return_policy: p.returnPolicy || '7 Days Replacement Guarantee',
      },
      source: 'catalog',
    })
  }

  // 2. Process FakeStore API (20 real Amazon-style product cutouts)
  for (const p of fsRes || []) {
    const img = p.image
    if (!img || seenImages.has(img)) continue
    seenImages.add(img)

    const mappedCategory = CATEGORY_MAP[p.category] || 'Lifestyle'
    const brand = inferBrand(p.title, mappedCategory)
    const finalPrice = toIndianPrice(p.price, mappedCategory)
    const discountPct = 18
    const originalPrice = Math.round((finalPrice / (1 - discountPct / 100)) / 10) * 10 - 1
    const groupPrice = Math.round((finalPrice * 0.88) / 10) * 10

    combined.push({
      name: p.title.trim(),
      category: mappedCategory,
      brand,
      price: finalPrice,
      original_price: Math.max(originalPrice, finalPrice + 50),
      discount: `${discountPct}% OFF`,
      rating: Number((p.rating?.rate || 4.4).toFixed(1)),
      reviews_count: p.rating?.count || 320,
      image: img,
      stock: 60,
      delivery_days: 2,
      badge: (p.rating?.rate || 0) >= 4.5 ? 'Best Seller' : 'Amazon Choice',
      group_price: groupPrice,
      specs: {
        key_feature: p.description?.slice(0, 140) || `${brand} Official Product`,
        warranty: '1 Year Manufacturer Warranty',
        ideal_for: `${mappedCategory} Enthusiasts`,
        gallery: [img],
        return_policy: '7 Days Easy Return',
      },
      source: 'catalog',
    })
  }

  console.log(`✅ Prepared ${combined.length} unique products — EVERY item has its own original image!`)

  const client = await pool.connect()
  try {
    await setupSchema(client)

    // Remove only seeded catalog rows; preserve seller-listed products if any exist!
    await client.query("DELETE FROM products WHERE source = 'catalog' OR source IS NULL")
    console.log('🧹 Cleared old catalog rows (kept any seller-listed items safe)')

    const BATCH_SIZE = 50
    let inserted = 0

    for (let start = 0; start < combined.length; start += BATCH_SIZE) {
      const slice = combined.slice(start, start + BATCH_SIZE)
      const valueStrings = []
      const params = []
      let paramIdx = 1

      slice.forEach((item, offset) => {
        const idx = start + offset
        const sellerName = `${item.brand} Official Flagship Store`
        const sellerHub = HUBS[idx % HUBS.length]
        const sellerGstin = makeGstin(item.brand, idx)
        const warrantyPolicy = item.specs.warranty || '1 Year Official Brand Warranty'

        params.push(
          item.name,
          item.category,
          item.brand,
          item.price,
          item.original_price,
          item.discount,
          item.rating,
          item.reviews_count,
          item.image,
          item.stock,
          item.delivery_days,
          item.badge,
          item.group_price,
          JSON.stringify(item.specs),
          sellerName,
          4.8,
          sellerHub,
          sellerGstin,
          warrantyPolicy,
          true,
          'catalog',
          true
        )

        const ph = []
        for (let c = 0; c < 22; c++) ph.push(`$${paramIdx++}`)
        valueStrings.push(`(${ph.join(', ')})`)
      })

      await client.query(
        `INSERT INTO products (
          name, category, brand, price, original_price, discount, rating, reviews_count,
          image, stock, delivery_days, badge, group_price, specs,
          seller_name, seller_rating, seller_hub, seller_gstin, warranty_policy, is_brand_direct,
          source, is_active
        ) VALUES ${valueStrings.join(', ')}`,
        params
      )

      inserted += slice.length
      console.log(`📦 Inserted ${inserted} / ${combined.length} real original products...`)
    }

    console.log('🎉 Real Original Catalog + Seller & OTP Schema ready in Supabase!')
  } finally {
    client.release()
    await pool.end()
  }
}

seedRealCatalog().catch((err) => {
  console.error('❌ Seed error:', err)
  process.exit(1)
})
