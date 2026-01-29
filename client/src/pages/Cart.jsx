import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext.js';
import { Trash2, Plus, Minus, ArrowLeft, Tag, X } from 'lucide-react';
import { API_URL } from '../config';
import './Cart.css';

const Cart = () => {
  const { 
    cart, removeFromCart, updateQuantity, subtotal, total, 
    appliedDiscount, applyDiscount, removeDiscount, discountAmount 
  } = useCart();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsValidating(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/discounts/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: discountCode, 
          subtotal, 
          itemsCount: cart.reduce((acc, item) => acc + item.quantity, 0) 
        })
      });

      const data = await response.json();

      if (response.ok) {
        applyDiscount(data);
        setDiscountCode('');
      } else {
        setError(data.error || 'Invalid discount code');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container section cart-empty">
        <h2>Your Bag is Empty</h2>
        <p>Looks like you haven't added anything to your bag yet.</p>
        <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container section cart-page">
      <h1>Shopping Bag ({cart.length})</h1>

      <div className="cart-grid">
        <div className="cart-items">
          <div className="cart-header">
            <span>Item</span>
            <span>Quantity</span>
            <span>Price</span>
          </div>
          
          {cart.map((item) => (
            <div key={`${item.id}-${item.selectedSize}`} className="cart-item">
              <div className="item-info">
                <div className="cart-item-image">
                  <img src={(item.images && item.images[0]) || item.image || ''} alt={item.name} />
                </div>
                <div>
                  <Link to={`/product/${item.id}`}><h4>{item.name}</h4></Link>
                  <p className="item-variant">Size: {item.selectedSize}</p>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id, item.selectedSize)}>
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>

              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} disabled={item.quantity <= 1}>
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)}>
                  <Plus size={14} />
                </button>
              </div>

              <div className="item-price">
                GH₵{item.price * item.quantity}
              </div>
            </div>
          ))}

          <Link to="/shop" className="continue-shopping">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          
          <div className="discount-section">
            <p>Have a discount code?</p>
            {appliedDiscount ? (
              <div className="applied-discount">
                <span className="discount-tag">
                  <Tag size={16} /> {appliedDiscount.code}
                </span>
                <button className="remove-discount" onClick={removeDiscount}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="discount-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    value={discountCode} 
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  />
                  <button 
                    className="apply-btn" 
                    onClick={handleApplyDiscount}
                    disabled={isValidating || !discountCode}
                  >
                    {isValidating ? '...' : 'Apply'}
                  </button>
                </div>
                {error && <p className="discount-error">{error}</p>}
              </>
            )}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>GH₵{subtotal}</span>
          </div>

          {appliedDiscount && (
            <div className="summary-row discount">
              <span>Discount ({appliedDiscount.code})</span>
              <span>-GH₵{discountAmount}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Total</span>
            <span>GH₵{total}</span>
          </div>

          <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
