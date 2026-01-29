import { useState, useEffect } from 'react';
import { AdminAuthContext } from './AdminAuthContext.js';
import { API_URL } from '../config';

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.role === 'admin') {
            setAdmin(data);
          } else {
            setAdmin(null);
          }
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.error('Admin auth verification failed:', error);
        setAdmin(null);
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
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
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
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setAdmin(null);
    } catch (error) {
      console.error('Admin logout error:', error);
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};