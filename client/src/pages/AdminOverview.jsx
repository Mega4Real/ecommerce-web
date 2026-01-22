import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useProducts } from '../contexts/ProductsContext.js';

const AdminOverview = () => {
  const { user } = useAuth();
  const { products } = useProducts();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
  }, []);

  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + parseFloat(order.total), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 5);

  return (
    <>
      <header className="content-header">
        <h1>Dashboard</h1>
        <span>Welcome, {user?.name}</span>
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

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        <table className="orders-table">
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
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td><span className={`status ${order.status}`}>{order.status}</span></td>
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
