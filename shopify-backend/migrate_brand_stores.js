import pg from 'pg'
const { Pool } = pg

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.shaxsnjcircagqdggbwg:LEODAS8777%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

const BRAND_SELLERS = {
  Apple: {
    name: 'Apple India Authorized Flagship Store',
    rating: 4.9,
    hub: 'Bengaluru Apple Fulfillment Hub',
    gstin: '29AAAAA0000A1Z5',
    tagline: 'Official Apple Warranty & 100% Genuine Hardware',
    policy: '1 Year AppleCare+ Doorstep Coverage',
  },
  Samsung: {
    name: 'Samsung Electronics India Official Direct',
    rating: 4.8,
    hub: 'Noida Mega Factory & Logistics Hub',
    gstin: '09AAACS1234F1Z8',
    tagline: 'Direct from Samsung Brand Factory',
    policy: '1 Year Samsung India Warranty with On-Site Service',
  },
  Vivo: {
    name: 'Vivo Mobile India Official Store',
    rating: 4.8,
    hub: 'Greater Noida Tech Industrial Park',
    gstin: '09AABCV9876P1Z3',
    tagline: '100% Original Vivo Sealed Units',
    policy: '1 Year Vivo Official Free Screen Replacement eligible',
  },
  OnePlus: {
    name: 'OnePlus Exclusive Online Brand Store',
    rating: 4.8,
    hub: 'Bengaluru Express Dispatch Hub',
    gstin: '29AAFCO6543Q1Z2',
    tagline: 'Never Settle - Direct OnePlus Fulfillment',
    policy: 'Red Cable Club Extended Warranty Eligible',
  },
  boAt: {
    name: 'boAt Lifestyle Flagship Direct Store',
    rating: 4.9,
    hub: 'Mumbai Coastal Logistics Center',
    gstin: '27AAGCB4321R1Z9',
    tagline: 'Direct boAt Sourced • Plug Into Nirvana',
    policy: '1 Year boAt Hassle-Free Doorstep Replacement',
  },
  Sony: {
    name: 'Sony India Authorized Electronics Store',
    rating: 4.9,
    hub: 'New Delhi National Central Hub',
    gstin: '07AAACS5678S1Z0',
    tagline: 'Authentic Sony India Bravia & Audio Direct',
    policy: '1 Year Sony Pan-India Service Center Network',
  },
  Prestige: {
    name: 'Prestige Smart Kitchen Official Store',
    rating: 4.8,
    hub: 'Chennai Kitchenware Logistics Terminal',
    gstin: '33AAACT9876T1Z4',
    tagline: 'TTK Prestige Direct Factory Sourced',
    policy: '2-5 Years Genuine Prestige Doorstep Warranty',
  },
  Hawkins: {
    name: 'Hawkins Cookers Limited Official Direct',
    rating: 4.9,
    hub: 'Thane Central Factory Depot',
    gstin: '27AAACH1234H1Z6',
    tagline: '100% Pure Hawkins Pressure Cookware',
    policy: '5 Years Hawkins Comprehensive Factory Guarantee',
  },
  Philips: {
    name: 'Philips Domestic Appliances Official',
    rating: 4.8,
    hub: 'Kolkata East Logistics Center',
    gstin: '19AAACP4321K1Z7',
    tagline: 'Genuine Philips Innovation & You Direct',
    policy: '2 Years Global Philips Warranty with Home Service',
  },
  Nike: {
    name: 'Nike India Authorized Brand Store',
    rating: 4.9,
    hub: 'Gurugram Express Footwear Terminal',
    gstin: '06AAACN7890N1Z1',
    tagline: 'Just Do It - 100% Genuine Nike Direct Sourced',
    policy: 'Original Box & Authenticity Tag Guarantee',
  },
  Adidas: {
    name: 'Adidas India Flagship Direct Store',
    rating: 4.8,
    hub: 'Manesar Sports Logistics Warehouse',
    gstin: '06AAACA5432A1Z5',
    tagline: 'Impossible is Nothing • Official Adidas Direct',
    policy: '100% Original Boost & Primeknit Authenticity',
  },
  Titan: {
    name: 'Titan Company Limited Official Store',
    rating: 4.9,
    hub: 'Hosur Horology Manufacturing Park',
    gstin: '33AAACT1111T1Z9',
    tagline: 'A TATA Product • 100% Authentic Timepieces',
    policy: '2 Years International Titan Warranty Card Included',
  },
  Casio: {
    name: 'Casio India Authorized Store',
    rating: 4.9,
    hub: 'New Delhi National Distribution Hub',
    gstin: '07AAACC2222C1Z8',
    tagline: 'Official G-Shock & Edifice Direct Partner',
    policy: '2+6 Months Extended Casio India Warranty',
  },
}

async function migrateStores() {
  console.log('🔄 Adding Official Brand Stores & Direct Fulfillment architecture...')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Add brand seller columns to products
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_rating NUMERIC(3, 1) DEFAULT 4.9;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_hub VARCHAR(255);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_gstin VARCHAR(50);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty_policy TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_brand_direct BOOLEAN DEFAULT TRUE;
    `)
    console.log('✅ Columns added to "products" table')

    // 2. Add brand dispatch info to orders
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS brand_store VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS brand_hub VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_stage INTEGER DEFAULT 2;
    `)
    console.log('✅ Columns added to "orders" table')

    // 3. Update products with official brand seller info
    for (const [brand, info] of Object.entries(BRAND_SELLERS)) {
      await client.query(
        `UPDATE products 
         SET seller_name = $1, seller_rating = $2, seller_hub = $3, seller_gstin = $4, warranty_policy = $5, is_brand_direct = true 
         WHERE brand ILIKE $6`,
        [info.name, info.rating, info.hub, info.gstin, info.policy, `%${brand}%`]
      )
    }

    // Default fallback for any remaining brands
    await client.query(`
      UPDATE products 
      SET seller_name = brand || ' Official Direct Store',
          seller_rating = 4.8,
          seller_hub = 'National Central Fulfillment Hub',
          seller_gstin = '07AAACX9999X1Z1',
          warranty_policy = '1 Year Official Brand Warranty with Free Doorstep Pickup',
          is_brand_direct = true
      WHERE seller_name IS NULL;
    `)

    await client.query('COMMIT')
    console.log('🎉 Brand Stores & Official Fulfillment migration successful!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration error:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

migrateStores()
