import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './contexts/CartProvider.jsx'
import { AuthProvider } from './contexts/AuthProvider.jsx'
import { ProductsProvider } from './contexts/ProductsProvider.jsx'
import { WishlistProvider } from './contexts/WishlistProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  </React.StrictMode>,
)
