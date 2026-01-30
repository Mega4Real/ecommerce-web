import React from 'react';
import { CheckCircle, FileText, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ThankYouPopup.css';

const ThankYouPopup = ({ isOpen, onClose, orderData, onViewReceipt }) => {
  const navigate = useNavigate();

  if (!isOpen || !orderData) return null;

  const handleViewReceipt = () => {
    if (onViewReceipt) {
      onViewReceipt();
    } else {
      navigate(`/receipt/${orderData.order_number}?email=${encodeURIComponent(orderData.customer_email)}`);
    }
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  return (
    <div className="thank-you-overlay">
      <div className="thank-you-popup">
        <div className="popup-icon">
          <CheckCircle size={64} className="success-icon" />
        </div>
        
        <h2>Thank You for Your Order!</h2>
        <p className="order-message">
          Your order has been placed successfully. A confirmation email has been sent to <strong>{orderData.customer_email}</strong>.
        </p>

        <div className="order-details-summary">
          <div className="summary-row">
            <span>Order Reference:</span>
            <span className="order-number">{orderData.order_number}</span>
          </div>
          <div className="summary-row">
            <span>Total Amount:</span>
            <span className="order-total">GH₵{orderData.total}</span>
          </div>
        </div>

        <div className="popup-actions">
          <button onClick={handleViewReceipt} className="btn-receipt">
            <FileText size={18} />
            View Receipt
          </button>
          <button onClick={handleContinueShopping} className="btn-continue">
            <ShoppingBag size={18} />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPopup;
