import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { settings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {settings.announcement_bar_enabled && settings.announcement_text && (
        <div className="announcement-bar">
          <p>{settings.announcement_text}</p>
        </div>
      )}
      <div className="container navbar-content">
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="brand-logo">
          {settings.store_name}
        </Link>

        {/* Desktop Links */}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to="/shop" onClick={() => setIsMenuOpen(false)}>SHOP</NavLink>
          <NavLink to="/shop?sort=new" onClick={() => setIsMenuOpen(false)}>NEW ARRIVALS</NavLink>
          <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>ABOUT</NavLink>
        </div>

        {/* Icons */}
        <div className="nav-icons">
          <button className="icon-btn"><Search size={20} /></button>

          <Link to={user ? "/wishlist" : "/login"} className="icon-btn">
            <Heart size={20} />
            {user && wishlist.length > 0 && <span className="wishlist-badge">{wishlist.length}</span>}
          </Link>

          <Link to="/cart" className="icon-btn cart-btn">
            <ShoppingBag size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="user-menu-container">
              <button
                className="icon-btn user-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
              >
                <User size={20} />
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <p className="user-name">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <Link to="/my-orders" onClick={() => setIsUserMenuOpen(false)}>My Orders</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>Admin Dashboard</Link>}
                  <button className="logout-btn" onClick={() => { logout(); setIsUserMenuOpen(false); }}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="icon-btn"><User size={20} /></Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
