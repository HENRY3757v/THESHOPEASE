import express from 'express'
import cors from 'cors'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const { Pool } = pg
const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.shaxsnjcircagqdggbwg:LEODAS8777%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

const ADMIN_PLATFORM_UPI = process.env.ADMIN_UPI_ID || 'shopease.platform@okicici'
const DAILY_FEE_PER_ITEM = 20

const KNOWN_UPI_HANDLES = new Set([
  'okicici', 'okaxis', 'okhdfcbank', 'oksbi', 'ybl', 'ibl', 'axl',
  'paytm', 'ptsbi', 'pthdfc', 'ptaxis', 'ptyes', 'upi', 'apl', 'icici',
  'sbi', 'hdfcbank', 'axisbank', 'kotak', 'indus', 'federal', 'barodampay',
  'fam', 'jupiteraxis', 'sliceaxis', 'naviaxis', 'superyes', 'pingpay', 'waaxis',
])

function isValidUpiVpa(vpa) {
  if (!vpa || typeof vpa !== 'string') return { valid: false, reason: 'UPI ID is required.' }
  const cleaned = vpa.trim().toLowerCase()
  const vpaRegex = /^[a-z0-9._-]{2,256}@[a-z]{2,64}$/
  if (!vpaRegex.test(cleaned)) {
    return { valid: false, reason: 'Invalid UPI VPA format (e.g., name@okaxis or 9876543210@ybl).' }
  }
  const handle = cleaned.split('@')[1]
  if (!KNOWN_UPI_HANDLES.has(handle)) {
    return {
      valid: false,
      reason: `Unrecognized UPI bank handle "@${handle}". Use valid NPCI handles like @okicici, @okaxis, @oksbi, @ybl, @paytm, @upi.`,
    }
  }
  return { valid: true, normalized: cleaned, handle }
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`
  return null
}

function hashOtp(phone, purpose, otp) {
  return crypto.createHash('sha256').update(`${phone}:${purpose}:${otp}`).digest('hex')
}

async function sendRealSmsIfConfigured(normalizedPhone, otp) {
  const tenDigits = normalizedPhone.replace(/^\+91/, '')

  // Option 1: Fast2SMS (Popular Indian SMS Gateway)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: tenDigits,
        }),
      })
      const data = await resp.json()
      if (data.return) return { sent: true, provider: 'Fast2SMS' }
    } catch (e) {
      console.error('Fast2SMS failed:', e)
    }
  }

  // Option 2: Twilio SMS
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')
      const body = new URLSearchParams({
        To: normalizedPhone,
        From: process.env.TWILIO_PHONE,
        Body: `Your ShopEase verification OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
      })
      const resp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      )
      if (resp.ok) return { sent: true, provider: 'Twilio' }
    } catch (e) {
      console.error('Twilio SMS failed:', e)
    }
  }

  return { sent: false, provider: 'sandbox' }
}

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    status: 'Online',
    message: 'ShopEase Direct Brand-Fulfillment & Seller Marketplace API is running!',
    adminUpiId: ADMIN_PLATFORM_UPI,
    dailyFeePerItem: DAILY_FEE_PER_ITEM,
  })
})

// ============================================================
// AUTHENTICATION: PHONE OTP SEND & VERIFY
// ============================================================
router.post('/otp/send', async (req, res) => {
  const { phone, purpose = 'upi_verify' } = req.body
  const normalized = normalizePhone(phone)

  if (!normalized) {
    return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number.' })
  }

  try {
    const otp = String(crypto.randomInt(100000, 999999))
    const otpHash = hashOtp(normalized, purpose, otp)

    await pool.query(
      `INSERT INTO phone_otps (phone, purpose, otp_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`,
      [normalized, purpose, otpHash]
    )

    const smsResult = await sendRealSmsIfConfigured(normalized, otp)

    return res.json({
      success: true,
      phone: normalized,
      smsMode: smsResult.sent ? 'live_sms' : 'sandbox',
      provider: smsResult.provider,
      message: smsResult.sent
        ? `OTP sent via ${smsResult.provider} SMS to ${normalized}`
        : `SMS gateway key not set on server — Sandbox OTP active for ${normalized}`,
      ...(smsResult.sent ? {} : { sandboxOtp: otp }),
    })
  } catch (err) {
    console.error('Send OTP error:', err)
    return res.status(500).json({ error: 'Failed to generate OTP.' })
  }
})

router.post('/otp/verify', async (req, res) => {
  const { phone, otp, purpose = 'upi_verify' } = req.body
  const normalized = normalizePhone(phone)

  if (!normalized || !otp || String(otp).trim().length !== 6) {
    return res.status(400).json({ error: 'Valid phone number and 6-digit OTP are required.' })
  }

  try {
    const latest = await pool.query(
      `SELECT * FROM phone_otps
       WHERE phone = $1 AND purpose = $2 AND verified = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalized, purpose]
    )

    if (latest.rows.length === 0) {
      return res.status(400).json({ error: 'OTP expired or not found. Please request a fresh OTP.' })
    }

    const row = latest.rows[0]
    if (row.attempts >= 5) {
      return res.status(429).json({ error: 'Too many wrong attempts. Please request a new OTP.' })
    }

    const expectedHash = hashOtp(normalized, purpose, String(otp).trim())
    if (row.otp_hash !== expectedHash) {
      await pool.query('UPDATE phone_otps SET attempts = attempts + 1 WHERE id = $1', [row.id])
      return res.status(401).json({ error: 'Incorrect OTP code. Please check and try again.' })
    }

    await pool.query('UPDATE phone_otps SET verified = TRUE WHERE id = $1', [row.id])

    return res.json({
      success: true,
      verified: true,
      otpVerificationId: row.id,
      phone: normalized,
      message: 'Phone number authenticated via OTP!',
    })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return res.status(500).json({ error: 'Failed to verify OTP.' })
  }
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

// 4. CREATE NEW ORDER (With Brand Store Fulfillment & UPI info)
router.post('/orders', async (req, res) => {
  const {
    userId,
    userName,
    userEmail,
    userPhone,
    shippingAddress,
    items,
    totalAmount,
    deliveryDays = 2,
    paymentMethod = 'UPI',
    upiId = '',
    transactionId = '',
  } = req.body

  if (!userId || !items || items.length === 0 || !totalAmount) {
    return res.status(400).json({ error: 'Missing required order details.' })
  }

  try {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
    const txn = transactionId || `UPI-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`
    const invoiceNumber = `TAX-${Date.now().toString().slice(-7)}`
    const deliveryDateObj = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000)
    const deliveryDate = deliveryDateObj.toISOString().split('T')[0]

    const brandStore = items[0]?.seller_name || `${items[0]?.name?.split(' ')[0] || 'Brand'} Official Flagship Store`
    const brandHub = items[0]?.seller_hub || 'National Brand Logistics Hub'

    const result = await pool.query(
      `INSERT INTO orders 
      (order_number, user_id, user_name, user_email, user_phone, shipping_address, items_summary, total_amount, delivery_date, status, payment_method, upi_id, transaction_id, payment_status, brand_store, brand_hub, invoice_number, tracking_stage)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id`,
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
        'Confirmed with Brand Store',
        paymentMethod,
        upiId,
        txn,
        'Completed',
        brandStore,
        brandHub,
        invoiceNumber,
        2,
      ]
    )

    const orderId = result.rows[0].id

    return res.status(201).json({
      success: true,
      message: 'Order confirmed & dispatched directly by Official Brand Store!',
      order: {
        id: orderId,
        orderNumber,
        userName,
        userEmail,
        totalAmount,
        deliveryDate,
        status: 'Confirmed with Brand Store',
        paymentMethod,
        upiId,
        transactionId: txn,
        paymentStatus: 'Completed',
        brandStore,
        brandHub,
        invoiceNumber,
        trackingStage: 2,
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

// 6. GET PRODUCTS (Includes Brand Direct + Seller Listed active products)
router.get('/products', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 24))
    const offset = (page - 1) * limit
    const { category, brand, search, sortBy } = req.query

    const conditions = ['(is_active IS NULL OR is_active = TRUE)']
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
      conditions.push(
        `(name ILIKE $${paramIndex} OR brand ILIKE $${paramIndex} OR category ILIKE $${paramIndex} OR seller_name ILIKE $${paramIndex})`
      )
      params.push(q)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    let orderBy = 'ORDER BY id DESC'
    if (sortBy === 'featured') orderBy = "ORDER BY CASE WHEN source = 'seller' THEN 0 ELSE 1 END, id ASC"
    else if (sortBy === 'price_low') orderBy = 'ORDER BY price ASC'
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
      'SELECT category, COUNT(*) as count FROM products WHERE (is_active IS NULL OR is_active = TRUE) GROUP BY category ORDER BY count DESC'
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
    let query = 'SELECT brand, COUNT(*) as count FROM products WHERE (is_active IS NULL OR is_active = TRUE)'
    const params = []
    if (category && category !== 'All') {
      query += ' AND category = $1'
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

// 9. GET USER UPI ACCOUNTS
router.get('/upi', async (req, res) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId is required' })
  try {
    const result = await pool.query(
      'SELECT * FROM upi_accounts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Fetch UPI error:', err)
    res.status(500).json({ error: 'Failed to retrieve UPI accounts.' })
  }
})

// 10. CONNECT & OTP-VERIFY REAL UPI ACCOUNT
router.post('/upi', async (req, res) => {
  const { userId, upiId, provider = 'Google Pay', accountName, phone, otpVerificationId } = req.body

  if (!userId || !upiId) {
    return res.status(400).json({ error: 'userId and upiId are required.' })
  }

  const vpaCheck = isValidUpiVpa(upiId)
  if (!vpaCheck.valid) {
    return res.status(400).json({ error: vpaCheck.reason })
  }

  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone || !otpVerificationId) {
    return res.status(400).json({
      error: 'Phone OTP authentication is required before linking a UPI ID.',
    })
  }

  try {
    // Verify OTP proof exists in DB
    const otpProof = await pool.query(
      `SELECT id FROM phone_otps
       WHERE id = $1 AND phone = $2 AND purpose = 'upi_verify' AND verified = TRUE
       AND created_at > NOW() - INTERVAL '30 minutes'`,
      [otpVerificationId, normalizedPhone]
    )

    if (otpProof.rows.length === 0) {
      return res.status(403).json({
        error: 'Phone OTP proof invalid or expired. Please verify your phone via OTP again.',
      })
    }

    const existing = await pool.query(
      'SELECT id FROM upi_accounts WHERE user_id = $1 AND LOWER(upi_id) = $2',
      [userId, vpaCheck.normalized]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This UPI ID is already connected to your account.' })
    }

    const result = await pool.query(
      `INSERT INTO upi_accounts (user_id, upi_id, provider, account_name, is_verified, verified_phone, otp_verified_at) 
       VALUES ($1, $2, $3, $4, true, $5, NOW()) RETURNING *`,
      [userId, vpaCheck.normalized, provider, accountName || 'Verified Account', normalizedPhone]
    )

    return res.status(201).json({
      success: true,
      message: 'UPI ID verified via Phone OTP & linked successfully!',
      upiAccount: result.rows[0],
    })
  } catch (err) {
    console.error('Save UPI error:', err)
    return res.status(500).json({ error: 'Failed to save UPI account.' })
  }
})

// 11. REMOVE UPI ACCOUNT
router.delete('/upi/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM upi_accounts WHERE id = $1', [id])
    res.json({ success: true, message: 'UPI account removed.' })
  } catch (err) {
    console.error('Delete UPI error:', err)
    res.status(500).json({ error: 'Failed to delete UPI account.' })
  }
})

// ============================================================
// SELLER MARKETPLACE PORTAL ("Sell on ShopEase" — ₹20/item/day)
// ============================================================

// 12. GET SELLER PROFILE, LISTED ITEMS & DAILY ₹20/ITEM FEE LEDGER
router.get('/seller/me', async (req, res) => {
  const { userId, phone } = req.query
  if (!userId && !phone) {
    return res.status(400).json({ error: 'userId or phone is required' })
  }

  try {
    let sellerQuery = 'SELECT * FROM sellers WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1'
    let params = [userId]

    if (!userId && phone) {
      const norm = normalizePhone(phone)
      sellerQuery = 'SELECT * FROM sellers WHERE phone = $1 ORDER BY created_at DESC LIMIT 1'
      params = [norm]
    }

    const sellerRes = await pool.query(sellerQuery, params)
    if (sellerRes.rows.length === 0) {
      return res.json({
        registered: false,
        adminUpiId: ADMIN_PLATFORM_UPI,
        dailyFeePerItem: DAILY_FEE_PER_ITEM,
      })
    }

    const seller = sellerRes.rows[0]
    const productsRes = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY id DESC',
      [seller.id]
    )

    const activeItems = productsRes.rows.filter((p) => p.is_active !== false)
    const activeCount = activeItems.length
    const dailyFeeDue = activeCount * DAILY_FEE_PER_ITEM

    const ledgerRes = await pool.query(
      'SELECT * FROM seller_fee_ledger WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 20',
      [seller.id]
    )

    const todayPaidRes = await pool.query(
      "SELECT COALESCE(SUM(total_fee), 0) as paid_today FROM seller_fee_ledger WHERE seller_id = $1 AND billing_date = CURRENT_DATE AND payment_status = 'paid'",
      [seller.id]
    )
    const paidToday = parseInt(todayPaidRes.rows[0].paid_today, 10) || 0

    return res.json({
      registered: true,
      seller,
      products: productsRes.rows,
      activeCount,
      dailyFeePerItem: DAILY_FEE_PER_ITEM,
      dailyFeeDue,
      paidToday,
      balanceDueToday: Math.max(0, dailyFeeDue - paidToday),
      adminUpiId: ADMIN_PLATFORM_UPI,
      ledger: ledgerRes.rows,
    })
  } catch (err) {
    console.error('Get seller error:', err)
    return res.status(500).json({ error: 'Failed to load seller portal data.' })
  }
})

// 13. REGISTER SELLER (Phone OTP Verified)
router.post('/seller/register', async (req, res) => {
  const { userId, storeName, ownerName, phone, email, gstin, cityHub, upiId, otpVerificationId } = req.body

  if (!storeName || !ownerName || !phone || !email || !cityHub || !upiId) {
    return res.status(400).json({ error: 'All seller store fields are required.' })
  }

  const vpaCheck = isValidUpiVpa(upiId)
  if (!vpaCheck.valid) {
    return res.status(400).json({ error: vpaCheck.reason })
  }

  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone || !otpVerificationId) {
    return res.status(400).json({ error: 'Phone OTP authentication is required to open a Seller Store.' })
  }

  try {
    const otpProof = await pool.query(
      `SELECT id FROM phone_otps
       WHERE id = $1 AND phone = $2 AND purpose = 'seller_auth' AND verified = TRUE
       AND created_at > NOW() - INTERVAL '30 minutes'`,
      [otpVerificationId, normalizedPhone]
    )

    if (otpProof.rows.length === 0) {
      return res.status(403).json({ error: 'Seller Phone OTP invalid or expired. Please verify OTP first.' })
    }

    const result = await pool.query(
      `INSERT INTO sellers (user_id, store_name, owner_name, phone, email, gstin, city_hub, upi_id, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *`,
      [userId || null, storeName.trim(), ownerName.trim(), normalizedPhone, email.trim(), gstin || 'UNREGISTERED', cityHub.trim(), vpaCheck.normalized]
    )

    return res.status(201).json({
      success: true,
      message: 'Seller store verified via OTP & activated on ShopEase!',
      seller: result.rows[0],
      adminUpiId: ADMIN_PLATFORM_UPI,
      dailyFeePerItem: DAILY_FEE_PER_ITEM,
    })
  } catch (err) {
    console.error('Register seller error:', err)
    return res.status(500).json({ error: 'Failed to register seller store.' })
  }
})

// 14. SELLER ADDS NEW PRODUCT TO SHOPEASE CATALOG
router.post('/seller/products', async (req, res) => {
  const {
    sellerId,
    name,
    category,
    brand,
    price,
    originalPrice,
    image,
    stock = 25,
    deliveryDays = 2,
    keyFeature,
    warranty = '6 Months Seller Warranty',
  } = req.body

  if (!sellerId || !name || !category || !brand || !price || !image) {
    return res.status(400).json({ error: 'Product name, category, brand, price, and original photo URL are required.' })
  }

  if (!/^https?:\/\/.+/i.test(image.trim())) {
    return res.status(400).json({ error: 'Please provide a valid http/https product image URL.' })
  }

  const numPrice = Math.round(Number(price))
  const numMrp = Math.max(numPrice, Math.round(Number(originalPrice) || numPrice * 1.2))
  const discountPct = Math.max(0, Math.round(((numMrp - numPrice) / numMrp) * 100))
  const groupPrice = Math.round((numPrice * 0.88) / 10) * 10

  try {
    const sellerRes = await pool.query('SELECT * FROM sellers WHERE id = $1', [sellerId])
    if (sellerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Seller account not found.' })
    }
    const seller = sellerRes.rows[0]

    const specs = {
      key_feature: keyFeature || `${brand} Verified Seller Listing`,
      warranty,
      ideal_for: `${category} Buyers`,
      gallery: [image.trim()],
      listed_via: 'Sell on ShopEase Portal',
    }

    const result = await pool.query(
      `INSERT INTO products (
        name, category, brand, price, original_price, discount, rating, reviews_count,
        image, stock, delivery_days, badge, group_price, specs,
        seller_id, seller_name, seller_rating, seller_hub, seller_gstin, warranty_policy,
        is_brand_direct, source, is_active
      ) VALUES ($1,$2,$3,$4,$5,$6,4.6,1,$7,$8,$9,'Seller Verified',$10,$11,$12,$13,4.7,$14,$15,$16,false,'seller',true)
      RETURNING *`,
      [
        name.trim(),
        category.trim(),
        brand.trim(),
        numPrice,
        numMrp,
        discountPct > 0 ? `${discountPct}% OFF` : 'Direct Price',
        image.trim(),
        Math.max(1, parseInt(stock, 10) || 25),
        Math.max(1, parseInt(deliveryDays, 10) || 2),
        groupPrice,
        JSON.stringify(specs),
        seller.id,
        seller.store_name,
        seller.city_hub,
        seller.gstin || 'SELLER-VERIFIED',
        warranty,
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Product published live to ShopEase! Daily app fee: ₹20/day for this item.',
      product: result.rows[0],
    })
  } catch (err) {
    console.error('Add seller product error:', err)
    return res.status(500).json({ error: 'Failed to publish seller product.' })
  }
})

// 15. TOGGLE SELLER PRODUCT ACTIVE / PAUSED
router.patch('/seller/products/:id', async (req, res) => {
  const { id } = req.params
  const { isActive } = req.body
  try {
    const result = await pool.query(
      'UPDATE products SET is_active = $1 WHERE id = $2 AND source = $3 RETURNING *',
      [Boolean(isActive), id, 'seller']
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Seller product not found.' })
    res.json({ success: true, product: result.rows[0] })
  } catch (err) {
    console.error('Toggle seller product error:', err)
    res.status(500).json({ error: 'Failed to update product status.' })
  }
})

// 16. DELETE SELLER PRODUCT
router.delete('/seller/products/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query("DELETE FROM products WHERE id = $1 AND source = 'seller'", [id])
    res.json({ success: true, message: 'Product removed from ShopEase.' })
  } catch (err) {
    console.error('Delete seller product error:', err)
    res.status(500).json({ error: 'Failed to delete seller product.' })
  }
})

// 17. RECORD DAILY ₹20/ITEM APP FEE PAYMENT TO ADMIN UPI
router.post('/seller/pay-fee', async (req, res) => {
  const { sellerId, transactionId, itemCount, totalFee } = req.body

  if (!sellerId || !transactionId || String(transactionId).trim().length < 6) {
    return res.status(400).json({ error: 'Valid UPI Reference / UTR Transaction ID is required.' })
  }

  try {
    const activeRes = await pool.query(
      "SELECT COUNT(*) as cnt FROM products WHERE seller_id = $1 AND (is_active IS NULL OR is_active = TRUE)",
      [sellerId]
    )
    const realCount = parseInt(activeRes.rows[0].cnt, 10) || itemCount || 1
    const computedFee = totalFee || realCount * DAILY_FEE_PER_ITEM

    const result = await pool.query(
      `INSERT INTO seller_fee_ledger (seller_id, item_count, fee_per_item, total_fee, billing_date, admin_upi_id, payment_status, transaction_id)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 'paid', $6) RETURNING *`,
      [sellerId, realCount, DAILY_FEE_PER_ITEM, computedFee, ADMIN_PLATFORM_UPI, String(transactionId).trim()]
    )

    return res.status(201).json({
      success: true,
      message: `₹${computedFee} daily app fee recorded to ShopEase UPI (${ADMIN_PLATFORM_UPI})!`,
      ledgerEntry: result.rows[0],
    })
  } catch (err) {
    console.error('Pay seller fee error:', err)
    return res.status(500).json({ error: 'Failed to record seller fee payment.' })
  }
})

// 18. ADMIN PLATFORM REVENUE OVERVIEW (₹20/item/day collections)
router.get('/seller/platform-revenue', async (req, res) => {
  try {
    const [totals, sellersCount, itemsCount, recent] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(total_fee), 0) as total_collected, COALESCE(SUM(CASE WHEN billing_date = CURRENT_DATE THEN total_fee ELSE 0 END), 0) as today_collected FROM seller_fee_ledger WHERE payment_status = 'paid'"),
      pool.query('SELECT COUNT(*) as cnt FROM sellers'),
      pool.query("SELECT COUNT(*) as cnt FROM products WHERE source = 'seller' AND is_active = TRUE"),
      pool.query(
        `SELECT l.*, s.store_name, s.upi_id as seller_upi
         FROM seller_fee_ledger l
         LEFT JOIN sellers s ON s.id = l.seller_id
         ORDER BY l.created_at DESC LIMIT 15`
      ),
    ])

    res.json({
      adminUpiId: ADMIN_PLATFORM_UPI,
      dailyFeePerItem: DAILY_FEE_PER_ITEM,
      totalCollected: parseInt(totals.rows[0].total_collected, 10) || 0,
      todayCollected: parseInt(totals.rows[0].today_collected, 10) || 0,
      totalSellers: parseInt(sellersCount.rows[0].cnt, 10) || 0,
      activeSellerItems: parseInt(itemsCount.rows[0].cnt, 10) || 0,
      projectedDailyRevenue: (parseInt(itemsCount.rows[0].cnt, 10) || 0) * DAILY_FEE_PER_ITEM,
      recentLedger: recent.rows,
    })
  } catch (err) {
    console.error('Platform revenue error:', err)
    res.status(500).json({ error: 'Failed to load platform revenue.' })
  }
})

// Support both /api and / routes
app.use('/api', router)
app.use('/', router)

export default app
