import express from 'express'
import cors from 'cors'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const { Pool } = pg
const app = express()

app.use(cors())
app.use(express.json())

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.shaxsnjcircagqdggbwg:LEODAS8777%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ status: 'Online', message: 'ShopEase API is running on Vercel with Supabase!' })
})

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  const { name, email, phone, address, password } = req.body

  if (!name || !email || !phone || !address || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, address, password) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, email, phone, address, hashedPassword]
    )

    const userId = result.rows[0].id

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      userId,
      user: {
        id: userId,
        name,
        email,
        phone,
        address,
      },
    })
  } catch (err) {
    console.error('Registration error:', err)
    return res.status(500).json({ error: 'Server error during registration.' })
  }
})

// 2. LOGIN USER
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const user = result.rows[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error during login.' })
  }
})

// 3. GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, address, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ total: result.rows.length, users: result.rows })
  } catch (err) {
    console.error('Fetch users error:', err)
    res.status(500).json({ error: 'Failed to retrieve users.' })
  }
})

// 4. CREATE NEW ORDER
router.post('/orders', async (req, res) => {
  const { userId, userName, userEmail, userPhone, shippingAddress, items, totalAmount, deliveryDays = 3 } = req.body

  if (!userId || !items || items.length === 0 || !totalAmount) {
    return res.status(400).json({ error: 'Missing required order details.' })
  }

  try {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
    const deliveryDateObj = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000)
    const deliveryDate = deliveryDateObj.toISOString().split('T')[0]

    const result = await pool.query(
      `INSERT INTO orders 
      (order_number, user_id, user_name, user_email, user_phone, shipping_address, items_summary, total_amount, delivery_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        orderNumber,
        userId,
        userName,
        userEmail,
        userPhone,
        shippingAddress,
        JSON.stringify(items),
        totalAmount,
        deliveryDate,
        'Placed',
      ]
    )

    const orderId = result.rows[0].id

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        orderNumber,
        userName,
        userEmail,
        totalAmount,
        deliveryDate,
        status: 'Placed',
        items,
      },
    })
  } catch (err) {
    console.error('Create order error:', err)
    return res.status(500).json({ error: 'Server error placing order.' })
  }
})

// 5. GET ORDERS
router.get('/orders', async (req, res) => {
  const { userId } = req.query

  try {
    let query = 'SELECT * FROM orders ORDER BY created_at DESC'
    let params = []

    if (userId) {
      query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC'
      params = [userId]
    }

    const result = await pool.query(query, params)
    res.json({ total: result.rows.length, orders: result.rows })
  } catch (err) {
    console.error('Fetch orders error:', err)
    res.status(500).json({ error: 'Failed to retrieve orders.' })
  }
})

// 6. GET PRODUCTS
router.get('/products', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24))
    const offset = (page - 1) * limit
    const { category, brand, search, sortBy } = req.query

    const conditions = []
    const params = []
    let paramIndex = 1

    if (category && category !== 'All') {
      conditions.push(`category = $${paramIndex++}`)
      params.push(category)
    }

    if (brand && brand !== 'All') {
      conditions.push(`brand = $${paramIndex++}`)
      params.push(brand)
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`
      conditions.push(`(name ILIKE $${paramIndex} OR brand ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`)
      params.push(q)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    let orderBy = 'ORDER BY id ASC'
    if (sortBy === 'price_low') orderBy = 'ORDER BY price ASC'
    else if (sortBy === 'price_high') orderBy = 'ORDER BY price DESC'
    else if (sortBy === 'rating') orderBy = 'ORDER BY rating DESC'
    else if (sortBy === 'discount') orderBy = "ORDER BY CAST(REPLACE(discount, '% OFF', '') AS INTEGER) DESC"

    const countResult = await pool.query(`SELECT COUNT(*) as count FROM products ${whereClause}`, params)
    const totalCount = parseInt(countResult.rows[0].count, 10)

    const dataQuery = `SELECT * FROM products ${whereClause} ${orderBy} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    const dataResult = await pool.query(dataQuery, [...params, limit, offset])

    res.json({
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      products: dataResult.rows,
    })
  } catch (err) {
    console.error('Fetch products error:', err)
    res.status(500).json({ error: 'Failed to retrieve products.' })
  }
})

// 7. GET CATEGORIES
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Fetch categories error:', err)
    res.status(500).json({ error: 'Failed to retrieve categories.' })
  }
})

// 8. GET BRANDS
router.get('/brands', async (req, res) => {
  const { category } = req.query
  try {
    let query = 'SELECT brand, COUNT(*) as count FROM products'
    const params = []
    if (category && category !== 'All') {
      query += ' WHERE category = $1'
      params.push(category)
    }
    query += ' GROUP BY brand ORDER BY count DESC'
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    console.error('Fetch brands error:', err)
    res.status(500).json({ error: 'Failed to retrieve brands.' })
  }
})

// Support both /api and / routes
app.use('/api', router)
app.use('/', router)

export default app
