import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import './Checkout.css';

const Checkout = () => {
  const { cart, subtotal, total, clearCart, appliedDiscount, discountAmount } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    region: '',
    phone: '',
    paymentMethod: 'card'
  });

  // Update form if user data loads later
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email,
        firstName: prev.firstName || user.name?.split(' ')[0],
        lastName: prev.lastName || user.name?.split(' ').slice(1).join(' ')
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Create order data
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingRegion: formData.region,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: (item.images && item.images[0]) || item.image || '',
          size: item.selectedSize || ''
        })),
        total: total,
        discountCode: appliedDiscount?.code || null,
        discountAmount: discountAmount || 0
      };
      
      // Submit order to server
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to place order');
      }
      
      alert(`Order Placed Successfully! Thank you for shopping with ${settings.store_name}`);
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container section checkout-page">
      <h1>Checkout</h1>
      
      <div className="checkout-grid">
        <div className="checkout-main">
          <form className="checkout-form" onSubmit={handleSubmit}>
          {/* Contact Info */}
          <section className="form-section">
            <h2>Contact Information</h2>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                value={formData.phone} 
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Shipping Address */}
          <section className="form-section">
            <h2>Shipping Address</h2>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Region</label>
                <select name="region" required value={formData.region} onChange={handleChange}>
                  <option value="">Select Region</option>
                  <option value="Greater Accra">Greater Accra</option>
                  <option value="Ashanti">Ashanti</option>
                  <option value="Western">Western</option>
                  {/* ... other regions */}
                </select>
              </div>
            </div>
          </section>



          {/* Payment Method */}
          <section className="form-section">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <label className={`payment-option ${formData.paymentMethod === 'momo' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="momo" 
                  onChange={handleChange} 
                  checked={formData.paymentMethod === 'momo'}
                />
                <span className="radio-custom"></span>
                <span className="label-text">Mobile Money (MTN/Vodafone/AirtelTigo)</span>
              </label>

              <label className={`payment-option ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  onChange={handleChange} 
                  checked={formData.paymentMethod === 'card'}
                />
                <span className="radio-custom"></span>
                <span className="label-text">Credit / Debit Card</span>
              </label>

              <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  onChange={handleChange} 
                  checked={formData.paymentMethod === 'cod'}
                />
                <span className="radio-custom"></span>
                <span className="label-text">Pay on Delivery</span>
              </label>
            </div>
          </section>

          <button type="submit" className="btn btn-primary place-order-btn" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Place Order - GH₵${total}`}
          </button>
        </form>
      </div>

        <div className="order-summary-sidebar">
          <h3>In Your Bag</h3>
          <div className="order-items">
            {cart.map(item => (
              <div key={`${item.id}-${item.selectedSize}`} className="order-item">
                <div className="order-item-img">
                  <img src={(item.images && item.images[0]) || item.image || ''} alt={item.name} />
                  <span className="order-item-qty">{item.quantity}</span>
                </div>
                <div className="order-item-details">
                  <p className="name">{item.name}</p>
                  <p className="variant">{item.selectedSize}</p>
                </div>
                <div className="order-item-price">GH₵{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
          <div className="order-totals">
            <div className="row">
              <span>Subtotal</span>
              <span>GH₵{subtotal}</span>
            </div>
            {appliedDiscount && (
              <div className="row discount" style={{ color: 'var(--color-success)', fontWeight: '500' }}>
                <span>Discount ({appliedDiscount.code})</span>
                <span>-GH₵{discountAmount}</span>
              </div>
            )}
            <div className="row total">
              <span>Total</span>
              <span>GH₵{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

