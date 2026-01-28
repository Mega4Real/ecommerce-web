import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.js';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  const total = subtotal;

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
          

          <div className="summary-row">
            <span>Subtotal</span>
            <span>GH₵{subtotal}</span>
          </div>
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
