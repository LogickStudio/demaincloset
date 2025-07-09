
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { LOGO_TEXT } from '../constants';
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import UserIcon from './icons/UserIcon';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';

interface NavLink {
  path: string;
  label: string;
}

const Navbar: React.FC = () => {
  const { getItemCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItemsInCart = getItemCount();

  const navLinks: NavLink[] = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact Us' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-3xl font-bold text-amber-500">
            {LOGO_TEXT}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
                <Link key={link.path} to={link.path} className="text-gray-700 hover:text-amber-500 transition duration-300 font-medium">
                  {link.label}
                </Link>
              )
            )}
            {isAuthenticated ? (
                <>
                 <Link to="/dashboard" className="text-gray-700 hover:text-amber-500 transition duration-300" aria-label="Dashboard">
                    <UserIcon />
                  </Link>
                  <button onClick={logout} className="px-3 py-1 border border-transparent text-amber-600 rounded-md hover:bg-amber-50 hover:border-amber-200 transition-all duration-300 font-medium">
                    Logout
                  </button>
                </>
            ) : (
                <>
                    <Link to="/login" className="text-gray-700 hover:text-amber-500 transition duration-300 font-medium">
                      Login
                    </Link>
                    <Link to="/signup" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm">
                      Sign Up
                    </Link>
                </>
            )}

            <Link to="/cart" className="relative text-gray-700 hover:text-amber-500 transition duration-300" aria-label={`View cart with ${totalItemsInCart} items`}>
              <ShoppingCartIcon />
              {totalItemsInCart > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItemsInCart}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative text-gray-700 hover:text-amber-500 mr-4" aria-label={`View cart with ${totalItemsInCart} items`}>
              <ShoppingCartIcon />
              {totalItemsInCart > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItemsInCart}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-700 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white shadow-lg absolute w-full">
          <div className="flex flex-col px-4 pt-2 pb-4 space-y-2">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className="block text-gray-700 hover:text-amber-500 py-2 transition duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            <hr className="my-2 border-gray-200" />

            {isAuthenticated ? (
               <>
                <Link 
                  to="/dashboard"
                  className="block text-gray-700 hover:text-amber-500 py-2 transition duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-red-600 hover:text-red-800 py-2 transition duration-300 font-medium"
                >
                  Logout
                </button>
               </>
            ) : (
                <>
                <Link 
                    to="/login"
                    className="block text-gray-700 hover:text-amber-500 py-2 transition duration-300 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    Login
                </Link>
                <Link 
                    to="/signup" 
                    className="block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 text-center rounded-lg transition duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    Sign Up
                </Link>
                </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
