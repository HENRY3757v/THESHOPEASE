# ShopEase - Full Stack E-Commerce Platform 🛍️

A modern, high-performance E-Commerce platform built with **React**, **Tailwind CSS**, **Node.js (Express)**, and **MySQL Database**. Featuring a catalog of **10,000+ authentic Indian market products** and market-first innovative features like **1-Click Live Spec Comparison (VS Mode)** and **Dosti Deal (Group Buying)**.

---

## 🌟 Key Features

1. **Massive 10,000+ Live Database Catalog:**
   - Real-world authentic pricing across Mobiles, Laptops, Kitchenware, Footwear, Electronics, Watches, Gaming & Fashion.
   - Genuine Indian market brands: Apple, Samsung, Vivo, OnePlus, Prestige, Hawkins, Philips, Nike, Adidas, Sony, boAt, Casio, Titan, etc.

2. **1-Click Live Spec Comparison ("VS Mode"):**
   - Compare up to 3 products side-by-side with structured technical specs, key features, battery, and warranty.

3. **Dosti Deal ("Group Buying" Model):**
   - Save an extra 12% by buying with a friend. Includes 1-click WhatsApp invite generation and slot countdowns.

4. **Cinematic Delivery Welcome Animation:**
   - Animated delivery truck and logistics hub verification upon user login and registration.

5. **Relational MySQL Architecture:**
   - User authentication with hashed passwords (`bcryptjs`).
   - Order placement directly linking customer details, items ordered, and estimated delivery dates.

---

## 📁 Project Structure

```
├── shopify-app/              # React + Vite Frontend (Tailwind CSS)
│   ├── src/
│   │   ├── components/       # CompareModal, DostiDealModal, DeliveryAnimation
│   │   ├── pages/            # Shop, Login, Register, Orders, UsersList
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── shopify-backend/          # Node.js + Express API Server
│   ├── server.js             # REST API Endpoints (Auth, Products, Orders)
│   ├── seedUltimateCatalog.js# 10,000 Products Seeding Engine
│   └── package.json
│
└── database/                 # MySQL Database Schemas
    ├── schema.sql            # Users schema
    └── orders_schema.sql     # Orders schema
```

---

## 🚀 Quick Setup & Run Locally

### 1. Database Setup
Make sure MySQL Server is running on port `3306`:
```sql
CREATE DATABASE shopify_db;
-- Run schemas in database/schema.sql and database/orders_schema.sql
```

### 2. Backend Setup
```bash
cd shopify-backend
npm install
node seedUltimateCatalogWithDostiAndCompare.js   # Seeds 10,000 products
node server.js                                  # Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd shopify-app
npm install
npm run dev                                     # Runs on http://localhost:5173
```
