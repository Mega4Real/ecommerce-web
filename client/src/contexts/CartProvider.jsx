import { useState, useEffect } from 'react';
import { CartContext } from './CartContext.js';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const validateDiscount = (newCart) => {
    if (!appliedDiscount) return;
    
    const newTotalItems = newCart.reduce((acc, item) => acc + item.quantity, 0);
    if (appliedDiscount.min_quantity > 0 && newTotalItems < appliedDiscount.min_quantity) {
      setAppliedDiscount(null);
    }
  };

  const addToCart = (product, size) => {
    setCart(prev => {
      let newCart;
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        newCart = prev.map(item => 
          (item.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        newCart = [...prev, { ...product, selectedSize: size, quantity: 1 }];
      }
      validateDiscount(newCart);
      return newCart;
    });
  };

  const removeFromCart = (id, size) => {
    setCart(prev => {
      const newCart = prev.filter(item => !(item.id === id && item.selectedSize === size));
      validateDiscount(newCart);
      return newCart;
    });
  };

  const updateQuantity = (id, size, delta) => {
    setCart(prev => {
      const newCart = prev.map(item => {
        if (item.id === id && item.selectedSize === size) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      validateDiscount(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedDiscount(null);
  };

  const applyDiscount = (discount) => {
    setAppliedDiscount(discount);
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  // Re-calculate discount amount based on current subtotal
  const discountAmount = appliedDiscount 
    ? (appliedDiscount.type === 'percentage' 
        ? parseFloat(((subtotal * appliedDiscount.value) / 100).toFixed(2))
        : Math.min(appliedDiscount.value, subtotal))
    : 0;
  
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      totalItems, subtotal, total, appliedDiscount, applyDiscount, removeDiscount, discountAmount 
    }}>
      {children}
    </CartContext.Provider>
  );
};
