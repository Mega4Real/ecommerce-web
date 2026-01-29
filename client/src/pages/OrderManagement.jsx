import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { API_URL } from '../config';
import './OrderManagement.css';

const OrderManagement = () => {
  useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch orders:', response.status, response.statusText, errorText);
        setError(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      
      // Transform database fields to camelCase and parse items JSON
      const transformedOrders = data.map(order => ({
        ...order,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingRegion: order.shipping_region,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        createdAt: order.created_at
      }));
      
      setOrders(transformedOrders);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Network error while fetching orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setOrders(prev => prev.filter(order => order.id !== orderId));
      } else {
        const errorText = await response.text();
        alert(`Failed to delete order: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="admin-section">
        <header className="content-header">
          <h1>Order Management</h1>
        </header>
        <div className="section-content">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <header className="content-header">
          <h1>Order Management</h1>
        </header>
        <div className="section-content">
          <div className="error-message" style={{ color: 'red', padding: '1rem' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <header className="content-header">
        <h1>Order Management</h1>
        <p>Manage customer orders and track their status</p>
      </header>
      <div className="section-content">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.customerName}</div>
                        <div className="customer-email">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td>
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            {item.name} (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>GH₵{order.total}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className="order-actions">
                        <button 
                          className="action-btn view" 
                          onClick={() => handleViewDetails(order)}
                          title="View Order Details"
                        >
                          <Eye size={18} />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDeleteOrder(order.id)}
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.id}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-info">
                <div className="info-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  <p><strong>Contact:</strong> {selectedOrder.customerPhone || selectedOrder.customerEmail} {selectedOrder.customerPhone ? '(Phone)' : '(Email)'}</p>
                  {selectedOrder.shippingAddress && (
                    <div className="address-section">
                      <p><strong>Shipping Address:</strong></p>
                      <p>{selectedOrder.shippingAddress}</p>
                      {selectedOrder.shippingCity && <p>{selectedOrder.shippingCity}</p>}
                      {selectedOrder.shippingRegion && <p>{selectedOrder.shippingRegion}</p>}
                    </div>
                  )}
                  {!selectedOrder.shippingAddress && (
                    <p><strong>Address:</strong> <em>No shipping address provided</em></p>
                  )}
                </div>
                <div className="info-section">
                  <h3>Order Information</h3>
                  <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
                  <p><strong>Date:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                  <p><strong>Total:</strong> GH₵{selectedOrder.total}</p>
                </div>
              </div>
              <div className="order-items-detail">
                <h3>Items Purchased</h3>
                <div className="items-grid">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-card">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p className="item-price">GH₵{item.price}</p>
                        <p className="item-quantity">Quantity: {item.quantity}</p>
                        <p className="item-subtotal">Subtotal: GH₵{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
