# Database Setup for ShopEase

## Files
- `schema.sql`: Contains the SQL commands to create the `shopify_db` database and `users` table.

## How to Run in MySQL Workbench:
1. Open MySQL Workbench and connect to your local MySQL instance.
2. Click **File -> Open SQL Script...** (or press `Ctrl + O`).
3. Select `schema.sql`.
4. Click the yellow lightning bolt icon ⚡ (or press `Ctrl + Shift + Enter`) to execute the entire script.

## Table Structure (`users`):
- `id`: Unique Auto-incrementing User ID (Primary Key)
- `name`: User's full name
- `email`: User's email (Unique index)
- `phone`: User's contact phone number
- `address`: User's shipping / billing address
- `password`: Encrypted/hashed password
- `created_at`: Timestamp when registration occurred
- `updated_at`: Timestamp of latest profile update
