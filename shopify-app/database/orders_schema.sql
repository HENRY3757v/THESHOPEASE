-- ===================================================
-- Orders Table Schema: Linked to Users
-- ===================================================

USE shopify_db;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    items_summary JSON NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Placed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================================================
-- Verification Queries
-- ===================================================
-- DESCRIBE orders;
-- SELECT * FROM orders;
