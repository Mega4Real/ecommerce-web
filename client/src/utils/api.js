import { API_URL } from '../config';

/**
 * Helper function for making authenticated API requests
 * Automatically adds Authorization header with JWT token
 */
export const fetchWithAuth = async (endpoint, options = {}) => {
  // Get token from localStorage (try admin token first, then user token)
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  
  // Merge headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return response;
};

/**
 * Helper function for making authenticated API requests with admin token specifically
 */
export const fetchWithAdminAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return response;
};

/**
 * Helper function for making authenticated API requests with user token specifically
 */
export const fetchWithUserAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return response;
};
