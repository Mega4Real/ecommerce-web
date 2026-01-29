import { useState, useEffect, useCallback } from 'react';
import { WishlistContext } from './WishlistContext.js';
import { useAuth } from './AuthContext.js';
import { API_URL } from '../config';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch wishlist when user logs in
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user, fetchWishlist]);

  const addToWishlist = async (productId) => {
    if (!user) {
      alert('Please log in to add items to your wishlist');
      return false;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        await fetchWishlist(); // Refresh wishlist
        return true;
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add to wishlist');
        return false;
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      alert('Failed to add to wishlist');
      return false;
    }
  };

const removeFromWishlist = async (productId) => {
    if (!user) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.id !== parseInt(productId)));
        return true;
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove from wishlist');
        return false;
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      alert('Failed to remove from wishlist');
      return false;
    }
  };

const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === parseInt(productId));
  };

const toggleWishlist = async (productId) => {
    const productIdNum = parseInt(productId);
    if (isInWishlist(productIdNum)) {
      return await removeFromWishlist(productIdNum);
    } else {
      return await addToWishlist(productIdNum);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
