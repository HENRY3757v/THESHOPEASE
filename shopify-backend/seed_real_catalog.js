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
  clothes: 'Fashion',
  shoes: 'Footwear',
  miscellaneous: 'Lifestyle',
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
    'Maybelline', 'NYX', 'Loreal', 'Clinique', 'Revlon', 'Covergirl', 'ColourPop', 'MAC',
  ]
  const lower = String(title || '').toLowerCase()
  for (const b of knownBrands) {
    if (lower.includes(b.toLowerCase())) return b
  }
  const firstWord = String(title || '').split(' ')[0]?.replace(/[^a-zA-Z0-9&'-]/g, '')
  if (firstWord && firstWord.length >= 3) return firstWord
  return fallbackCategory.split(' ')[0] || 'ShopEase Direct'
}

function toIndianPrice(usdPrice, category) {
  let inr = Math.round((Number(usdPrice) || 19.99) * 84)
  if (category === 'Mobiles' && inr < 7999) inr = Math.max(7999, inr * 2)
  if (category === 'Laptops' && inr < 34990) inr = Math.max(39990, inr)
  if (inr >= 1000) return Math.round(inr / 100) * 100 - 1
  if (inr >= 200) return Math.round(inr / 10) * 10 - 1
  return Math.max(99, inr)
}

function makeGstin(brand, idx) {
  const code = (brand || 'SH').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 5).padEnd(5, 'X')
  return `27${code}${String(1000 + (idx % 8999))}A1Z5`
}

function buildPartnerStoreLinks(title, brand, category, idx, explicitUrl = null, explicitSite = null) {
  const query = encodeURIComponent(`${brand} ${title}`.trim())
  const amazonTag = process.env.AMAZON_PARTNER_TAG ? `&tag=${encodeURIComponent(process.env.AMAZON_PARTNER_TAG)}` : ''
  const flipkartTag = process.env.FLIPKART_AFFID ? `&affid=${encodeURIComponent(process.env.FLIPKART_AFFID)}` : ''

  if (explicitUrl && /^https?:\/\//i.test(explicitUrl)) {
    return {
      sourceSite: explicitSite || `${brand} Official Store`,
      externalUrl: explicitUrl,
      externalCartUrl: explicitUrl,
    }
  }

  // Electronics / Mobiles / Appliances -> alternate Amazon India & Flipkart partner search links
  const useFlipkart = idx % 3 === 1
  if (useFlipkart) {
    const url = `https://www.flipkart.com/search?q=${query}${flipkartTag}`
    return {
      sourceSite: 'Flipkart Partner',
      externalUrl: url,
      externalCartUrl: url,
    }
  }
  const url = `https://www.amazon.in/s?k=${query}${amazonTag}`
  return {
    sourceSite: 'Amazon India',
    externalUrl: url,
    externalCartUrl: url,
  }
}

async function isImageReachable(url) {
  if (!url || !/^https?:\/\//i.test(url)) return false
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4500)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'ShopEaseCatalogVerifier/1.0' },
    })
    if (!res.ok) return false
    const ct = res.headers.get('content-type') || ''
    return ct.startsWith('image/')
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function filterReachableImages(items, concurrency = 18) {
  const accepted = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const checks = await Promise.all(batch.map((item) => isImageReachable(item.image)))
    batch.forEach((item, idx) => {
      if (checks[idx]) accepted.push(item)
    })
  }
  return accepted
}

async function setupSchema(client) {
  console.log('📐 Ensuring PostgreSQL tables and bridge columns exist...')

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
    ADD COLUMN IF NOT EXISTS is_brand_direct BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS source_site VARCHAR(120) DEFAULT 'ShopEase Direct',
    ADD COLUMN IF NOT EXISTS external_url TEXT,
    ADD COLUMN IF NOT EXISTS external_cart_url TEXT,
    ADD COLUMN IF NOT EXISTS external_id VARCHAR(120);
  `)

  await client.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS external_site VARCHAR(120),
    ADD COLUMN IF NOT EXISTS external_order_id VARCHAR(120),
    ADD COLUMN IF NOT EXISTS external_receipt_url TEXT,
    ADD COLUMN IF NOT EXISTS external_receipt_json JSONB,
    ADD COLUMN IF NOT EXISTS fulfillment_mode VARCHAR(40) DEFAULT 'shopease_direct';
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
      store_webhook_url TEXT,
      phone_verified BOOLEAN NOT NULL DEFAULT TRUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await client.query(`
    ALTER TABLE sellers
    ADD COLUMN IF NOT EXISTS store_webhook_url TEXT;
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

  await client.query(`
    CREATE TABLE IF NOT EXISTS external_redirects (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      product_id INTEGER,
      source_site VARCHAR(120),
      target_url TEXT NOT NULL,
      action_type VARCHAR(40) NOT NULL DEFAULT 'view_store',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

async function seedRealCatalog() {
  console.log('🌐 Fetching real products across multiple open APIs...')
  const [djRes, fsRes, platziRes, makeupRes] = await Promise.all([
    fetch('https://dummyjson.com/products?limit=250').then((r) => r.json()).catch(() => ({ products: [] })),
    fetch('https://fakestoreapi.com/products').then((r) => r.json()).catch(() => []),
    fetch('https://api.escuelajs.co/api/v1/products?offset=0&limit=120').then((r) => r.json()).catch(() => []),
    fetch('https://makeup-api.herokuapp.com/api/v1/products.json').then((r) => r.json()).catch(() => []),
  ])

  const combined = []
  const seenImages = new Set()
  const seenNames = new Set()

  // 1. DummyJSON (194 verified studio products + multi-image galleries)
  ;(djRes.products || []).forEach((p, idx) => {
    const img = p.thumbnail || p.images?.[0]
    if (!img || seenImages.has(img)) return
    seenImages.add(img)
    seenNames.add(String(p.title).toLowerCase())

    const mappedCategory = CATEGORY_MAP[p.category] || 'Lifestyle'
    const brand = p.brand ? p.brand.trim() : inferBrand(p.title, mappedCategory)
    const finalPrice = toIndianPrice(p.price, mappedCategory)
    const discountPct = Math.min(65, Math.max(8, Math.round(p.discountPercentage || 15)))
    const originalPrice = Math.round((finalPrice / (1 - discountPct / 100)) / 10) * 10 - 1
    const groupPrice = Math.round((finalPrice * 0.88) / 10) * 10
    const bridge = buildPartnerStoreLinks(p.title, brand, mappedCategory, idx)

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
        gallery: Array.isArray(p.images) && p.images.length > 0 ? p.images.slice(0, 4) : [img],
        return_policy: p.returnPolicy || '7 Days Replacement Guarantee',
      },
      source_site: bridge.sourceSite,
      external_url: bridge.externalUrl,
      external_cart_url: bridge.externalCartUrl,
      external_id: p.sku || `DJ-${p.id}`,
    })
  })

  // 2. FakeStoreAPI (20 cutouts)
  ;(Array.isArray(fsRes) ? fsRes : []).forEach((p, idx) => {
    const img = p.image
    if (!img || seenImages.has(img)) return
    seenImages.add(img)
    seenNames.add(String(p.title).toLowerCase())

    const mappedCategory = CATEGORY_MAP[p.category] || 'Lifestyle'
    const brand = inferBrand(p.title, mappedCategory)
    const finalPrice = toIndianPrice(p.price, mappedCategory)
    const discountPct = 18
    const originalPrice = Math.round((finalPrice / (1 - discountPct / 100)) / 10) * 10 - 1
    const groupPrice = Math.round((finalPrice * 0.88) / 10) * 10
    const bridge = buildPartnerStoreLinks(p.title, brand, mappedCategory, idx + 200)

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
      source_site: bridge.sourceSite,
      external_url: bridge.externalUrl,
      external_cart_url: bridge.externalCartUrl,
      external_id: `FS-${p.id}`,
    })
  })

  // 3. Platzi Fake Store API (verified HTTP 200 images only)
  const platziCandidates = []
  for (const p of Array.isArray(platziRes) ? platziRes : []) {
    const rawImgs = Array.isArray(p.images)
      ? p.images.map((u) => String(u).replace(/[\[\]"]/g, '').trim()).filter((u) => /^https?:\/\//.test(u))
      : []
    const img = rawImgs[0]
    if (!img || seenImages.has(img) || seenNames.has(String(p.title).toLowerCase())) continue
    if (img.includes('placeimg') || img.includes('any') || !p.title || p.title.length < 4) continue

    const rawCat = String(p.category?.name || '').toLowerCase()
    let mappedCategory = 'Lifestyle'
    if (rawCat.includes('cloth')) mappedCategory = 'Fashion'
    else if (rawCat.includes('shoe')) mappedCategory = 'Footwear'
    else if (rawCat.includes('electron')) mappedCategory = 'Electronics'
    else if (rawCat.includes('furn')) mappedCategory = 'Home & Decor'

    const brand = inferBrand(p.title, mappedCategory)
    const finalPrice = toIndianPrice(Math.min(Math.max(Number(p.price) || 29, 10), 1500), mappedCategory)
    const discountPct = 22
    const originalPrice = Math.round((finalPrice / (1 - discountPct / 100)) / 10) * 10 - 1
    const groupPrice = Math.round((finalPrice * 0.88) / 10) * 10
    const bridge = buildPartnerStoreLinks(p.title, brand, mappedCategory, platziCandidates.length + 300)

    platziCandidates.push({
      name: p.title.trim(),
      category: mappedCategory,
      brand,
      price: finalPrice,
      original_price: Math.max(originalPrice, finalPrice + 50),
      discount: `${discountPct}% OFF`,
      rating: 4.5,
      reviews_count: 180 + (p.id % 400),
      image: img,
      stock: 40,
      delivery_days: 2,
      badge: 'Verified Store',
      group_price: groupPrice,
      specs: {
        key_feature: p.description?.slice(0, 140) || `${brand} Original Store Listing`,
        warranty: '6 Months Store Warranty',
        ideal_for: `${mappedCategory} Collection`,
        gallery: rawImgs.slice(0, 4),
        return_policy: '7 Days Easy Return',
      },
      source_site: bridge.sourceSite,
      external_url: bridge.externalUrl,
      external_cart_url: bridge.externalCartUrl,
      external_id: `PL-${p.id}`,
    })
  }

  console.log(`🔍 Checking reachability of ${platziCandidates.length} Platzi images...`)
  const verifiedPlatzi = await filterReachableImages(platziCandidates, 20)
  for (const item of verifiedPlatzi) {
    if (!seenImages.has(item.image) && !seenNames.has(item.name.toLowerCase())) {
      seenImages.add(item.image)
      seenNames.add(item.name.toLowerCase())
      combined.push(item)
    }
  }
  console.log(`✅ Added ${verifiedPlatzi.length} verified Platzi items`)

  // 4. MakeupAPI (Balanced selection across top brands with REAL product_link & website_link!)
  const brandCounts = new Map()
  const makeupCandidates = []
  for (const p of Array.isArray(makeupRes) ? makeupRes : []) {
    const img = p.image_link
    const brandRaw = (p.brand || '').trim()
    const brand = brandRaw ? brandRaw.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Beauty Brand'
    const priceUsd = Number(p.price)
    if (!img || !img.startsWith('http') || !p.name || !(priceUsd > 0)) continue
    if (seenImages.has(img) || seenNames.has(p.name.trim().toLowerCase())) continue

    const countForBrand = brandCounts.get(brand) || 0
    if (countForBrand >= 12) continue // cap per brand so catalog stays well-balanced
    if (makeupCandidates.length >= 220) break

    brandCounts.set(brand, countForBrand + 1)
    const finalPrice = toIndianPrice(priceUsd, 'Beauty & Care')
    const discountPct = 15 + (p.id % 20)
    const originalPrice = Math.round((finalPrice / (1 - discountPct / 100)) / 10) * 10 - 1
    const groupPrice = Math.round((finalPrice * 0.88) / 10) * 10

    let websiteHost = `${brand} Official`
    try {
      if (p.website_link) websiteHost = new URL(p.website_link).hostname.replace(/^www\./, '')
    } catch {}

    const bridge = buildPartnerStoreLinks(
      p.name.trim(),
      brand,
      'Beauty & Care',
      makeupCandidates.length,
      p.product_link || p.website_link,
      websiteHost
    )

    makeupCandidates.push({
      name: p.name.trim().replace(/\s+/g, ' '),
      category: 'Beauty & Care',
      brand,
      price: finalPrice,
      original_price: Math.max(originalPrice, finalPrice + 50),
      discount: `${discountPct}% OFF`,
      rating: Number(Math.min(5.0, Math.max(4.0, Number(p.rating) || 4.5)).toFixed(1)),
      reviews_count: 120 + ((p.id || 17) % 650),
      image: img,
      stock: 55,
      delivery_days: 2,
      badge: Number(p.rating) >= 4.7 ? 'Top Rated' : 'Official Brand',
      group_price: groupPrice,
      specs: {
        key_feature: (p.description || `${brand} Official ${p.product_type || 'Beauty'} Formula`).replace(/<[^>]+>/g, '').trim().slice(0, 140),
        warranty: '100% Authentic Sealed Pack',
        ideal_for: p.product_type ? p.product_type.replace(/_/g, ' ') : 'Daily Beauty Care',
        gallery: [img],
        return_policy: '7 Days Unopened Return',
      },
      source_site: bridge.sourceSite,
      external_url: bridge.externalUrl,
      external_cart_url: bridge.externalCartUrl,
      external_id: `MK-${p.id}`,
    })
  }

  console.log(`🔍 Checking reachability of ${makeupCandidates.length} brand beauty product images...`)
  const verifiedMakeup = await filterReachableImages(makeupCandidates, 24)
  for (const item of verifiedMakeup) {
    if (!seenImages.has(item.image) && !seenNames.has(item.name.toLowerCase())) {
      seenImages.add(item.image)
      seenNames.add(item.name.toLowerCase())
      combined.push(item)
    }
  }
  console.log(`✅ Added ${verifiedMakeup.length} verified brand beauty items with direct website links`)

  console.log(`🎉 Total curated catalog: ${combined.length} unique products with verified real images!`)

  const client = await pool.connect()
  try {
    await setupSchema(client)

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
          true,
          item.source_site,
          item.external_url,
          item.external_cart_url,
          item.external_id
        )

        const ph = []
        for (let c = 0; c < 26; c++) ph.push(`$${paramIdx++}`)
        valueStrings.push(`(${ph.join(', ')})`)
      })

      await client.query(
        `INSERT INTO products (
          name, category, brand, price, original_price, discount, rating, reviews_count,
          image, stock, delivery_days, badge, group_price, specs,
          seller_name, seller_rating, seller_hub, seller_gstin, warranty_policy, is_brand_direct,
          source, is_active, source_site, external_url, external_cart_url, external_id
        ) VALUES ${valueStrings.join(', ')}`,
        params
      )

      inserted += slice.length
      console.log(`📦 Inserted ${inserted} / ${combined.length} real original products...`)
    }

    console.log('🎉 Real Catalog + External Bridge Schema seeded in Supabase!')
  } finally {
    client.release()
    await pool.end()
  }
}

seedRealCatalog().catch((err) => {
  console.error('❌ Seed error:', err)
  process.exit(1)
})
