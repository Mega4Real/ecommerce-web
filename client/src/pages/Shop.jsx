import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../data/products';
import { useProducts } from '../contexts/ProductsContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Filter, Heart, X } from 'lucide-react';
import { optimizeCloudinaryImage } from '../utils/imageOptimization';
import ProductSkeleton from '../components/ProductSkeleton';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort');
  const sizeParam = searchParams.get('size');
  const priceRangeParam = searchParams.get('priceRange');

  const { products, loading, error } = useProducts();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const selectedCategory = categoryParam || 'All';
  const sortOption = sortParam || 'default';
  const selectedSize = sizeParam || null;
  const selectedPriceRange = priceRangeParam || null;
  const [showFilters, setShowFilters] = useState(false);

  // Calculate filtered products during render
  let filteredProducts = [...products];

  // Filter out sold products - REMOVED to show sold out items with banner
  // filteredProducts = filteredProducts.filter(p => !p.sold);

  // Filter by category
  if (selectedCategory !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  // Filter by size
  if (selectedSize) {
    filteredProducts = filteredProducts.filter(p => 
      p.sizes && p.sizes.includes(selectedSize)
    );
  }

  // Filter by price range
  if (selectedPriceRange) {
    const [min, max] = selectedPriceRange.split('-').map(Number);
    filteredProducts = filteredProducts.filter(p => {
      const price = parseFloat(p.price);
      if (max) {
        return price >= min && price <= max;
      } else {
        return price >= min; // For "500+" range
      }
    });
  }

  // Sort
  if (sortOption === 'low-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'high-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'new') {
    // Sort new arrivals first
    filteredProducts.sort((a, b) => (a.newArrival === b.newArrival ? 0 : a.newArrival ? -1 : 1));
  }

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
    setShowFilters(false);
  };

  const handleSortChange = (sort) => {
    const params = new URLSearchParams(searchParams);
    if (sort === 'default') {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }
    setSearchParams(params);
  };

  const handleSizeChange = (size) => {
    const params = new URLSearchParams(searchParams);
    if (selectedSize === size) {
      // Toggle off if clicking the same size
      params.delete('size');
    } else {
      params.set('size', size);
    }
    setSearchParams(params);
  };

  const handlePriceRangeChange = (range) => {
    const params = new URLSearchParams(searchParams);
    if (selectedPriceRange === range) {
      // Toggle off if clicking the same range
      params.delete('priceRange');
    } else {
      params.set('priceRange', range);
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault(); // Prevent navigation to product page
    await toggleWishlist(productId);
  };

  return (
    <section className="container section shop-page">
      <div className="shop-header">
        <h1>Our Shop</h1>
        <p>Discover the latest products curated just for you.</p>
      </div>

      <div className="shop-controls">
        <button className="btn btn-outline filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={18} style={{ marginRight: '0.5rem' }} /> Filter
        </button>

        <div className="sort-control">
          <label>Sort by:</label>
          <select value={sortOption} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="default">Featured</option>
            <option value="new">Newest</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="shop-layout">
        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="filter-overlay" onClick={() => setShowFilters(false)}></div>
        )}

        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="filter-header-mobile">
            <h2>Filters</h2>
            <button className="close-filters-btn" onClick={() => setShowFilters(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="filter-group">
            <h3>Categories</h3>
            <ul>
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    className={selectedCategory === cat ? 'active' : ''}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="filter-group">
            <h3>Size</h3>
            <div className="size-options">
              {['S', 'M', 'L', 'XL'].map(size => (
                <button 
                  key={size} 
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Price Range</h3>
            <ul>
              {[
                { label: 'Under GH₵100', value: '0-100' },
                { label: 'GH₵100 - GH₵300', value: '100-300' },
                { label: 'GH₵300 - GH₵500', value: '300-500' },
                { label: 'Over GH₵500', value: '500-' }
              ].map(range => (
                <li key={range.value}>
                  <button 
                    className={selectedPriceRange === range.value ? 'active' : ''}
                    onClick={() => handlePriceRangeChange(range.value)}
                  >
                    {range.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {(selectedCategory !== 'All' || selectedSize || selectedPriceRange) && (
            <button className="btn btn-outline clear-filters-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <div className="shop-grid">
          {loading ? (
            <div className="product-grid">
              {[...Array(8)].map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map(product => {
                const optimizedImage = product.images && product.images[0] ? optimizeCloudinaryImage(product.images[0], { size: 'medium' }) : null;
                return (
                  <div key={product.id} className={`product-card ${product.sold ? 'sold-out' : ''}`}>
                    <div className="product-image-container">
                      {product.sold && <div className="sold-out-banner">Sold Out</div>}
                      {!product.sold && product.originalPrice && <div className="sale-banner">SALE</div>}
                      <Link to={`/product/${product.id}`}>
                        <img src={optimizedImage} alt={product.name} className="product-image" />
                      </Link>
                      {user && <button
                        className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                        onClick={(e) => handleWishlistToggle(e, product.id)}
                        title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                      </button>}
                    </div>
                    <div className="product-info">
                      <div className="product-meta">
                        <p className="product-category">{product.category}</p>
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="product-card-sizes">
                            {product.sizes.slice(0, 3).map((size, idx) => (
                              <span key={idx} className="size-tag">{size}</span>
                            ))}
                            {product.sizes.length > 3 && (
                              <span className="size-tag more">+{product.sizes.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="product-title">{product.name}</h3>
                      </Link>
<div className="product-price">
                        <span className="current-price">GH₵{product.price}</span>
                        {product.originalPrice && <span className="original-price">GH₵{product.originalPrice}</span>}
                      </div>
                    </div>
                  </div>
                );
            } )}
            </div>
          ) : (
            <div className="no-results">
              <p>No products found in this category.</p>
              <button className="btn btn-outline" onClick={() => handleCategoryChange('All')}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Shop;
