import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle, X } from 'lucide-react';
import { API_URL } from '../config';
import './MyOrders.css';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('details'); // 'details' or 'tracking'

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError('Could not load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyOrders();
    }
  }, [user]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="container section"><p>Loading your orders...</p></div>;
  if (!user) return <div className="container section"><p>Please log in to view your orders.</p></div>;

  return (
    <div className="container section my-orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>View and track your previous purchases</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      {orders.length === 0 ? (
        <div className="no-orders">
          <Package size={64} strokeWidth={1} />
          <h2>No orders yet</h2>
          <p>You haven't made any purchases yet. Start shopping to see your orders here!</p>
          <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta">
                  <div className="meta-item">
                    <span>Order Date</span>
                    <strong>{formatDate(order.created_at)}</strong>
                  </div>
                  <div className="meta-item">
                    <span>Order ID</span>
                    <strong>#LX-{order.id.toString().padStart(5, '0')}</strong>
                  </div>
                  <div className="meta-item">
                    <span>Total Amount</span>
                    <strong>GH₵{order.total}</strong>
                  </div>
                </div>
                <div className={`order-status-badge ${order.status.toLowerCase()}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status.toUpperCase()}</span>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-inline">
                    <div className="item-details">
                      <strong>{item.name}</strong>
                      <span>{item.quantity} x GH₵{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSelectedOrder(order);
                    setModalMode('tracking');
                    setShowModal(true);
                  }}
                >
                  Track Order
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSelectedOrder(order);
                    setModalMode('details');
                    setShowModal(true);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'tracking' ? 'Track Order' : 'Order Details'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {modalMode === 'details' ? (
                <>
                  <div className="detail-section">
                    <div className="info-block">
                      <label>Order Reference</label>
                      <span>#LX-{selectedOrder.id.toString().padStart(5, '0')}</span>
                    </div>
                  </div>

                  {selectedOrder.customer_name && (
                    <div className="detail-section">
                      <h3>Customer Info</h3>
                      <p><strong>{selectedOrder.customer_name}</strong></p>
                      <p>{selectedOrder.customer_email}</p>
                    </div>
                  )}

                  {selectedOrder.shipping_address && (
                    <div className="detail-section">
                      <h3>Shipping Address</h3>
                      <p>{selectedOrder.shipping_address}</p>
                      <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_region}</p>
                    </div>
                  )}

                  <div className="detail-section">
                    <h3>Products</h3>
                    <div className="items-list">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="order-item-detail">
                          <div className="item-with-img">
                            {item.image && (
                              <div className="item-thumbnail">
                                <img src={item.image} alt={item.name} />
                              </div>
                            )}
                            <div className="item-info">
                              <strong>{item.name}</strong>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="item-price">GH₵{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section total-section">
                    <div className="info-block">
                      <label>Total Price</label>
                      <span className="total-price">GH₵{selectedOrder.total}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="tracking-section">
                  <div className="order-meta-info">
                    <span>Order #LX-{selectedOrder.id.toString().padStart(5, '0')}</span>
                    <div className={`order-status-badge ${selectedOrder.status.toLowerCase()}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span>{selectedOrder.status.toUpperCase()}</span>
                    </div>
                  </div>
                  <h3>Status Timeline</h3>
                  <div className="tracking-timeline">
                    {['pending', 'processing', 'shipped', 'delivered'].map((statusSlug, index) => {
                      const statuses = ['pending', 'processing', 'shipped', 'delivered'];
                      const currentIndex = statuses.indexOf(selectedOrder.status.toLowerCase());
                      const isCompleted = statuses.indexOf(statusSlug) <= currentIndex;
                      const isActive = statusSlug === selectedOrder.status.toLowerCase();

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
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

