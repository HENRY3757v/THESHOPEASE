import pg from 'pg'
const { Pool } = pg

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.shaxsnjcircagqdggbwg:LEODAS8777%40@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  console.log('🔄 Updating Supabase Database with UPI Tables & Order Payment details...')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Create UPI accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS upi_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        upi_id VARCHAR(100) NOT NULL,
        provider VARCHAR(50) DEFAULT 'UPI',
        account_name VARCHAR(150),
        is_verified BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ "upi_accounts" table created/verified')

    // 2. Add payment columns to orders table
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'UPI';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Completed';
    `)
    console.log('✅ "orders" table columns updated with UPI & transaction fields')

    await client.query('COMMIT')
    console.log('🎉 Database migration for UPI completed successfully!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration failed:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
