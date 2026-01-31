import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext.js';
import { useProducts } from '../contexts/ProductsContext.js';
import { API_URL } from '../config';

const AdminOverview = () => {
  const { admin, token } = useAdminAuth();
  const { products } = useProducts();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [token]);

  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + parseFloat(order.total), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
  const recentOrders = orders.slice(0, 5);

  return (
    <>
      <header className="content-header">
        <h1>Dashboard</h1>
        <span>Welcome, {admin?.name}</span>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">GH₵ {totalSales.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{orders.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{products.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-value">{pendingOrders}</p>
        </div>
      </div>

      <div className="recent-orders table-container">
        <h2>Recent Orders</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.order_number || order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                  <td>GH₵ {order.total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No orders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminOverview;

