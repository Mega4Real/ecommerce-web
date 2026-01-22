-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  images TEXT[], -- Array of image URLs
  sizes TEXT[], -- Array of sizes
  new_arrival BOOLEAN DEFAULT false,
  sold BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  items JSONB NOT NULL, -- Store items as JSON
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, category, price, original_price, images, sizes, new_arrival, description) VALUES
('Classic Silk Evening Dress', 'Dresses', 1200.00, 1500.00, ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'], ARRAY['S', 'M', 'L', 'XL'], true, 'Elegant silk dress perfect for evening occasions.'),
('Tailored Linen Blazer', 'Tops', 850.00, NULL, ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80'], ARRAY['M', 'L', 'XL'], true, 'Sharp and breathable linen blazer for summer.')
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO orders (customer_name, customer_email, items, total, status) VALUES
('John Doe', 'john@example.com', '[{"productId": 1, "name": "Classic Silk Evening Dress", "quantity": 1, "price": 1200}]', 1200.00, 'pending'),
('Jane Smith', 'jane@example.com', '[{"productId": 2, "name": "Tailored Linen Blazer", "quantity": 2, "price": 850}]', 1700.00, 'processing')
ON CONFLICT DO NOTHING;