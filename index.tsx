import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { CouponProvider } from './contexts/CouponContext';
import { UserProvider } from './contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <AuthProvider>
          <CouponProvider>
            <ProductProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </ProductProvider>
          </CouponProvider>
        </AuthProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
