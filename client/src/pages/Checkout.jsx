import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Lock } from 'lucide-react';
import { API_URL, PAYSTACK_PUBLIC_KEY } from '../config';
import ThankYouPopup from '../components/ThankYouPopup';
import ReceiptModal from '../components/ReceiptModal';
import './Checkout.css';

const Checkout = () => {
  const { cart, subtotal, total, clearCart, appliedDiscount, discountAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    region: '',
    phone: '',
    paymentMethod: 'momo'
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY === 'your_public_key_here') {
      alert("Paystack Public Key is not configured. Please update VITE_PAYSTACK_PUBLIC_KEY in your .env file.");
      return;
    }

    setIsProcessing(true);
    
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: formData.email,
      amount: Math.round(total * 100),
      currency: 'GHS',
      callback: (response) => {
        handleOrderSubmission(response.reference);
      },
      onClose: () => {
        setIsProcessing(false);
      }
    });
    handler.openIframe();
  };

  const handleOrderSubmission = async (paymentReference) => {
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
        discountAmount: discountAmount || 0,
        paymentReference: paymentReference,
        paymentMethod: 'paystack'
      };
      
      // Submit order to server
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to place order');
      }
      
      const order = await response.json();
      
      // Show Thank You Popup instead of alert
      setSuccessOrder(order);
      setShowThankYou(true);
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Payment was successful (Ref: ${paymentReference}), but we failed to save your order: ${error.message}. Please contact support.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // If showing modals, render them
  if (showThankYou && successOrder) {
    return (
        <ThankYouPopup 
            isOpen={showThankYou} 
            onClose={() => setShowThankYou(false)} 
            orderData={successOrder} 
            onViewReceipt={() => {
                setShowThankYou(false);
                setShowReceipt(true);
            }}
        />
    );
  }

  if (showReceipt && successOrder) {
      return (
          <ReceiptModal
            isOpen={showReceipt}
            onClose={() => {
                setShowReceipt(false);
                navigate('/');
            }}
            order={successOrder}
          />
      );
  }
  
  // Only redirect if cart is empty AND we are not in a success flow
  if (cart.length === 0 && !showThankYou && !showReceipt) {
     return (
        <div className="container section">
           <p>Redirecting to cart...</p>
           {/* Use a redirect effect or just return null and let useEffect handle it if we had one. 
               Here we can just force render nothing and navigate. */}
           {(() => {
               // Only navigate if we are truly empty and not just transitioned
               // But usually this check happens on mount. 
               // For safety, let's just use a button or effect.
               // React doesn't like side effects in render.
               // Let's use a small inline component or just a key.
           })()} 
           {/* Safer approach: */}
           <div style={{ display: 'none' }}>
               {setTimeout(() => navigate('/cart'), 0) && ''}
           </div>
        </div>
     );
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
                <span className="label-text">Secure Payment via Paystack (Mobile Money / Cards)</span>
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

          <div className="checkout-trust-badges">
            <div className="trust-item">
              <ShieldCheck size={18} />
              <span>Secure Checkout</span>
            </div>
            <div className="trust-item">
              <Truck size={18} />
              <span>Express Delivery</span>
            </div>
            <div className="trust-item">
              <Lock size={18} />
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
