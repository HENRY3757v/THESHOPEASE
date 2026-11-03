import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'dsa',
  database: 'shopify_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Test Connection
pool.getConnection()
  .then((conn) => {
    console.log('✅ Connected to MySQL database (shopify_db) successfully!')
    conn.release()
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MySQL:', err.message)
  })

// Health Check
app.get('/', (req, res) => {
  res.send({ status: 'Online', message: 'ShopEase API is running!' })
})

// 1. REGISTER USER
app.post('/api/register', async (req, res) => {
  const { name, email, phone, address, password } = req.body

  if (!name || !email || !phone || !address || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, address, hashedPassword]
    )

    console.log(`[USER REGISTERED] ID: ${result.insertId}, Name: ${name}, Email: ${email}`)

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      userId: result.insertId,
      user: {
        id: result.insertId,
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
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const user = rows[0]
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

// 3. GET ALL USERS (To view stored database records)
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone, address, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ total: users.length, users })
  } catch (err) {
    console.error('Fetch users error:', err)
    res.status(500).json({ error: 'Failed to retrieve users.' })
  }
})

// 4. CREATE NEW ORDER (Linked to user)
app.post('/api/orders', async (req, res) => {
  const { userId, userName, userEmail, userPhone, shippingAddress, items, totalAmount, deliveryDays = 3 } = req.body

  if (!userId || !items || items.length === 0 || !totalAmount) {
    return res.status(400).json({ error: 'Missing required order details.' })
  }

  try {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
    
    // Calculate estimated delivery date (e.g. 2-3 days from today)
    const deliveryDateObj = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000)
    const deliveryDate = deliveryDateObj.toISOString().split('T')[0] // 'YYYY-MM-DD'

    const [result] = await pool.query(
      `INSERT INTO orders 
      (order_number, user_id, user_name, user_email, user_phone, shipping_address, items_summary, total_amount, delivery_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    console.log(`[ORDER CREATED] ${orderNumber} for ${userName} (${userEmail}) - Total: ₹${totalAmount}`)

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: result.insertId,
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

// 5. GET ORDERS (Optionally filter by userId or get all)
app.get('/api/orders', async (req, res) => {
  const { userId } = req.query

  try {
    let query = 'SELECT * FROM orders ORDER BY created_at DESC'
    let params = []

    if (userId) {
      query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
      params = [userId]
    }

    const [orders] = await pool.query(query, params)
    res.json({ total: orders.length, orders })
  } catch (err) {
    console.error('Fetch orders error:', err)
    res.status(500).json({ error: 'Failed to retrieve orders.' })
  }
})

// 6. GET PRODUCTS (Paginated with search, category & sort)
app.get('/api/products', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24))
    const offset = (page - 1) * limit
    const { category, brand, search, sortBy } = req.query

    const conditions = []
    const params = []

    if (category && category !== 'All') {
      conditions.push('category = ?')
      params.push(category)
    }

    if (brand && brand !== 'All') {
      conditions.push('brand = ?')
      params.push(brand)
    }

    if (search && search.trim()) {
      conditions.push('(name LIKE ? OR brand LIKE ? OR category LIKE ?)')
      const q = `%${search.trim()}%`
      params.push(q, q, q)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Sorting
    let orderBy = 'ORDER BY id ASC'
    if (sortBy === 'price_low') orderBy = 'ORDER BY price ASC'
    else if (sortBy === 'price_high') orderBy = 'ORDER BY price DESC'
    else if (sortBy === 'rating') orderBy = 'ORDER BY rating DESC'
    else if (sortBy === 'discount') orderBy = 'ORDER BY CAST(REPLACE(discount, "% OFF", "") AS UNSIGNED) DESC'

    // Total count query
    const [countRows] = await pool.query(`SELECT COUNT(*) as count FROM products ${whereClause}`, params)
    const totalCount = countRows[0].count

    // Data query with LIMIT & OFFSET (Parameterized as numbers)
    const dataQuery = `SELECT * FROM products ${whereClause} ${orderBy} LIMIT ? OFFSET ?`
    const [products] = await pool.query(dataQuery, [...params, limit, offset])

    res.json({
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      products,
    })
  } catch (err) {
    console.error('Fetch products error:', err)
    res.status(500).json({ error: 'Failed to retrieve products.' })
  }
})

// 7. GET CATEGORIES (With counts)
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC'
    )
    res.json(categories)
  } catch (err) {
    console.error('Fetch categories error:', err)
    res.status(500).json({ error: 'Failed to retrieve categories.' })
  }
})

// 8. GET BRANDS (Filtered optionally by category)
app.get('/api/brands', async (req, res) => {
  const { category } = req.query
  try {
    let query = 'SELECT brand, COUNT(*) as count FROM products'
    const params = []
    if (category && category !== 'All') {
      query += ' WHERE category = ?'
      params.push(category)
    }
    query += ' GROUP BY brand ORDER BY count DESC'
    const [brands] = await pool.query(query, params)
    res.json(brands)
  } catch (err) {
    console.error('Fetch brands error:', err)
    res.status(500).json({ error: 'Failed to retrieve brands.' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`)
})
