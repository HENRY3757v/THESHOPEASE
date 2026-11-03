-- ===================================================
-- E-Commerce Database Schema: shopify_db
-- ===================================================

-- 1. Create database if it does not already exist
CREATE DATABASE IF NOT EXISTS shopify_db;

-- 2. Select the database
USE shopify_db;

-- 3. Create the users table
-- Stores registration info: name, email, phone, address, and password
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===================================================
-- Verification Queries (Optional to test after running)
-- ===================================================
-- SHOW TABLES;
-- DESCRIBE users;
-- SELECT id, name, email, phone, address, created_at FROM users;
