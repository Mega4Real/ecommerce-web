import React, { useState } from 'react';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import './TrackOrder.css';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={18} className="status-pending" />;
      case 'processing': return <Package size={18} className="status-processing" />;
      case 'shipped': return <Truck size={18} className="status-shipped" />;
      case 'delivered': return <CheckCircle size={18} className="status-delivered" />;
      case 'cancelled': return <AlertCircle size={18} className="status-cancelled" />;
      default: return <Clock size={18} />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter an order number.');
      return;
    }

    setLoading(true);
    setError('');
    setOrderDetails(null);

    try {
      const response = await fetch(`${API_URL}/api/orders/track/${orderNumber}`);
      const data = await response.json();

      if (response.ok) {
        setOrderDetails(data);
      } else {
        setError(data.error || 'Order not found.');
      }
    } catch (error) {
      console.error('Tracking error:', error);
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-order">
      <div className="track-header">
        <h1>Track Your Order</h1>
        <p>Enter your order number to check the status of your delivery.</p>
      </div>

      <div className="track-card">
        <form className="track-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="orderNumber">Order Number</label>
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g., LX2026..."
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary track-btn-full">
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>

      {orderDetails && (
        <div className="result-card fade-in">
          <div className="result-header">
            <div className="order-identity">
              <h2>Order #{orderDetails.order_number}</h2>
              <span className="order-date">Placed on {new Date(orderDetails.created_at).toLocaleDateString()}</span>
            </div>
            <div className={`status-badge ${orderDetails.status.toLowerCase()}`}>
              {getStatusIcon(orderDetails.status)}
              <span>{orderDetails.status.toUpperCase()}</span>
            </div>
          </div>

          <div className="tracking-timeline">
            {['pending', 'processing', 'shipped', 'delivered'].map((statusSlug, index) => {
              const statuses = ['pending', 'processing', 'shipped', 'delivered'];
              const currentIndex = statuses.indexOf(orderDetails.status.toLowerCase());
              const isCompleted = statuses.indexOf(statusSlug) <= currentIndex;
              const isActive = statusSlug === orderDetails.status.toLowerCase();

              return (
                <div key={statusSlug} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="step-marker">
                    {isCompleted ? <CheckCircle size={16} /> : <span>{index + 1}</span>}
                  </div>
                  <span className="step-label">{statusSlug.charAt(0).toUpperCase() + statusSlug.slice(1)}</span>
                </div>
              );
            })}
          </div>

          <div className="order-info-grid">
            <div className="info-item">
              <label>Customer Name</label>
              <strong>{orderDetails.customer_name}</strong>
            </div>
            <div className="info-item">
              <label>Total Amount</label>
              <strong>GH₵{orderDetails.total}</strong>
            </div>
            {/* Email hidden partially for privacy could be nice, but simple request is redesign */}
            <div className="info-item">
               <label>Email</label>
               <strong>{orderDetails.customer_email}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
