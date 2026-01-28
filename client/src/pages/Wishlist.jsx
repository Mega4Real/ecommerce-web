import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import ProductSkeleton from '../components/ProductSkeleton';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container section">
        <div className="wishlist-login-message">
          <h1>Please log in to view your wishlist</h1>
          <p>You need to be logged in to access your wishlist.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container section wishlist-page">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
        </div>
        <div className="wishlist-grid">
          {[...Array(4)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
  };

  return (
    <div className="container section wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>Your wishlist is empty</h2>
          <p>Start adding items you love to your wishlist!</p>
          <Link to="/shop" className="btn btn-primary">Browse Shop</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(product => (
            <div key={product.id} className="wishlist-item">
              <div className="wishlist-image-container">
                <Link to={`/product/${product.id}`}>
                  <img src={product.images && product.images[0]} alt={product.name} className="wishlist-image" />
                </Link>
                <button
                  className="remove-wishlist-btn"
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  title="Remove from wishlist"
                >
                  ×
                </button>
              </div>
              <div className="wishlist-info">
                <p className="wishlist-category">{product.category}</p>
                <Link to={`/product/${product.id}`}>
                  <h3 className="wishlist-title">{product.name}</h3>
                </Link>
                <div className="wishlist-price">
                  {product.original_price && <span className="original-price">GH₵{product.original_price}</span>}
                  <span className="current-price">GH₵{product.price}</span>
                </div>
                <Link to={`/product/${product.id}`} className="btn btn-outline btn-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;