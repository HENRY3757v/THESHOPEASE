# ShopEase — Team Update & Architecture Brief

**Live Application:** https://theshopease-five.vercel.app/  
**Seller Marketplace Portal:** https://theshopease-five.vercel.app/seller  
**GitHub Repository:** https://github.com/HENRY3757v/THESHOPEASE  

---

## 1. Current Project Status (What Is Live Today)

ShopEase has evolved from a college mini-project hosting prototype into a full-stack multi-vendor e-commerce platform and revenue-ready affiliate bridge powered by **React 19 + Vite + Tailwind CSS v4**, **Vercel / Cloudflare Serverless APIs**, and **Supabase PostgreSQL**:

- **429+ Verified Real Products** across **14 Categories** (every item verified via HTTP `HEAD` check with unique original product photos, Indian INR pricing, multi-image galleries, No-Cost EMI & UPI cashback widgets, and customer rating splits).
- **Real Phone OTP Authentication & NPCI UPI Validation:** 6-digit SHA-256 hashed OTP verification (5-min expiry, max 5 attempts) required before linking UPI VPAs (30+ NPCI handles) or registering a seller store. Supports Fast2SMS / Twilio live SMS via environment variables (currently active in Sandbox testing mode).
- **Seller Marketplace Portal (`/seller`) — ₹20/Item/Day Revenue Model:** Local & D2C sellers onboard via OTP, publish/manage items, and pay a ₹20/active-item/day platform fee via UPI QR directly to the Admin Platform UPI, tracked in `seller_fee_ledger`.
- **Partner Website Bridge & Receipt Sync:** Every product links to its source brand/partner store (`source_site`, `external_url`), logs affiliate redirects (`/api/bridge/redirect`), forwards orders automatically to sellers who configure a webhook (`store_webhook_url`), and lets buyers archive external order IDs & receipts in ShopEase (`/api/orders/sync-external`) alongside printable GST Tax Invoices.
- **Cloudflare Workers / Pages Ready:** Dual serverless backend support via `shopify-app/api/index.js` (Vercel) and `shopify-app/cloudflare-worker.js` (Cloudflare Workers with `nodejs_compat`).

---

## 2. How Amazon Associates India Fits Into ShopEase (For Team Members)

### Step A — Immediate Commission Tracking (Sign-up Day 1)
1. Register on **Amazon Associates India** (`https://affiliate-program.amazon.in/`) using our live site URL (`https://theshopease-five.vercel.app/`).
2. Copy our **Partner Tag / Store ID** (e.g., `shopease-21`).
3. Add `AMAZON_PARTNER_TAG` in Vercel / Cloudflare Environment Variables.
4. Every user who clicks **"Visit Original Store Website"** on ShopEase and purchases on Amazon India earns us **1%–10% affiliate commission** with zero inventory or shipping overhead.

### Step B — Amazon PA-API / Creators API Live Catalog Unlock
- Amazon unlocks **PA-API / Creators API** credentials after initial qualifying sales (typically 3–10 orders in 30 days) in Associates Central → Tools → Product Advertising API / Creators API.
- Once unlocked, ShopEase backend can fetch real-time Amazon India catalog items, live prices, ASINs, and generate direct Amazon Cart-Add URLs (`https://www.amazon.in/gp/aws/cart/add.html?ASIN.1=...&AssociateTag=...`).

### Important Technical Boundary
- Third-party marketplaces (Amazon, Flipkart, Myntra) do **not** allow external backends to silently log into buyer sessions or auto-place orders without buyer 2FA/UPI PIN authorization.
- Therefore:
  - **ShopEase Direct / Seller items** complete 100% natively inside ShopEase with UPI checkout & Tax Invoice generation.
  - **External Partner items** redirect cleanly to the official store with affiliate tracking, and buyers can save their external Order ID/Receipt back into ShopEase Orders.

---

## 3. Team Action Items

1. Create an **Amazon Associates India** account and collect our `AMAZON_PARTNER_TAG`.
2. Complete initial qualifying affiliate orders to unlock Amazon PA-API / Creators API keys.
3. Optional for production scale: configure `FAST2SMS_API_KEY` (with DLT) or `TWILIO_*` keys in Vercel Environment Variables for live mobile SMS OTP delivery.
4. Onboard test/local sellers on `/seller` and verify ₹20/item/day UPI fee ledger entries.
