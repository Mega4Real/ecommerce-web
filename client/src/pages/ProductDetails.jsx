import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext.js';
import { useProducts } from '../contexts/ProductsContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Star, Truck, ShieldCheck, Heart, ArrowLeft, X } from 'lucide-react';
import { optimizeCloudinaryImage } from '../utils/imageOptimization';
import Reviews from '../components/Reviews';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  
  const product = products.find(p => p.id === parseInt(id));
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);
  const [showAddedToCartPopup, setShowAddedToCartPopup] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Reset state when product ID changes
  useEffect(() => {
    setMainImage(null);
    setSelectedSize('');
    setQuantity(1);
    setZoomStyle({ display: 'none' });
    setIsModalOpen(false);
  }, [id]);

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
    addToCart(product, selectedSize, quantity);
    setShowAddedToCartPopup(true);
    setTimeout(() => setShowAddedToCartPopup(false), 3000);
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

  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${optimizedMainImage})`
    });
  };

  const handleMouseLeave = () => {
    if (window.innerWidth <= 768) return;
    setZoomStyle({ display: 'none' });
  };

  return (
    <div className="container section product-details-page">
      <Helmet>
        <title>{product.name} | Premium Collection</title>
        <meta name="description" content={product.description || `Buy ${product.name} at our luxury fashion store.`} />
      </Helmet>
      <Link to="/shop" className="back-link">
        <ArrowLeft size={20} />
        Back to Shop
      </Link>
      <div className="product-details-grid">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div 
            className="main-image-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => window.innerWidth <= 768 && setIsModalOpen(true)}
          >
            <img src={optimizedMainImage} alt={product.name} className="main-image" />
            <div className="zoom-overlay" style={zoomStyle}></div>
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
          </div>

          <p className="description">{product.description}</p>

          <div className="options">
            <div className="size-quantity-row">
              <div className="size-selection">
                <div className="size-header-row">
                  <h3>Select Size</h3>
                  <Link to="/size-guide" className="size-guide-link">Size Guide</Link>
                </div>
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
              <div className="quantity-selection">
                <h3>Quantity</h3>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} disabled={quantity >= product.stockQuantity}>+</button>
                </div>
              </div>
            </div>
          </div>

<div className="action-buttons">
            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
              ADD TO CART
            </button>
            {user && (
              <button
                className={`wishlist-btn-large ${isInWishlist(product.id) ? 'active' : ''}`}
                onClick={() => handleWishlistToggle(product.id)}
                title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                <span>{isInWishlist(product.id) ? 'Remove' : 'Save'}</span>
              </button>
            )}
          </div>

          <div className="features">

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
            ))}
          </div>
        </div>
      )}

      {/* Added to Cart Popup */}
      {showAddedToCartPopup && (
        <div className="added-to-cart-popup">
          <div className="popup-content">
            <div className="popup-icon">✓</div>
            <p>Item added to cart successfully!</p>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <Reviews productId={product.id} />

      {/* Mobile Image Gallery Modal */}
      {isModalOpen && (
        <div className="mobile-image-modal" onClick={() => setIsModalOpen(false)}>
          <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
            <X size={32} />
          </button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image-slider">
              {product.images.map((img, index) => (
                <div key={index} className="modal-slide">
                  <img 
                    src={optimizeCloudinaryImage(img, { size: 'large' })} 
                    alt={`${product.name} ${index + 1}`} 
                  />
                </div>
              ))}
            </div>
            <div className="modal-thumbnails">
              {product.images.map((img, index) => (
                <div 
                  key={index} 
                  className={`modal-thumb ${mainImage === img ? 'active' : ''}`}
                  onClick={() => {
                    const slider = document.querySelector('.modal-image-slider');
                    if (slider) {
                      slider.scrollTo({
                        left: index * slider.clientWidth,
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  <img src={optimizeCloudinaryImage(img, { size: 'thumbnail' })} alt="" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
