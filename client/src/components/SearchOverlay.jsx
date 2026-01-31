import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductsContext';
import './SearchOverlay.css';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { products } = useProducts();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const results = useMemo(() => {
    if (query.trim().length > 1) {
      return products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  }, [query, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div className="search-backdrop" onClick={onClose}></div>
      <div className="search-container">
        <div className="search-header container">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <Search size={24} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for products, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </form>
        </div>

        {query.trim().length > 0 && (
          <div className="search-results-container container">
            {results.length > 0 ? (
              <div className="results-list">
                <p className="results-title">Quick Results</p>
                {results.map(product => (
                  <div 
                    key={product.id} 
                    className="result-item"
                    onClick={() => {
                      navigate(`/product/${product.id}`);
                      onClose();
                    }}
                  >
                    <img src={product.images?.[0]} alt={product.name} />
                    <div className="result-info">
                      <h4>{product.name}</h4>
                      <p>{product.category} • GH₵{product.price}</p>
                    </div>
                    <ArrowRight size={16} className="arrow" />
                  </div>
                ))}
                <button className="view-all-results" onClick={handleSearchSubmit}>
                  View all results for "{query}"
                </button>
              </div>
            ) : query.trim().length > 1 ? (
              <div className="no-results-msg">
                <p>No products found for "{query}"</p>
              </div>
            ) : null}
          </div>
        )}

        <div className="search-suggestions container">
          <p className="suggestions-title">Popular Searches</p>
          <div className="suggestion-tags">
            {['Dresses', 'Summer Collection', 'Accessories', 'New Arrivals'].map(tag => (
              <button 
                key={tag} 
                onClick={() => {
                  setQuery(tag);
                  inputRef.current?.focus();
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
