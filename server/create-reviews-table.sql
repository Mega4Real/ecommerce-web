-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE
    SET NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (
            rating >= 1
            AND rating <= 5
        ),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Add average rating and review count to products if needed, 
-- or calculate on the fly. For now, we calculate on the fly.