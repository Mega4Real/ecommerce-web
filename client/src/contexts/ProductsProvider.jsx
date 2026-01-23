import { useState, useEffect } from 'react';
import { ProductsContext } from './ProductsContext.js';
import { API_URL } from '../config';

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      // Transform database fields to camelCase
      const transformedProducts = data.map(product => ({
        ...product,
        originalPrice: product.original_price,
        newArrival: product.new_arrival,
        createdAt: product.created_at
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Could not load products. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (productData) => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const newProduct = await response.json();
        const transformedProduct = {
          ...newProduct,
          originalPrice: newProduct.original_price,
          newArrival: newProduct.new_arrival,
          createdAt: newProduct.created_at
        };
        setProducts(prev => [...prev, transformedProduct]);
        return true;
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
    return false;
  };

  const updateProduct = async (id, productData) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const transformedProduct = {
          ...updatedProduct,
          originalPrice: updatedProduct.original_price,
          newArrival: updatedProduct.new_arrival,
          createdAt: updatedProduct.created_at
        };
        setProducts(prev => prev.map(p => p.id === id ? transformedProduct : p));
        return true;
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
    return false;
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        return true;
      } else {
        let errorMsg = 'Failed to delete product';
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          const text = await response.text();
          errorMsg = `${response.status} ${response.statusText} - ${text}`;
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + error.message);
    }
    return false;
  };

  const toggleSoldStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}/sold`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const transformedProduct = {
          ...updatedProduct,
          originalPrice: updatedProduct.original_price,
          newArrival: updatedProduct.new_arrival,
          createdAt: updatedProduct.created_at
        };
        setProducts(prev => prev.map(p => p.id === id ? transformedProduct : p));
        return true;
      }
    } catch (error) {
      console.error('Error toggling sold status:', error);
    }
    return false;
  };

  return (
    <ProductsContext.Provider value={{ products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct, toggleSoldStatus }}>
      {children}
    </ProductsContext.Provider>
  );
};
