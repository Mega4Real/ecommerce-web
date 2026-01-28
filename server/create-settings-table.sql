-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    store_name VARCHAR(255) DEFAULT 'My E-commerce Store',
    contact_email VARCHAR(255) DEFAULT 'contact@example.com',
    contact_phone VARCHAR(50),
    address TEXT,
    currency VARCHAR(10) DEFAULT 'GHS',
    announcement_text TEXT,
    announcement_bar_enabled BOOLEAN DEFAULT true,
    social_facebook VARCHAR(255),
    social_instagram VARCHAR(255),
    social_twitter VARCHAR(255),
    social_snapchat VARCHAR(255),
    social_tiktok VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert default settings if they don't exist
INSERT INTO settings (id)
VALUES (1) ON CONFLICT (id) DO NOTHING;