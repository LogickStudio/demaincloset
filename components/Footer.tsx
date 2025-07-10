import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, LOGO_TEXT } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-amber-500 mb-4">{LOGO_TEXT}</h3>
            <p className="text-gray-400 text-sm">
              Elegance within reach. Your destination for chic, affordable fashion.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-amber-400 transition duration-300 text-gray-300">Home</Link></li>
              <li><Link to="/products" className="hover:text-amber-400 transition duration-300 text-gray-300">All Products</Link></li>
              <li><Link to="/cart" className="hover:text-amber-400 transition duration-300 text-gray-300">Your Cart</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition duration-300 text-gray-300">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition duration-300 text-gray-300">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <p className="text-gray-400 mb-2">Email: alabikaothar430@gmail.com</p>
            <p className="text-gray-400">Phone: 08131972375</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-amber-400"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-amber-400"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-amber-400"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved.</p>
           <div className="mt-4">
            <Link to="/admin/login" className="text-gray-500 hover:text-amber-500 transition-colors text-xs uppercase tracking-wider">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;