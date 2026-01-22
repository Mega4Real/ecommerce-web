import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.js';
import { useProducts } from '../contexts/ProductsContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import { optimizeCloudinaryImage, getResponsiveImageSources } from '../utils/imageOptimization';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  
  const product = products.find(p => p.id === parseInt(id));
  const [selectedSize, setSelectedSize] = useState('');
  const [mainImage, setMainImage] = useState(null);

  if (loading) {
    return <div className="container section"><p>Loading product...</p></div>;
  }

  if (!product) {
    return <div className="container section"><p>Product not found.</p></div>;
  }

  if (product.sold) {
    return (
      <div className="container section product-details-page">
        <div className="sold-product-message">
          <h1>This product is no longer available</h1>
          <p>The {product.name} has been sold. Check out our other products!</p>
          <Link to="/shop" className="btn btn-primary">Browse Shop</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, selectedSize);
  };

  const handleWishlistToggle = async (productId) => {
    await toggleWishlist(productId);
  };

  // Filter related dresses: category 'Dresses', exclude current product, exclude sold, limit to 4
  const relatedProducts = products.filter(p =>
    p.category === 'Dresses' && p.id !== product.id && !p.sold
  ).slice(0, 4);

  // Optimize images for different contexts
  const optimizedMainImage = mainImage ? optimizeCloudinaryImage(mainImage, { size: 'large' }) : (product.images && optimizeCloudinaryImage(product.images[0], { size: 'large' }));
  const optimizedThumbnails = product.images ? product.images.map(img => optimizeCloudinaryImage(img, { size: 'thumbnail' })) : [];
  const optimizedRelatedImages = relatedProducts.map(product => optimizeCloudinaryImage(product.images[0], { size: 'medium' }));

  return (
    <div className="container section product-details-page">
      <div className="product-details-grid">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={optimizedMainImage} alt={product.name} />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="image-thumbnails">
              {optimizedThumbnails.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${mainImage === product.images[index] ? 'active' : ''}`}
                  onClick={() => setMainImage(product.images[index])}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info-col">
          <p className="breadcrumb">Home / Shop / {product.category} / {product.name}</p>
          <h1>{product.name}</h1>
          
          <div className="price-rating">
            <div className="price">
              {product.originalPrice && <span className="original-price">GH₵{product.originalPrice}</span>}
              <span className="current-price">GH₵{product.price}</span>
            </div>
            <div className="rating">
              <Star size={16} fill="gold" stroke="none" />
              <span>4.8 (24 reviews)</span>
            </div>
            {user && (
              <button
                className={`wishlist-btn-large ${isInWishlist(product.id) ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                <span>{isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </button>
            )}
          </div>

          <p className="description">{product.description}</p>

          <div className="options">
            <h3>Select Size</h3>
            <div className="sizes-grid">
              {product.sizes.map(size => (
                <button 
                  key={size} 
                  className={`size-option ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
            ADD TO CART - GH₵{product.price}
          </button>

          <div className="features">
            <div className="feature-item">
              <Truck size={20} />
              <span>Free shipping on orders over GH₵1000</span>
            </div>
            <div className="feature-item">
              <ShieldCheck size={20} />
              <span>Secure Payment & Quality Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h2>You May Also Like</h2>
          <div className="product-grid">
            {relatedProducts.map((product, index) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <Link to={`/product/${product.id}`}>
                    <img src={optimizedRelatedImages[index]} alt={product.name} className="product-image" />
                  </Link>
                  {user && (
                    <button
                      className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleWishlistToggle(product.id);
                      }}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
