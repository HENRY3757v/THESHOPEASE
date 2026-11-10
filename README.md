# 🛍️ ShopEase (TheShopEase) - Next-Gen Full-Stack E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-theshopease--five.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://theshopease-five.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/HENRY3757v/THESHOPEASE)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Tailwind%20CSS-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

A modern, high-performance E-Commerce platform built for the Indian market, inspired by Amazon & Flipkart with market-first innovative social commerce features like **Live VS Spec Comparison Mode** and **Dosti Deal (Group Buying)**.

---

## 🌐 Live Deployment

- **Official Live Website:** [https://theshopease-five.vercel.app/](https://theshopease-five.vercel.app/)
- **Live API Endpoint:** [https://theshopease-five.vercel.app/api/products](https://theshopease-five.vercel.app/api/products)
- **Database Engine:** Supabase Managed PostgreSQL Cloud Database

---

## 🌟 Key & Innovative Features

### 1. ⚔️ VS Spec Comparison Mode (Market First)
- Compare up to 3 products side-by-side in real-time.
- View structured comparisons across technical specifications, battery life, warranty, key highlights, and form factor.
- Floating comparison dock allows frictionless browsing while accumulating comparison items.

### 2. 🤝 Dosti Deal (Social Group Buying Model)
- Instant **12% extra discount** when purchasing together with a friend.
- Generates 1-click **WhatsApp invite links** with auto-filled product specifications and deal breakdown.
- Built-in timer and friend slot verification to simulate real-time group-saving dynamics.

### 3. 🚚 Cinematic Delivery Welcome Animation
- Interactive delivery truck sequence with real-time dispatch checklist upon user registration and login.
- Smooth CSS animations verifying pin code, logistics fulfillment center, and doorstep delivery ETA.

### 4. 📦 2,400+ Authentic Indian Market Catalog
- 8 high-demand categories: **Mobiles**, **Laptops**, **Home & Kitchen**, **Electronics**, **Footwear**, **Watches**, **Gaming**, and **Fashion**.
- Real brands: Apple, Samsung, Vivo, OnePlus, Prestige, Hawkins, Philips, Nike, Adidas, Sony, boAt, Casio, Titan, etc.
- Distinct model-specific imagery and realistic Indian retail market pricing.

### 5. 🔐 Relational PostgreSQL Architecture
- Full user authentication with secure password hashing (`bcryptjs`).
- Complete checkout flow: cart drawer, delivery tracking date calculation (1-3 days), and persistent order history linked to user accounts.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Tailwind CSS v4, Lucide Icons, Vite |
| **Backend** | Node.js, Express.js (Hybrid: Serverless on Vercel + Standalone Express) |
| **Database** | PostgreSQL (Supabase Cloud Pooler) & Local MySQL support |
| **Deployment** | Vercel (Frontend & Serverless API), Supabase (Managed Cloud DB) |

---

## 📁 Project Architecture

```
THESHOPEASE/
├── shopify-app/              # React 19 + Tailwind Frontend
│   ├── src/
│   │   ├── components/       # CompareModal, DostiDealModal, DeliveryAnimation
│   │   ├── pages/            # Shop, Login, Register, Orders, UsersList
│   │   ├── config.js         # Intelligent dynamic API resolution
│   │   ├── App.jsx           # Client-side router configuration
│   │   └── main.jsx
│   ├── api/                  # Vercel Serverless API Bridge
│   │   └── index.js
│   ├── vercel.json           # SPA rewrites & serverless routing rules
│   └── package.json
│
├── shopify-backend/          # Node.js + Express Dedicated Backend
│   ├── server.js             # REST API (Auth, Products, Orders, Categories)
│   ├── init_supabase_tables.js # Database migration script
│   ├── seed_supabase.js      # Cloud PostgreSQL seeding engine
│   └── package.json
│
├── database/                 # Schema definitions
│   ├── schema.sql            # Users schema
│   └── orders_schema.sql     # Orders schema
│
├── package.json              # Root entrypoint configuration
└── README.md                 # Complete project documentation
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Paginated product catalog with category, brand, search, and sorting |
| `GET` | `/api/categories`| All available categories with live product count |
| `GET` | `/api/brands` | Brands filtered by selected category |
| `POST`| `/api/register` | Register new user with hashed password |
| `POST`| `/api/login` | Authenticate user credentials |
| `GET` | `/api/orders` | Fetch orders for user with delivery date |
| `POST`| `/api/orders` | Create new checkout order with delivery tracking |

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/HENRY3757v/THESHOPEASE.git
cd THESHOPEASE
```

### 2. Run Backend
```bash
cd shopify-backend
npm install
node server.js
```
*Backend runs on `http://localhost:5000`.*

### 3. Run Frontend
```bash
cd ../shopify-app
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 👨‍💻 Author & Credits

- **Developer:** Suvradip Dey ([@HENRY3757v](https://github.com/HENRY3757v))
- **Repository:** [https://github.com/HENRY3757v/THESHOPEASE](https://github.com/HENRY3757v/THESHOPEASE)
- **Live URL:** [https://theshopease-five.vercel.app](https://theshopease-five.vercel.app)
