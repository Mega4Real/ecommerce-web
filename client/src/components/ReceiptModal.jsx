import React, { useRef, useEffect } from 'react';
import { X, Printer, Download, CheckCircle } from 'lucide-react';
import './ReceiptModal.css';

const ReceiptModal = ({ isOpen, onClose, order }) => {
  const receiptRef = useRef(null);

  useEffect(() => {
    console.log('ReceiptModal: MOUNTED', { isOpen, order });
    return () => console.log('ReceiptModal: UNMOUNTED');
  }, [isOpen, order]);

  if (!isOpen || !order) {
    console.log('ReceiptModal: Not rendering because isOpen/order is falsy', { isOpen, order });
    return null;
  }

  let items = order.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (e) {
      console.error('Failed to parse items JSON:', e);
      items = [];
    }
  } else if (!items) {
      items = [];
  }

  const handlePrint = () => {
    window.print();
  };

  console.log('ReceiptModal: Parsed items:', items);

  return (
    <div className="receipt-overlay">
      <div className="receipt-modal">
        <div className="receipt-actions-bar no-print">
          <button onClick={onClose} className="btn-close-modal">
            <X size={24} />
          </button>
        </div>

        <div className="receipt-content" ref={receiptRef} id="printable-receipt">
          {/* Header */}
          <div className="receipt-header-brand">
            <h2>MEGA4REAL</h2>
            <p className="brand-tagline">Your Premium Shopping Destination</p>
          </div>

          <div className="receipt-message">
            <h3>Thank You for Your Order! <span className="confetti">🎉</span></h3>
            <p>We've received your order and will process it shortly.</p>
          </div>

          {/* Order Meta */}
          <div className="order-meta-grid">
            <div className="meta-item">
              <span className="label">Order Number:</span>
              <span className="value">#{order.order_number}</span>
            </div>
            <div className="meta-item">
              <span className="label">Date:</span>
              <span className="value">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
             <div className="meta-item">
              <span className="label">Payment Method:</span>
              <span className="value">{order.payment_method || 'Standard'}</span> 
              {/* Note: payment_method might not be in the order object if not saved, relying on what's available */}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="section-header">Delivery Information</div>
          <div className="delivery-info-card">
            <p className="customer-name">{order.customer_name}</p>
            <p className="customer-contact">📞 {order.customer_phone}</p>
            <p className="customer-address">📍 {order.shipping_address}, {order.shipping_city}</p>
          </div>

          {/* Order Items */}
          <div className="section-header">Order Items</div>
          <div className="order-items-list">
            {items.map((item, idx) => (
              <div key={idx} className="receipt-item-row">
                <div className="item-image">
                   <img src={item.image} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
                </div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  {item.size && <span className="item-meta">Size: {item.size}</span>}
                  <span className="item-meta">Qty: {item.quantity}</span>
                </div>
                <div className="item-price">
                  GH₵{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="receipt-footer-totals">
             <div className="total-row main-total">
               <span>Total Amount</span>
               <span className="amount">GH₵{order.total}</span>
             </div>
          </div>

          {/* Footer */}
          <div className="receipt-contact-footer">
            <h4>Need Help?</h4>
            <p>📧 support@mega4real.com</p>
            <p>📱 +233 123 456 789</p>
            <p className="copyright">© {new Date().getFullYear()} MEGA4REAL. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
        
        <div className="receipt-download-actions no-print">
            <button onClick={handlePrint} className="btn-download">
                <Printer size={18} /> Print / Download
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
