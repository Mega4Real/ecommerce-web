import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../contexts/ProductsContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import './Home.css';

const Home = () => {
  const { products, loading } = useProducts();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const newArrivals = products.filter(p => p.newArrival && !p.sold && p.category === 'Dresses').slice(0, 4);

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault(); // Prevent navigation to product page
    await toggleWishlist(productId);
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>Luxury Fashion Store | Home</title>
        <meta name="description" content="Discover the latest trends in luxury fashion. Shop our summer collection 2026 for elegant, timeless, and chic styles." />
      </Helmet>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content container">
          <span className="hero-subtitle">NEW SEASON</span>
          <h1>Summer Collection 2026</h1>
          <p>Discover the latest trends in fashion. Elegant, timeless, and chic styles for the modern individual.</p>
          <Link to="/shop" className="btn btn-primary">
            Shop Collection <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
          </Link>
        </div>
      </section>

      {/* Categories Grid - Optional quick links */}
      <section className="section container">
        <h2 className="section-title">Categories</h2>
        <div className="categories-grid">
          {['Dresses', 'Tops', 'Accessories', 'Pants'].map(cat => (
            <Link to={`/shop?category=${cat}`} key={cat} className="category-card">
              <div className="category-image-container">
              </div>
              <h3>{cat}</h3>
            </Link>
          ))}
        </div>
        <div className="section-action">
          <Link to="/shop" className="btn btn-outline view-all-btn">
            View All Products
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section container">
        <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>New Arrivals</h2>
        </div>
        
        <div className="product-grid grid">
          {loading ? (
            <div className="loading" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              <p>Loading new arrivals...</p>
            </div>
          ) : newArrivals.length > 0 ? (
            newArrivals.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.images && product.images[0]} alt={product.name} className="product-image" />
                  </Link>
                  {user && (
                    <button
                      className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                      onClick={(e) => handleWishlistToggle(e, product.id)}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="product-title">{product.name}</h3>
                  </Link>
                  <div className="product-price">
                    {product.originalPrice && <span className="original-price">GH₵{product.originalPrice}</span>}
                    <span className="current-price">GH₵{product.price}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
              <p>No new arrivals available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter / Promo */}
      <section className="newsletter-section">
        <div className="container">
          <h2>Join Our Newsletter</h2>
          <p>Subscribe for exclusive offers and updates.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button className="btn btn-primary">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
