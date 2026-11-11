import pg from 'pg'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'

const { Client } = pg

const FALLBACK_DB_URL =
  'postgresql://postgres.shaxsnjcircagqdggbwg:LEODAS8777%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'
const DAILY_FEE_PER_ITEM = 20

const KNOWN_UPI_HANDLES = new Set([
  'okicici', 'okaxis', 'okhdfcbank', 'oksbi', 'ybl', 'ibl', 'axl',
  'paytm', 'ptsbi', 'pthdfc', 'ptaxis', 'ptyes', 'upi', 'apl', 'icici',
  'sbi', 'hdfcbank', 'axisbank', 'kotak', 'indus', 'federal', 'barodampay',
  'fam', 'jupiteraxis', 'sliceaxis', 'naviaxis', 'superyes', 'pingpay', 'waaxis',
])

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

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

async function sendRealSmsIfConfigured(normalizedPhone, otp, env) {
  const tenDigits = normalizedPhone.replace(/^\+91/, '')

  if (env?.FAST2SMS_API_KEY) {
    try {
      const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: env.FAST2SMS_API_KEY,
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
      console.error('Fast2SMS error:', e)
    }
  }

  if (env?.TWILIO_ACCOUNT_SID && env?.TWILIO_AUTH_TOKEN && env?.TWILIO_PHONE) {
    try {
      const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)
      const body = new URLSearchParams({
        To: normalizedPhone,
        From: env.TWILIO_PHONE,
        Body: `Your ShopEase verification OTP is ${otp}. Valid for 5 minutes.`,
      })
      const resp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
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
      console.error('Twilio error:', e)
    }
  }

  return { sent: false, provider: 'sandbox' }
}

async function getBody(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

export async function handleApiRequest(request, env = {}) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const url = new URL(request.url)
  const pathname = url.pathname.replace(/^\/api/, '') || '/'
  const method = request.method.toUpperCase()
  const ADMIN_PLATFORM_UPI = env.ADMIN_UPI_ID || 'shopease.platform@okicici'

  // If non-API route hits Worker directly, serve SPA static assets
  if (!url.pathname.startsWith('/api')) {
    if (env.ASSETS) return env.ASSETS.fetch(request)
    return jsonResponse({ status: 'Online', runtime: 'Cloudflare Workers' })
  }

  if (method === 'GET' && pathname === '/') {
    return jsonResponse({
      status: 'Online',
      runtime: 'Cloudflare Edge Serverless',
      message: 'ShopEase Marketplace API is running on Cloudflare!',
      adminUpiId: ADMIN_PLATFORM_UPI,
      dailyFeePerItem: DAILY_FEE_PER_ITEM,
    })
  }

  const client = new Client({
    connectionString: env.DATABASE_URL || FALLBACK_DB_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()

    // 1. SEND OTP
    if (method === 'POST' && pathname === '/otp/send') {
      const { phone, purpose = 'upi_verify' } = await getBody(request)
      const normalized = normalizePhone(phone)
      if (!normalized) {
        return jsonResponse({ error: 'Enter a valid 10-digit Indian mobile number.' }, 400)
      }

      const otp = String(crypto.randomInt(100000, 999999))
      const otpHash = hashOtp(normalized, purpose, otp)

      await client.query(
        `INSERT INTO phone_otps (phone, purpose, otp_hash, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '5 minutes')`,
        [normalized, purpose, otpHash]
      )

      const smsResult = await sendRealSmsIfConfigured(normalized, otp, env)
      return jsonResponse({
        success: true,
        phone: normalized,
        smsMode: smsResult.sent ? 'live_sms' : 'sandbox',
        provider: smsResult.provider,
        message: smsResult.sent
          ? `OTP sent via ${smsResult.provider} SMS to ${normalized}`
          : `SMS gateway key not set on Cloudflare — Sandbox OTP active for ${normalized}`,
        ...(smsResult.sent ? {} : { sandboxOtp: otp }),
      })
    }

    // 2. VERIFY OTP
    if (method === 'POST' && pathname === '/otp/verify') {
      const { phone, otp, purpose = 'upi_verify' } = await getBody(request)
      const normalized = normalizePhone(phone)
      if (!normalized || !otp || String(otp).trim().length !== 6) {
        return jsonResponse({ error: 'Valid phone number and 6-digit OTP are required.' }, 400)
      }

      const latest = await client.query(
        `SELECT * FROM phone_otps
         WHERE phone = $1 AND purpose = $2 AND verified = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [normalized, purpose]
      )
      if (latest.rows.length === 0) {
        return jsonResponse({ error: 'OTP expired or not found. Please request a fresh OTP.' }, 400)
      }

      const row = latest.rows[0]
      if (row.attempts >= 5) {
        return jsonResponse({ error: 'Too many wrong attempts. Please request a new OTP.' }, 429)
      }

      const expectedHash = hashOtp(normalized, purpose, String(otp).trim())
      if (row.otp_hash !== expectedHash) {
        await client.query('UPDATE phone_otps SET attempts = attempts + 1 WHERE id = $1', [row.id])
        return jsonResponse({ error: 'Incorrect OTP code. Please check and try again.' }, 401)
      }

      await client.query('UPDATE phone_otps SET verified = TRUE WHERE id = $1', [row.id])
      return jsonResponse({
        success: true,
        verified: true,
        otpVerificationId: row.id,
        phone: normalized,
        message: 'Phone number authenticated via OTP!',
      })
    }

    // 3. REGISTER
    if (method === 'POST' && pathname === '/register') {
      const { name, email, phone, address, password } = await getBody(request)
      if (!name || !email || !phone || !address || !password) {
        return jsonResponse({ error: 'All fields are required.' }, 400)
      }
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [email])
      if (existing.rows.length > 0) {
        return jsonResponse({ error: 'An account with this email already exists.' }, 409)
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      const result = await client.query(
        `INSERT INTO users (name, email, phone, address, password) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [name, email, phone, address, hashedPassword]
      )
      const userId = result.rows[0].id
      return jsonResponse({
        success: true,
        message: 'User registered successfully!',
        userId,
        user: { id: userId, name, email, phone, address },
      }, 201)
    }

    // 4. LOGIN
    if (method === 'POST' && pathname === '/login') {
      const { email, password } = await getBody(request)
      if (!email || !password) {
        return jsonResponse({ error: 'Email and password are required.' }, 400)
      }
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
      if (result.rows.length === 0) {
        return jsonResponse({ error: 'Invalid email or password.' }, 401)
      }
      const user = result.rows[0]
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return jsonResponse({ error: 'Invalid email or password.' }, 401)
      }
      return jsonResponse({
        success: true,
        message: 'Login successful!',
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address },
      })
    }

    // 5. GET USERS
    if (method === 'GET' && pathname === '/users') {
      const result = await client.query('SELECT id, name, email, phone, address, created_at FROM users ORDER BY created_at DESC')
      return jsonResponse({ total: result.rows.length, users: result.rows })
    }

    // 6. ORDERS (GET & POST)
    if (pathname === '/orders' && method === 'POST') {
      const {
        userId, userName, userEmail, userPhone, shippingAddress,
        items, totalAmount, deliveryDays = 2, paymentMethod = 'UPI', upiId = '', transactionId = '',
      } = await getBody(request)
      if (!userId || !items || items.length === 0 || !totalAmount) {
        return jsonResponse({ error: 'Missing required order details.' }, 400)
      }

      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
      const txn = transactionId || `UPI-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`
      const invoiceNumber = `TAX-${Date.now().toString().slice(-7)}`
      const deliveryDate = new Date(Date.now() + deliveryDays * 86400000).toISOString().split('T')[0]
      const firstItem = items[0] || {}
      const brandStore = firstItem.seller_name || `${firstItem.name?.split(' ')[0] || 'Brand'} Official Flagship Store`
      const brandHub = firstItem.seller_hub || 'National Brand Logistics Hub'
      const externalSite = firstItem.source_site || 'ShopEase Direct'

      let fulfillmentMode = 'shopease_direct'
      let externalOrderId = null
      let externalReceiptUrl = firstItem.external_url || null
      let externalReceiptJson = null

      if (firstItem.seller_id) {
        try {
          const sRes = await client.query('SELECT store_webhook_url FROM sellers WHERE id = $1', [firstItem.seller_id])
          const webhookUrl = sRes.rows[0]?.store_webhook_url
          if (webhookUrl && /^https?:\/\//i.test(webhookUrl)) {
            const hookResp = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'shopease.order.created',
                orderNumber,
                customer: { name: userName, email: userEmail, phone: userPhone, address: shippingAddress },
                items,
                totalAmount,
                transactionId: txn,
              }),
            })
            if (hookResp.ok) {
              const hookData = await hookResp.json().catch(() => ({}))
              fulfillmentMode = 'partner_webhook'
              externalOrderId = hookData.externalOrderId || hookData.order_id || `EXT-${orderNumber}`
              externalReceiptUrl = hookData.receiptUrl || externalReceiptUrl
              externalReceiptJson = hookData
            }
          }
        } catch {}
      }

      const result = await client.query(
        `INSERT INTO orders
        (order_number, user_id, user_name, user_email, user_phone, shipping_address, items_summary, total_amount, delivery_date, status, payment_method, upi_id, transaction_id, payment_status, brand_store, brand_hub, invoice_number, tracking_stage, external_site, external_order_id, external_receipt_url, external_receipt_json, fulfillment_mode)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING id`,
        [
          orderNumber, userId, userName, userEmail, userPhone, shippingAddress,
          JSON.stringify(items), totalAmount, deliveryDate,
          fulfillmentMode === 'partner_webhook' ? 'Synced with Partner Store' : 'Confirmed with Brand Store',
          paymentMethod, upiId, txn, 'Completed', brandStore, brandHub, invoiceNumber, 2,
          externalSite, externalOrderId, externalReceiptUrl,
          externalReceiptJson ? JSON.stringify(externalReceiptJson) : null, fulfillmentMode,
        ]
      )
      return jsonResponse({
        success: true,
        message: fulfillmentMode === 'partner_webhook'
          ? `Order forwarded to partner store (${externalSite}) & receipt stored!`
          : 'Order confirmed & receipt stored in ShopEase!',
        order: {
          id: result.rows[0].id, orderNumber, userName, userEmail, totalAmount, deliveryDate,
          status: fulfillmentMode === 'partner_webhook' ? 'Synced with Partner Store' : 'Confirmed with Brand Store',
          paymentMethod, upiId, transactionId: txn, paymentStatus: 'Completed', brandStore, brandHub, invoiceNumber,
          trackingStage: 2, fulfillmentMode, externalSite, externalOrderId, externalReceiptUrl, items,
        },
      }, 201)
    }

    if (pathname === '/orders' && method === 'GET') {
      const userId = url.searchParams.get('userId')
      const result = userId
        ? await client.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId])
        : await client.query('SELECT * FROM orders ORDER BY created_at DESC')
      return jsonResponse({ total: result.rows.length, orders: result.rows })
    }

    // 7. PRODUCTS
    if (pathname === '/products' && method === 'GET') {
      const page = Math.max(1, parseInt(url.searchParams.get('page')) || 1)
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit')) || 24))
      const offset = (page - 1) * limit
      const category = url.searchParams.get('category')
      const brand = url.searchParams.get('brand')
      const search = url.searchParams.get('search')
      const sortBy = url.searchParams.get('sortBy')

      const conditions = ['(is_active IS NULL OR is_active = TRUE)']
      const params = []
      let idx = 1

      if (category && category !== 'All') {
        conditions.push(`category = $${idx++}`)
        params.push(category)
      }
      if (brand && brand !== 'All') {
        conditions.push(`brand = $${idx++}`)
        params.push(brand)
      }
      if (search && search.trim()) {
        conditions.push(`(name ILIKE $${idx} OR brand ILIKE $${idx} OR category ILIKE $${idx} OR seller_name ILIKE $${idx})`)
        params.push(`%${search.trim()}%`)
        idx++
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`
      let orderBy = 'ORDER BY id DESC'
      if (sortBy === 'featured') orderBy = "ORDER BY CASE WHEN source = 'seller' THEN 0 ELSE 1 END, id ASC"
      else if (sortBy === 'price_low') orderBy = 'ORDER BY price ASC'
      else if (sortBy === 'price_high') orderBy = 'ORDER BY price DESC'
      else if (sortBy === 'rating') orderBy = 'ORDER BY rating DESC'
      else if (sortBy === 'discount') orderBy = "ORDER BY CAST(REPLACE(discount, '% OFF', '') AS INTEGER) DESC"

      const countRes = await client.query(`SELECT COUNT(*) as count FROM products ${whereClause}`, params)
      const totalCount = parseInt(countRes.rows[0].count, 10)
      const dataRes = await client.query(
        `SELECT * FROM products ${whereClause} ${orderBy} LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
      )
      return jsonResponse({
        page, limit, totalCount, totalPages: Math.ceil(totalCount / limit), products: dataRes.rows,
      })
    }

    // 8. CATEGORIES & BRANDS
    if (pathname === '/categories' && method === 'GET') {
      const res = await client.query(
        'SELECT category, COUNT(*) as count FROM products WHERE (is_active IS NULL OR is_active = TRUE) GROUP BY category ORDER BY count DESC'
      )
      return jsonResponse(res.rows)
    }

    if (pathname === '/brands' && method === 'GET') {
      const category = url.searchParams.get('category')
      let q = 'SELECT brand, COUNT(*) as count FROM products WHERE (is_active IS NULL OR is_active = TRUE)'
      const params = []
      if (category && category !== 'All') {
        q += ' AND category = $1'
        params.push(category)
      }
      q += ' GROUP BY brand ORDER BY count DESC'
      const res = await client.query(q, params)
      return jsonResponse(res.rows)
    }

    // 9. UPI ACCOUNTS
    if (pathname === '/upi' && method === 'GET') {
      const userId = url.searchParams.get('userId')
      if (!userId) return jsonResponse({ error: 'userId is required' }, 400)
      const res = await client.query('SELECT * FROM upi_accounts WHERE user_id = $1 ORDER BY created_at DESC', [userId])
      return jsonResponse(res.rows)
    }

    if (pathname === '/upi' && method === 'POST') {
      const { userId, upiId, provider = 'Google Pay', accountName, phone, otpVerificationId } = await getBody(request)
      if (!userId || !upiId) return jsonResponse({ error: 'userId and upiId are required.' }, 400)
      const vpaCheck = isValidUpiVpa(upiId)
      if (!vpaCheck.valid) return jsonResponse({ error: vpaCheck.reason }, 400)
      const normalizedPhone = normalizePhone(phone)
      if (!normalizedPhone || !otpVerificationId) {
        return jsonResponse({ error: 'Phone OTP authentication is required before linking a UPI ID.' }, 400)
      }
      const otpProof = await client.query(
        `SELECT id FROM phone_otps WHERE id = $1 AND phone = $2 AND purpose = 'upi_verify' AND verified = TRUE AND created_at > NOW() - INTERVAL '30 minutes'`,
        [otpVerificationId, normalizedPhone]
      )
      if (otpProof.rows.length === 0) {
        return jsonResponse({ error: 'Phone OTP proof invalid or expired. Please verify your phone via OTP again.' }, 403)
      }
      const existing = await client.query(
        'SELECT id FROM upi_accounts WHERE user_id = $1 AND LOWER(upi_id) = $2',
        [userId, vpaCheck.normalized]
      )
      if (existing.rows.length > 0) {
        return jsonResponse({ error: 'This UPI ID is already connected to your account.' }, 409)
      }
      const res = await client.query(
        `INSERT INTO upi_accounts (user_id, upi_id, provider, account_name, is_verified, verified_phone, otp_verified_at)
         VALUES ($1,$2,$3,$4,true,$5,NOW()) RETURNING *`,
        [userId, vpaCheck.normalized, provider, accountName || 'Verified Account', normalizedPhone]
      )
      return jsonResponse({
        success: true,
        message: 'UPI ID verified via Phone OTP & linked successfully!',
        upiAccount: res.rows[0],
      }, 201)
    }

    const upiDeleteMatch = pathname.match(/^\/upi\/(\d+)$/)
    if (upiDeleteMatch && method === 'DELETE') {
      await client.query('DELETE FROM upi_accounts WHERE id = $1', [upiDeleteMatch[1]])
      return jsonResponse({ success: true, message: 'UPI account removed.' })
    }

    // 10. SELLER MARKETPLACE ROUTES
    if (pathname === '/seller/me' && method === 'GET') {
      const userId = url.searchParams.get('userId')
      const phone = url.searchParams.get('phone')
      if (!userId && !phone) return jsonResponse({ error: 'userId or phone is required' }, 400)

      const sellerRes = userId
        ? await client.query('SELECT * FROM sellers WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId])
        : await client.query('SELECT * FROM sellers WHERE phone = $1 ORDER BY created_at DESC LIMIT 1', [normalizePhone(phone)])

      if (sellerRes.rows.length === 0) {
        return jsonResponse({ registered: false, adminUpiId: ADMIN_PLATFORM_UPI, dailyFeePerItem: DAILY_FEE_PER_ITEM })
      }
      const seller = sellerRes.rows[0]
      const productsRes = await client.query('SELECT * FROM products WHERE seller_id = $1 ORDER BY id DESC', [seller.id])
      const activeCount = productsRes.rows.filter((p) => p.is_active !== false).length
      const dailyFeeDue = activeCount * DAILY_FEE_PER_ITEM
      const ledgerRes = await client.query('SELECT * FROM seller_fee_ledger WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 20', [seller.id])
      const paidRes = await client.query(
        "SELECT COALESCE(SUM(total_fee), 0) as paid_today FROM seller_fee_ledger WHERE seller_id = $1 AND billing_date = CURRENT_DATE AND payment_status = 'paid'",
        [seller.id]
      )
      const paidToday = parseInt(paidRes.rows[0].paid_today, 10) || 0

      return jsonResponse({
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
    }

    if (pathname === '/seller/register' && method === 'POST') {
      const { userId, storeName, ownerName, phone, email, gstin, cityHub, upiId, otpVerificationId } = await getBody(request)
      if (!storeName || !ownerName || !phone || !email || !cityHub || !upiId) {
        return jsonResponse({ error: 'All seller store fields are required.' }, 400)
      }
      const vpaCheck = isValidUpiVpa(upiId)
      if (!vpaCheck.valid) return jsonResponse({ error: vpaCheck.reason }, 400)
      const normalizedPhone = normalizePhone(phone)
      if (!normalizedPhone || !otpVerificationId) {
        return jsonResponse({ error: 'Phone OTP authentication is required to open a Seller Store.' }, 400)
      }
      const otpProof = await client.query(
        `SELECT id FROM phone_otps WHERE id = $1 AND phone = $2 AND purpose = 'seller_auth' AND verified = TRUE AND created_at > NOW() - INTERVAL '30 minutes'`,
        [otpVerificationId, normalizedPhone]
      )
      if (otpProof.rows.length === 0) {
        return jsonResponse({ error: 'Seller Phone OTP invalid or expired. Please verify OTP first.' }, 403)
      }
      const res = await client.query(
        `INSERT INTO sellers (user_id, store_name, owner_name, phone, email, gstin, city_hub, upi_id, phone_verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING *`,
        [userId || null, storeName.trim(), ownerName.trim(), normalizedPhone, email.trim(), gstin || 'UNREGISTERED', cityHub.trim(), vpaCheck.normalized]
      )
      return jsonResponse({
        success: true,
        message: 'Seller store verified via OTP & activated on ShopEase!',
        seller: res.rows[0],
        adminUpiId: ADMIN_PLATFORM_UPI,
        dailyFeePerItem: DAILY_FEE_PER_ITEM,
      }, 201)
    }

    if (pathname === '/seller/products' && method === 'POST') {
      const { sellerId, name, category, brand, price, originalPrice, image, stock = 25, deliveryDays = 2, keyFeature, warranty = '6 Months Seller Warranty' } = await getBody(request)
      if (!sellerId || !name || !category || !brand || !price || !image) {
        return jsonResponse({ error: 'Product name, category, brand, price, and original photo URL are required.' }, 400)
      }
      if (!/^https?:\/\/.+/i.test(image.trim())) {
        return jsonResponse({ error: 'Please provide a valid http/https product image URL.' }, 400)
      }
      const sellerRes = await client.query('SELECT * FROM sellers WHERE id = $1', [sellerId])
      if (sellerRes.rows.length === 0) return jsonResponse({ error: 'Seller account not found.' }, 404)
      const seller = sellerRes.rows[0]

      const numPrice = Math.round(Number(price))
      const numMrp = Math.max(numPrice, Math.round(Number(originalPrice) || numPrice * 1.2))
      const discountPct = Math.max(0, Math.round(((numMrp - numPrice) / numMrp) * 100))
      const groupPrice = Math.round((numPrice * 0.88) / 10) * 10
      const specs = {
        key_feature: keyFeature || `${brand} Verified Seller Listing`,
        warranty,
        ideal_for: `${category} Buyers`,
        gallery: [image.trim()],
        listed_via: 'Sell on ShopEase Portal',
      }

      const res = await client.query(
        `INSERT INTO products (
          name, category, brand, price, original_price, discount, rating, reviews_count,
          image, stock, delivery_days, badge, group_price, specs,
          seller_id, seller_name, seller_rating, seller_hub, seller_gstin, warranty_policy,
          is_brand_direct, source, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,4.6,1,$7,$8,$9,'Seller Verified',$10,$11,$12,$13,4.7,$14,$15,$16,false,'seller',true)
        RETURNING *`,
        [
          name.trim(), category.trim(), brand.trim(), numPrice, numMrp,
          discountPct > 0 ? `${discountPct}% OFF` : 'Direct Price',
          image.trim(), Math.max(1, parseInt(stock, 10) || 25), Math.max(1, parseInt(deliveryDays, 10) || 2),
          groupPrice, JSON.stringify(specs), seller.id, seller.store_name, seller.city_hub,
          seller.gstin || 'SELLER-VERIFIED', warranty,
        ]
      )
      return jsonResponse({
        success: true,
        message: 'Product published live to ShopEase! Daily app fee: ₹20/day for this item.',
        product: res.rows[0],
      }, 201)
    }

    const sellerProdMatch = pathname.match(/^\/seller\/products\/(\d+)$/)
    if (sellerProdMatch && method === 'PATCH') {
      const { isActive } = await getBody(request)
      const res = await client.query(
        'UPDATE products SET is_active = $1 WHERE id = $2 AND source = $3 RETURNING *',
        [Boolean(isActive), sellerProdMatch[1], 'seller']
      )
      if (res.rows.length === 0) return jsonResponse({ error: 'Seller product not found.' }, 404)
      return jsonResponse({ success: true, product: res.rows[0] })
    }

    if (sellerProdMatch && method === 'DELETE') {
      await client.query("DELETE FROM products WHERE id = $1 AND source = 'seller'", [sellerProdMatch[1]])
      return jsonResponse({ success: true, message: 'Product removed from ShopEase.' })
    }

    if (pathname === '/seller/pay-fee' && method === 'POST') {
      const { sellerId, transactionId, itemCount, totalFee } = await getBody(request)
      if (!sellerId || !transactionId || String(transactionId).trim().length < 6) {
        return jsonResponse({ error: 'Valid UPI Reference / UTR Transaction ID is required.' }, 400)
      }
      const activeRes = await client.query(
        'SELECT COUNT(*) as cnt FROM products WHERE seller_id = $1 AND (is_active IS NULL OR is_active = TRUE)',
        [sellerId]
      )
      const realCount = parseInt(activeRes.rows[0].cnt, 10) || itemCount || 1
      const computedFee = totalFee || realCount * DAILY_FEE_PER_ITEM
      const res = await client.query(
        `INSERT INTO seller_fee_ledger (seller_id, item_count, fee_per_item, total_fee, billing_date, admin_upi_id, payment_status, transaction_id)
         VALUES ($1,$2,$3,$4,CURRENT_DATE,$5,'paid',$6) RETURNING *`,
        [sellerId, realCount, DAILY_FEE_PER_ITEM, computedFee, ADMIN_PLATFORM_UPI, String(transactionId).trim()]
      )
      return jsonResponse({
        success: true,
        message: `₹${computedFee} daily app fee recorded to ShopEase UPI (${ADMIN_PLATFORM_UPI})!`,
        ledgerEntry: res.rows[0],
      }, 201)
    }

    if (pathname === '/seller/platform-revenue' && method === 'GET') {
      const [totals, sellersCount, itemsCount, recent] = await Promise.all([
        client.query("SELECT COALESCE(SUM(total_fee), 0) as total_collected, COALESCE(SUM(CASE WHEN billing_date = CURRENT_DATE THEN total_fee ELSE 0 END), 0) as today_collected FROM seller_fee_ledger WHERE payment_status = 'paid'"),
        client.query('SELECT COUNT(*) as cnt FROM sellers'),
        client.query("SELECT COUNT(*) as cnt FROM products WHERE source = 'seller' AND is_active = TRUE"),
        client.query(
          `SELECT l.*, s.store_name, s.upi_id as seller_upi
           FROM seller_fee_ledger l LEFT JOIN sellers s ON s.id = l.seller_id
           ORDER BY l.created_at DESC LIMIT 15`
        ),
      ])
      return jsonResponse({
        adminUpiId: ADMIN_PLATFORM_UPI,
        dailyFeePerItem: DAILY_FEE_PER_ITEM,
        totalCollected: parseInt(totals.rows[0].total_collected, 10) || 0,
        todayCollected: parseInt(totals.rows[0].today_collected, 10) || 0,
        totalSellers: parseInt(sellersCount.rows[0].cnt, 10) || 0,
        activeSellerItems: parseInt(itemsCount.rows[0].cnt, 10) || 0,
        projectedDailyRevenue: (parseInt(itemsCount.rows[0].cnt, 10) || 0) * DAILY_FEE_PER_ITEM,
        recentLedger: recent.rows,
      })
    }

    if (pathname === '/bridge/redirect' && method === 'POST') {
      const { userId = null, productId = null, sourceSite = 'Partner Store', targetUrl, actionType = 'view_store' } = await getBody(request)
      if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        return jsonResponse({ error: 'Valid target store URL is required.' }, 400)
      }
      await client.query(
        `INSERT INTO external_redirects (user_id, product_id, source_site, target_url, action_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, productId, sourceSite, targetUrl, actionType]
      )
      return jsonResponse({ success: true, redirectUrl: targetUrl, sourceSite, actionType })
    }

    if (pathname === '/orders/sync-external' && method === 'POST') {
      const {
        userId, userName = 'ShopEase Customer', userEmail = '', userPhone = '',
        shippingAddress = 'Delivered via Partner Store', externalSite, externalOrderId,
        productName, totalAmount, externalReceiptUrl = '', paymentMethod = 'Partner Store Checkout',
      } = await getBody(request)
      if (!userId || !externalSite || !externalOrderId || !productName || !totalAmount) {
        return jsonResponse({ error: 'Store name, External Order ID, Product name, and Total amount are required.' }, 400)
      }
      const orderNumber = `EXT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
      const invoiceNumber = `REC-${Date.now().toString().slice(-7)}`
      const deliveryDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
      const items = [{ name: productName.trim(), price: Number(totalAmount), quantity: 1, seller_name: externalSite.trim() }]
      const receiptPayload = { externalSite: externalSite.trim(), externalOrderId: externalOrderId.trim(), externalReceiptUrl: externalReceiptUrl.trim() || null, syncedAt: new Date().toISOString() }
      const result = await client.query(
        `INSERT INTO orders
        (order_number, user_id, user_name, user_email, user_phone, shipping_address, items_summary, total_amount, delivery_date, status, payment_method, transaction_id, payment_status, brand_store, brand_hub, invoice_number, tracking_stage, external_site, external_order_id, external_receipt_url, external_receipt_json, fulfillment_mode)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
        [
          orderNumber, userId, userName, userEmail, userPhone, shippingAddress,
          JSON.stringify(items), Number(totalAmount), deliveryDate, `Synced Receipt (${externalSite.trim()})`,
          paymentMethod, externalOrderId.trim(), 'Completed', externalSite.trim(), `${externalSite.trim()} Partner Fulfillment`,
          invoiceNumber, 2, externalSite.trim(), externalOrderId.trim(), externalReceiptUrl.trim() || null,
          JSON.stringify(receiptPayload), 'external_redirect_synced',
        ]
      )
      return jsonResponse({
        success: true,
        message: `External order receipt (${externalOrderId}) from ${externalSite} archived in ShopEase!`,
        order: result.rows[0],
      }, 201)
    }

    if (pathname === '/catalog/sync-shopify' && method === 'POST') {
      const { storeDomain, category = 'Fashion', limit = 25 } = await getBody(request)
      if (!storeDomain) return jsonResponse({ error: 'storeDomain is required.' }, 400)
      const host = storeDomain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '')
      const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 25))
      const resp = await fetch(`https://${host}/products.json?limit=${safeLimit}`, { headers: { 'User-Agent': 'ShopEasePartnerSync/1.0' } })
      if (!resp.ok) return jsonResponse({ error: `Store "${host}" did not expose Shopify /products.json (HTTP ${resp.status}).` }, 400)
      const data = await resp.json()
      const items = Array.isArray(data.products) ? data.products : []
      let insertedCount = 0
      for (const p of items) {
        const img = p.images?.[0]?.src
        const variant = p.variants?.[0]
        if (!img || !variant || !p.title) continue
        const existing = await client.query('SELECT id FROM products WHERE external_id = $1 LIMIT 1', [`SH-${host}-${p.id}`])
        if (existing.rows.length > 0) continue
        const usdOrNative = Number(variant.price) || 19.99
        const inrPrice = usdOrNative < 250 ? Math.round(usdOrNative * 84) : Math.round(usdOrNative)
        const mrp = Math.round(inrPrice * 1.18)
        const specs = {
          key_feature: (p.body_html || `${p.vendor || host} Official Product`).replace(/<[^>]+>/g, '').trim().slice(0, 140),
          warranty: 'Official Brand Guarantee',
          ideal_for: p.product_type || category,
          gallery: (p.images || []).slice(0, 4).map((i) => i.src),
        }
        await client.query(
          `INSERT INTO products (
            name, category, brand, price, original_price, discount, rating, reviews_count,
            image, stock, delivery_days, badge, group_price, specs,
            seller_name, seller_rating, seller_hub, seller_gstin, warranty_policy, is_brand_direct,
            source, is_active, source_site, external_url, external_cart_url, external_id
          ) VALUES ($1,$2,$3,$4,$5,$6,4.7,120,$7,35,2,'Live Partner',$8,$9,$10,4.8,$11,'PARTNER-SYNC','Official Brand Warranty',true,'catalog',true,$12,$13,$14,$15)`,
          [
            p.title.trim(), category, (p.vendor || host.split('.')[0]).trim(), inrPrice, mrp, '15% OFF',
            img, Math.round((inrPrice * 0.88) / 10) * 10, JSON.stringify(specs),
            `${p.vendor || host} Official Store`, `${host} Partner Hub`, host,
            `https://${host}/products/${p.handle}`, `https://${host}/cart/${variant.id}:1`, `SH-${host}-${p.id}`,
          ]
        )
        insertedCount++
      }
      return jsonResponse({ success: true, store: host, imported: insertedCount, message: `Synced ${insertedCount} real products from ${host}!` })
    }

    return jsonResponse({ error: `Route ${method} /api${pathname} not found.` }, 404)
  } catch (err) {
    console.error('Cloudflare Worker API Error:', err)
    return jsonResponse({ error: err.message || 'Internal Server Error' }, 500)
  } finally {
    try {
      await client.end()
    } catch {}
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleApiRequest(request, env, ctx)
  },
}
