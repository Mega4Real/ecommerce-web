const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const pool = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://ecommerce-web-3tg8.vercel.app',
      process.env.CLIENT_URL
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

// Middleware to verify JWT (User/Customer)
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware to verify JWT (Admin)
const authenticateAdminToken = (req, res, next) => {
  const token = req.cookies.adminToken || (req.headers['admin-authorization'] && req.headers['admin-authorization'].split(' ')[1]);
  
  console.log('[AUTH DEBUG] Admin auth check:', {
    hasCookie: !!req.cookies.adminToken,
    hasHeader: !!req.headers['admin-authorization'],
    cookieKeys: Object.keys(req.cookies),
    origin: req.headers.origin,
    referer: req.headers.referer
  });
  
  if (!token) {
    console.log('[AUTH ERROR] No admin token found');
    return res.status(401).json({ error: 'Admin access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[AUTH ERROR] Invalid admin token:', err.message);
      return res.status(403).json({ error: 'Invalid admin token' });
    }
    if (user.role !== 'admin') {
      console.log('[AUTH ERROR] User is not admin:', user.role);
      return res.status(403).json({ error: 'Admin access required' });
    }
    console.log('[AUTH SUCCESS] Admin authenticated:', user.id);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

// Register
app.post('/api/auth/register', [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[a-zA-Z]/).withMessage('Password must contain a letter'),
  body('fullName').trim().notEmpty().withMessage('Full name is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

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
    
    // Set HttpOnly cookie based on role
    const cookieName = user.role === 'admin' ? 'adminToken' : 'token';
    
    // Cookie configuration for cross-device compatibility
    const isDevelopment = process.env.NODE_ENV === 'development';
    const cookieOptions = {
      httpOnly: true,
      secure: !isDevelopment, 
      sameSite: isDevelopment ? 'lax' : 'none', // Use 'none' for production cross-origin
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };
    
    res.cookie(cookieName, token, cookieOptions);
    
    console.log(`[AUTH] ${user.role} login successful - Cookie set:`, {
      name: cookieName,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      origin: req.headers.origin
    });

    res.json({ 
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

// Logout (User)
app.post('/api/auth/logout', (req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.clearCookie('token', {
    httpOnly: true,
    secure: !isDevelopment, 
    sameSite: isDevelopment ? 'lax' : 'none',
    path: '/'
  });
  console.log('[AUTH] User logout - Cookie cleared: token');
  res.json({ message: 'Logged out successfully' });
});

// Logout (Admin)
app.post('/api/auth/admin/logout', (req, res) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: !isDevelopment, 
    sameSite: isDevelopment ? 'lax' : 'none',
    path: '/'
  });
  console.log('[AUTH] Admin logout - Cookie cleared: adminToken');
  res.json({ message: 'Admin logged out successfully' });
});

// Get current user (Customer)
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

// Get current admin
app.get('/api/auth/admin/me', authenticateAdminToken, async (req, res) => {
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

// --- User/Customer Routes ---

// Get all users (Admin only)
app.get('/api/users', authenticateAdminToken, async (req, res) => {
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

// Get all orders for a specific user (Admin only)
app.get('/api/users/:id/orders', authenticateAdminToken, async (req, res) => {
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
app.get('/api/users/:id', authenticateAdminToken, async (req, res) => {
  // Check if user exists (placeholder for future use if needed)
});

app.delete('/api/users/:id', authenticateAdminToken, async (req, res) => {
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
app.post('/api/products', authenticateAdminToken, async (req, res) => {
  try {
    const { name, category, price, originalPrice, images, sizes, newArrival, description, stock_quantity } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, category, price, original_price, images, sizes, new_arrival, description, stock_quantity) VALUES ($1, $2, $3, $4, $5::text[], $6::text[], $7, $8, $9) RETURNING *',
      [name, category, price, originalPrice, images, sizes, newArrival, description, stock_quantity || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update product (Admin only)
app.put('/api/products/:id', authenticateAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category, price, originalPrice, images, sizes, newArrival, description, stock_quantity } = req.body;
    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, price = $3, original_price = $4, images = $5::text[], sizes = $6::text[], new_arrival = $7, description = $8, stock_quantity = $9 WHERE id = $10 RETURNING *',
      [name, category, price, originalPrice, images, sizes, newArrival, description, stock_quantity, id]
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
app.delete('/api/products/:id', authenticateAdminToken, async (req, res) => {
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
app.patch('/api/products/:id/sold', authenticateAdminToken, async (req, res) => {
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
app.patch('/api/products/reorder', authenticateAdminToken, async (req, res) => {
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
app.get('/api/orders', authenticateAdminToken, async (req, res) => {
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
    const { customerName, customerEmail, customerPhone, items, total, shippingAddress, shippingCity, shippingRegion, discountCode, discountAmount } = req.body;
    
    // Basic validation
    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Invalid order total' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    // Check if user is logged in using the same logic as authenticateToken
    let userId = null;
    const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        console.log(`Order placement: Identified user ID ${userId}`);
      } catch (err) {
        console.log('Invalid token provided for order, proceeding as guest');
      }
    }

    // Generate Secure Order Number: LX + YYYYMMDD + 6 Secure Hex Chars
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    const orderNumber = `LX${dateStr}${randomSuffix}`;

    const itemsJson = JSON.stringify(items);

    // Use a transaction for order creation and stock update
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'INSERT INTO orders (customer_name, customer_email, customer_phone, items, total, status, user_id, shipping_address, shipping_city, shipping_region, order_number, discount_code, discount_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
        [customerName, customerEmail, customerPhone, itemsJson, total, 'pending', userId, shippingAddress, shippingCity, shippingRegion, orderNumber, discountCode, discountAmount]
      );

      // Inventory management: Decrease stock_quantity for each item
      for (const item of items) {
        if (item.productId) {
          // Decrease quantity
          const updateResult = await client.query(
            'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2 RETURNING stock_quantity',
            [item.quantity || 1, item.productId]
          );

          // If quantity is now 0, mark as sold
          if (updateResult.rows.length > 0 && updateResult.rows[0].stock_quantity === 0) {
            await client.query('UPDATE products SET sold = true WHERE id = $1', [item.productId]);
          }
        }
      }

      await client.query('COMMIT');

      // Increment discount usage count if applicable (not part of main transaction to avoid blocking)
      if (discountCode) {
        try {
          await pool.query('UPDATE discounts SET used_count = used_count + 1 WHERE code = $1', [discountCode.toUpperCase()]);
        } catch (discErr) {
          console.error('Failed to update discount usage count:', discErr);
        }
      }

      console.log(`Order created successfully: ${orderNumber}`);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('CRITICAL: Order placement failed:', err);
    res.status(500).json({ 
      error: 'Database error while placing order',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update order status (Admin only)
app.patch('/api/orders/:id', authenticateAdminToken, async (req, res) => {
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
app.delete('/api/orders/:id', authenticateAdminToken, async (req, res) => {
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


// --- Settings Routes ---

// Get settings (Public)
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update settings (Admin only)
app.patch('/api/settings', authenticateAdminToken, async (req, res) => {
  try {
    const { 
      currency, announcement_text, announcement_bar_enabled,
      social_facebook, social_instagram, social_twitter, social_snapchat, social_tiktok,
      popup_enabled, popup_title, popup_message, 
      popup_coupon_code, popup_button_text, popup_button_link, 
      popup_delay, popup_show_once
    } = req.body;

    const result = await pool.query(
      `UPDATE settings 
       SET 
        currency = COALESCE($1, currency),
        announcement_text = COALESCE($2, announcement_text),
        announcement_bar_enabled = COALESCE($3, announcement_bar_enabled),
        social_facebook = COALESCE($4, social_facebook),
        social_instagram = COALESCE($5, social_instagram),
        social_twitter = COALESCE($6, social_twitter),
        social_snapchat = COALESCE($7, social_snapchat),
        social_tiktok = COALESCE($8, social_tiktok),
        popup_enabled = COALESCE($9, popup_enabled),
        popup_title = COALESCE($10, popup_title),
        popup_message = COALESCE($11, popup_message),
        popup_coupon_code = COALESCE($12, popup_coupon_code),
        popup_button_text = COALESCE($13, popup_button_text),
        popup_button_link = COALESCE($14, popup_button_link),
        popup_delay = COALESCE($15, popup_delay),
        popup_show_once = COALESCE($16, popup_show_once),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = 1 
       RETURNING *`,
      [
        currency, announcement_text, announcement_bar_enabled,
        social_facebook, social_instagram, social_twitter, social_snapchat, social_tiktok,
        popup_enabled, popup_title, popup_message,
        popup_coupon_code, popup_button_text, popup_button_link,
        popup_delay, popup_show_once
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// --- Discount Routes ---

// Get all discounts (Admin only)
app.get('/api/discounts', authenticateAdminToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM discounts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add new discount (Admin only)
app.post('/api/discounts', authenticateAdminToken, async (req, res) => {
  try {
    const { code, type, value, min_quantity, usage_limit } = req.body;
    const result = await pool.query(
      'INSERT INTO discounts (code, type, value, min_quantity, usage_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [code.toUpperCase(), type, value, min_quantity || 0, usage_limit || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Discount code already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update discount (Admin only)
app.patch('/api/discounts/:id', authenticateAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { code, type, value, min_quantity, usage_limit, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE discounts 
       SET 
        code = COALESCE($1, code),
        type = COALESCE($2, type),
        value = COALESCE($3, value),
        min_quantity = COALESCE($4, min_quantity),
        usage_limit = COALESCE($5, usage_limit),
        is_active = COALESCE($6, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [code ? code.toUpperCase() : null, type, value, min_quantity, usage_limit, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete discount (Admin only)
app.delete('/api/discounts/:id', authenticateAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM discounts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json({ message: 'Discount deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Validate discount (Public)
app.post('/api/discounts/validate', async (req, res) => {
  try {
    const { code, subtotal, itemsCount } = req.body;
    const result = await pool.query('SELECT * FROM discounts WHERE code = $1 AND is_active = true', [code.toUpperCase()]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid discount code or code has expired' });
    }

    const discount = result.rows[0];

    // Check usage limit
    if (discount.usage_limit !== null && discount.used_count >= discount.usage_limit) {
      return res.status(400).json({ error: 'This discount code has reached its usage limit' });
    }

    // Check minimum quantity
    if (discount.min_quantity > 0 && itemsCount < discount.min_quantity) {
      return res.status(400).json({ error: `This code requires a minimum of ${discount.min_quantity} items` });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = Math.min(discount.value, subtotal);
    }

    res.json({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      min_quantity: discount.min_quantity,
      discountAmount: parseFloat(discountAmount.toFixed(2))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error during validation' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
