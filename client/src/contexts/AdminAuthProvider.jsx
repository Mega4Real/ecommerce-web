import { useState, useEffect } from 'react';
import { AdminAuthContext } from './AdminAuthContext.js';
import { API_URL } from '../config';

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setAdmin(null);
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_URL}/api/auth/admin/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.role === 'admin') {
            setAdmin(data);
          } else {
            setAdmin(null);
            localStorage.removeItem('adminToken');
          }
        } else {
          setAdmin(null);
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        console.error('Admin auth verification failed:', error);
        setAdmin(null);
        localStorage.removeItem('adminToken');
      }
      setLoading(false);
    };

    checkAdminAuth();
  }, []);

  const adminLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
        // Store token in localStorage
        localStorage.setItem('adminToken', data.token);
        setAdmin(data.user);
        return { success: true, admin: data.user };
      } else {
        return { success: false, error: data.error || 'Admin login failed' };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const adminLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      await fetch(`${API_URL}/api/auth/admin/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      localStorage.removeItem('adminToken');
      setAdmin(null);
    } catch (error) {
      console.error('Admin logout error:', error);
      localStorage.removeItem('adminToken');
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};