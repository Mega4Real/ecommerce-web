const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const pool = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: [
    'https://ecommerce-web-3tg8.vercel.app',
    'http://localhost:5173' // for local development
  ]
}));
app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs for auth routes
  message: { error: 'Too many attempts, please try again later' }
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 order creations per hour
  message: { error: 'Order limit reached, please contact support if this is an error' }
});

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, hashedPassword, fullName, 'customer']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.full_name,
        role: user.role 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// --- User/Customer Routes ---

// Get all users (Admin only)
app.get('/api/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.full_name as name, 
        u.role, 
        u.created_at,
        COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name as name, role FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders for a specific user (Admin only)
app.get('/api/users/:id/orders', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a user (Admin only)
app.get('/api/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  // Check if user exists (placeholder for future use if needed)
});

app.delete('/api/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent deleting itself or another admin (safety)
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (userCheck.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }

    // Detach orders (set user_id to NULL)
    await pool.query('UPDATE orders SET user_id = NULL WHERE user_id = $1', [userId]);

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'User deleted and orders detached successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Product Routes ---
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY position ASC, id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add new product (Admin only)
app.post('/api/products', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, category, price, originalPrice, images, sizes, newArrival, description } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, category, price, original_price, images, sizes, new_arrival, description) VALUES ($1, $2, $3, $4, $5::text[], $6::text[], $7, $8) RETURNING *',
      [name, category, price, originalPrice, images, sizes, newArrival, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category, price, originalPrice, images, sizes, newArrival, description } = req.body;
    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, price = $3, original_price = $4, images = $5::text[], sizes = $6::text[], new_arrival = $7, description = $8 WHERE id = $9 RETURNING *',
      [name, category, price, originalPrice, images, sizes, newArrival, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Mark product as sold (Admin only)
app.patch('/api/products/:id/sold', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      'UPDATE products SET sold = NOT sold WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Reorder products (Admin only)
app.patch('/api/products/reorder', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { products } = req.body; // Array of {id, position}
    
    // Update each product's position
    for (const product of products) {
      await pool.query(
        'UPDATE products SET position = $1 WHERE id = $2',
        [product.position, product.id]
      );
    }
    
    res.json({ message: 'Product order updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Order Routes ---

// Get all orders (Admin only)
app.get('/api/orders', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get orders for the logged-in user
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new order
app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, total, shippingAddress, shippingCity, shippingRegion } = req.body;
    
    // Basic validation
    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Invalid order total' });
    }

    // Check if user is logged in (optional for guest checkout)
    let userId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Just proceed as guest if token is invalid
        console.log('Invalid token provided for order, proceeding as guest');
      }
    }

    // Generate Secure Order Number: LX + YYYYMMDD + 6 Secure Hex Chars
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    const orderNumber = `LX${dateStr}${randomSuffix}`;

    const result = await pool.query(
      'INSERT INTO orders (customer_name, customer_email, customer_phone, items, total, status, user_id, shipping_address, shipping_city, shipping_region, order_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [customerName, customerEmail, customerPhone, items, total, 'pending', userId, shippingAddress, shippingCity, shippingRegion, orderNumber]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update order status (Admin only)
app.patch('/api/orders/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete an order (Admin only)
app.delete('/api/orders/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Track order by order number (secured with email verification)
app.get('/api/orders/track/:orderNumber', async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    const customerEmail = req.query.email;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Email verification required to track order' });
    }

    const cleanOrderNumber = orderNumber.trim();
    const cleanEmail = customerEmail.trim().toLowerCase();

    const result = await pool.query(
      'SELECT order_number, customer_name, customer_email, customer_phone, total, status, created_at, items, shipping_address, shipping_city, shipping_region FROM orders WHERE order_number = $1 AND LOWER(customer_email) = $2',
      [cleanOrderNumber, cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or email mismatch' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Wishlist Routes ---

// Get user's wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.* FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add product to wishlist
app.post('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const productCheck = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    // Add to wishlist
    const result = await pool.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, productId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Remove product from wishlist
app.delete('/api/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [req.user.id, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in wishlist' });
    }

    res.json({ message: 'Product removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
