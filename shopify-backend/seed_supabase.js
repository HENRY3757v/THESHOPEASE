import pg from 'pg'
import fs from 'fs'

const { Pool } = pg

const connectionString = 'postgresql://postgres.shaxsnjcircagqdggbwg:LEODAS8777%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

// Read original MASTER_CATALOG from seedUltimateCatalogWithDostiAndCompare.js
const originalCode = fs.readFileSync('C:\\Users\\jha\\.gemini\\antigravity\\scratch\\shopify-backend\\seedUltimateCatalogWithDostiAndCompare.js', 'utf8')

// Extract BADGES and MASTER_CATALOG using eval in a sandbox function
const catalogMatch = originalCode.match(/const MASTER_CATALOG = ([\s\S]*?)\nconst BADGES =/m)
const badgesMatch = originalCode.match(/const BADGES = (\[[\s\S]*?\])/m)

let MASTER_CATALOG, BADGES
if (catalogMatch && badgesMatch) {
  MASTER_CATALOG = new Function(`return ${catalogMatch[1]}`)()
  BADGES = new Function(`return ${badgesMatch[1]}`)()
} else {
  console.error('Could not extract catalog from source')
  process.exit(1)
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seedSupabase() {
  console.log('🚀 Seeding Supabase PostgreSQL with authentic products...')
  const client = await pool.connect()

  try {
    await client.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE')
    console.log('🧹 Cleaned existing products table')

    const flattenedList = []
    for (const [catName, brandsObj] of Object.entries(MASTER_CATALOG)) {
      for (const [brandName, modelsArr] of Object.entries(brandsObj)) {
        for (const m of modelsArr) {
          flattenedList.push({
            category: catName,
            brand: brandName,
            model: m.model,
            mrp: m.mrp,
            price: m.price,
            img: m.img,
            specs: m.specs,
          })
        }
      }
    }

    console.log(`📦 Loaded ${flattenedList.length} distinct authentic models across all categories.`)

    const colorways = [
      'Graphite Black',
      'Pearl White',
      'Pacific Blue',
      'Natural Titanium',
      'Space Grey',
      'Crimson Red',
      'Forest Green',
      'Desert Gold',
    ]

    const TOTAL_COUNT = 2400 // 100 full pages of 24 products each!
    const BATCH_SIZE = 100
    let inserted = 0

    for (let batch = 0; batch < TOTAL_COUNT / BATCH_SIZE; batch++) {
      const valueStrings = []
      const params = []
      let paramIndex = 1

      for (let i = 0; i < BATCH_SIZE; i++) {
        const globalIndex = batch * BATCH_SIZE + i
        const base = flattenedList[globalIndex % flattenedList.length]
        const color = colorways[Math.floor(globalIndex / flattenedList.length) % colorways.length]

        const name = `${base.brand} ${base.model} (${color})`
        const priceJitter = 1 + (getRandomInt(-1, 1) / 100)
        const finalPrice = Math.round((base.price * priceJitter) / 10) * 10
        const finalMrp = base.mrp
        const discountPercent = Math.max(5, Math.round(((finalMrp - finalPrice) / finalMrp) * 100))
        const discount = `${discountPercent}% OFF`
        const groupPrice = Math.round((finalPrice * 0.88) / 10) * 10
        const rating = Number((4.2 + Math.random() * 0.7).toFixed(1))
        const reviews = getRandomInt(120, 14500)
        const stock = getRandomInt(15, 300)
        const deliveryDays = getRandomInt(1, 3)
        const badge = BADGES[globalIndex % BADGES.length]

        const specsObj = {
          ...base.specs,
          colorway: color,
          in_the_box: `${base.model}, User Manual, Warranty Card`,
        }

        params.push(
          name,
          base.category,
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
          groupPrice,
          JSON.stringify(specsObj)
        )

        const placeholders = []
        for (let p = 0; p < 14; p++) {
          placeholders.push(`$${paramIndex++}`)
        }
        valueStrings.push(`(${placeholders.join(', ')})`)
      }

      const query = `
        INSERT INTO products 
        (name, category, brand, price, original_price, discount, rating, reviews_count, image, stock, delivery_days, badge, group_price, specs)
        VALUES ${valueStrings.join(', ')}
      `

      await client.query(query, params)
      inserted += BATCH_SIZE
      process.stdout.write(`\rProgress: ${inserted} / ${TOTAL_COUNT} products inserted into Supabase...`)
    }

    console.log('\n✅ Seeding Complete! 2,400 authentic products live in Supabase PostgreSQL!')
  } catch (err) {
    console.error('\n❌ Seeding error:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

seedSupabase()
