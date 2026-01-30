-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  images TEXT [],
  -- Array of image URLs
  sizes TEXT [],
  -- Array of sizes
  new_arrival BOOLEAN DEFAULT false,
  sold BOOLEAN DEFAULT false,
  description TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  min_quantity INTEGER DEFAULT 0,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  user_id INTEGER REFERENCES users(id),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_region VARCHAR(100),
  order_number VARCHAR(20) UNIQUE,
  discount_code VARCHAR(50),
  discount_amount DECIMAL(10, 2),
  payment_reference VARCHAR(255),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert sample products
INSERT INTO products (
    name,
    category,
    price,
    original_price,
    images,
    sizes,
    new_arrival,
    description
  )
VALUES (
    'Classic Silk Evening Dress',
    'Dresses',
    1200.00,
    1500.00,
    ARRAY ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'],
    ARRAY ['S', 'M', 'L', 'XL'],
    true,
    'Elegant silk dress perfect for evening occasions.'
  ),
  (
    'Tailored Linen Blazer',
    'Tops',
    850.00,
    NULL,
    ARRAY ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'],
    ARRAY ['M', 'L', 'XL'],
    true,
    'Sharp and breathable linen blazer for summer.'
  ) ON CONFLICT DO NOTHING;
-- Insert sample orders
INSERT INTO orders (
    customer_name,
    customer_email,
    items,
    total,
    status
  )
VALUES (
    'John Doe',
    'john@example.com',
    '[{"productId": 1, "name": "Classic Silk Evening Dress", "quantity": 1, "price": 1200}]',
    1200.00,
    'pending'
  ),
  (
    'Jane Smith',
    'jane@example.com',
    '[{"productId": 2, "name": "Tailored Linen Blazer", "quantity": 2, "price": 850}]',
    1700.00,
    'processing'
  ) ON CONFLICT DO NOTHING;