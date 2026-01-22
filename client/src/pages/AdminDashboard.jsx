import { useAuth } from '../contexts/AuthContext.js';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, Package } from 'lucide-react';
import AdminOverview from './AdminOverview';
import ProductManagement from './ProductManagement';
import CustomerManagement from './CustomerManagement';
import AdminSettings from './AdminSettings';
import OrderManagement from './OrderManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="admin-loading" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  // Basic route protection
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <NavLink 
            to="/admin" 
            end 
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <ShoppingBag size={20} /> Products
          </NavLink>
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <Package size={20} /> Orders
          </NavLink>
          <NavLink 
            to="/admin/customers" 
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <Users size={20} /> Customers
          </NavLink>
          <NavLink 
            to="/admin/settings" 
            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
          >
            <Settings size={20} /> Settings
          </NavLink>
        </nav>
      </aside>

      <main className="admin-content">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
