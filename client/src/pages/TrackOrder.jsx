import React, { useState } from 'react';
import './TrackOrder.css';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`http://localhost:3002/api/orders/track/${orderNumber}`);
      const data = await response.json();

      if (response.ok) {
        setOrderDetails(data);
      } else {
        setError(data.error || 'Order not found.');
      }
    } catch (err) {
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-order">
      <h1>Track Your Order</h1>
      <p>Enter your order number to check the status of your delivery.</p>
      <form className="track-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="orderNumber">Order Number</label>
          <input
            type="text"
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g., 1"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Tracking...' : 'Track Order'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {orderDetails && (
        <div className="order-details">
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> {orderDetails.id}</p>
          <p><strong>Customer Name:</strong> {orderDetails.customer_name}</p>
          <p><strong>Email:</strong> {orderDetails.customer_email}</p>
          <p><strong>Total:</strong> ${orderDetails.total}</p>
          <p><strong>Status:</strong> {orderDetails.status}</p>
          <p><strong>Order Date:</strong> {new Date(orderDetails.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
