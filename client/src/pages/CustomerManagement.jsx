import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Hash, Shield, Eye, X, Package, Clock, Truck, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { API_URL } from '../config';
import './CustomerManagement.css';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Could not load customer data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId) => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setUserOrders(data);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewOrders = (customer) => {
    setSelectedCustomer(customer);
    fetchUserOrders(customer.id);
    setShowOrdersModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={16} className="status-pending" />;
      case 'processing': return <Package size={16} className="status-processing" />;
      case 'shipped': return <Truck size={16} className="status-shipped" />;
      case 'delivered': return <CheckCircle size={16} className="status-delivered" />;
      case 'cancelled': return <AlertCircle size={16} className="status-cancelled" />;
      default: return <Clock size={16} />;
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? All their account data will be removed, though their order history will be kept for records.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
      } else {
        let errorMsg = 'Failed to delete customer';
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          const text = await response.text();
          errorMsg = `${response.status} ${response.statusText} - ${text}`;
        }
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Error deleting customer');
    }
  };

  const handleDeleteUserOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUserOrders(prev => prev.filter(o => o.id !== orderId));
        // Also update the order count in the main customer list
        setCustomers(prev => prev.map(c => {
          if (c.id === selectedCustomer.id) {
            return { ...c, order_count: (parseInt(c.order_count) - 1).toString() };
          }
          return c;
        }));
      } else {
        alert('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-section">
        <header className="content-header">
          <h1>Customer Management</h1>
        </header>
        <div className="section-content">
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <header className="content-header">
        <h1>Customer Management</h1>
        <p>View and manage registered customer accounts</p>
      </header>
      <div className="section-content">
        {error ? (
          <div className="error-message">{error}</div>
        ) : customers.length === 0 ? (
          <div className="no-data">
            <p>No customers registered yet.</p>
          </div>
        ) : (
          <div className="customers-table-container">
            <table className="customers-table">
              <thead>
                <tr>
                  <th><div className="flex items-center gap-xs"><User size={14} /> Customer</div></th>
                  <th><div className="flex items-center gap-xs"><Mail size={14} /> Email</div></th>
                  <th><div className="flex items-center gap-xs"><Shield size={14} /> Role</div></th>
                  <th><div className="flex items-center gap-xs"><Calendar size={14} /> Joined</div></th>
                  <th><div className="flex items-center gap-xs"><Hash size={14} /> Orders</div></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-info-cell">
                        <span className="customer-name">{customer.name || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td>{customer.email}</td>
                    <td>
                      <span className={`role-badge ${customer.role.toLowerCase()}`}>
                        {customer.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="joined-date">{formatDate(customer.created_at)}</span>
                    </td>
                    <td>
                      <span className={`order-count-badge ${customer.order_count > 0 ? 'has-orders' : ''}`}>
                        {customer.order_count}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button 
                          className="action-btn view" 
                          title="View Orders"
                          onClick={() => handleViewOrders(customer)}
                          disabled={customer.order_count === '0'}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="action-btn delete" 
                          title="Delete Customer"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          disabled={customer.role === 'admin'}
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

      {/* User Orders Modal */}
      {showOrdersModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowOrdersModal(false)}>
          <div className="modal-content orders-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Orders for {selectedCustomer.name}</h2>
                <p className="modal-subtitle">{selectedCustomer.email}</p>
              </div>
              <button className="close-btn" onClick={() => setShowOrdersModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : userOrders.length === 0 ? (
                <div className="no-data-modal">
                  <Package size={48} strokeWidth={1} />
                  <p>This customer hasn't placed any orders yet.</p>
                </div>
              ) : (
                <div className="user-orders-list">
                  {userOrders.map(order => (
                    <div key={order.id} className="user-order-card">
                      <div className="order-main-info">
                        <div className="order-id-date">
                          <span className="order-ref">#LX-{order.id.toString().padStart(5, '0')}</span>
                          <span className="order-date">{formatDate(order.created_at)}</span>
                        </div>
                        <div className={`order-status-badge ${order.status.toLowerCase()}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status.toUpperCase()}</span>
                        </div>
                        <button 
                          className="delete-btn-mini" 
                          onClick={() => handleDeleteUserOrder(order.id)}
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="order-items-summary">
                        {JSON.parse(typeof order.items === 'string' ? order.items : JSON.stringify(order.items)).map((item, idx) => (
                          <div key={idx} className="item-row">
                            <div className="item-main-details">
                              {item.image && (
                                <div className="item-thumbnail-mini">
                                  <img src={item.image} alt={item.name} />
                                </div>
                              )}
                              <span className="item-name-qty">{item.name} x {item.quantity}</span>
                            </div>
                            <span className="item-price">GH₵{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-total-row">
                        <span>Total Paid</span>
                        <strong>GH₵{order.total}</strong>
                      </div>

                      {order.shipping_address && (
                        <div className="shipping-mini-block">
                          <label>Shipping to:</label>
                          <p>{order.shipping_address}, {order.shipping_city}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowOrdersModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;

