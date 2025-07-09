
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  // Use the first variant as the default for display and adding to cart from card
  const defaultVariant = product.variants[0];
  const allVariantsOutOfStock = product.variants.every(v => v.stock <= 0);

  if (!defaultVariant) {
    // Should not happen if product data is correct
    return <div className="p-4 text-red-500">Product data error.</div>;
  }

  const handleAddToCart = () => {
    addToCart(product, defaultVariant, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
      <Link to={`/product/${product.id}`} className="block relative">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-56 object-cover" 
          onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/400x300/E0E0E0/BDBDBD?text=Image+Not+Found`)}
        />
        {allVariantsOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold py-1 px-4 rounded-full text-sm tracking-wider">OUT OF STOCK</span>
          </div>
        )}
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide mb-2">{product.category}</span>
        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={product.name}>
          <Link to={`/product/${product.id}`} className="hover:text-amber-600">{product.name}</Link>
        </h3>
        <p className="text-gray-600 text-sm mb-1">
          {product.variants.length > 1 
            ? `${product.variants.length} options available` 
            : defaultVariant.size}
        </p>
        <p className="text-2xl font-bold text-amber-600 mb-4">
          {product.variants.length > 1 ? `From ` : ''}₦{defaultVariant.price.toLocaleString()}
        </p>
        
        {product.variants.length > 1 ? (
           <Link 
            to={`/product/${product.id}`}
            className="mt-auto w-full text-center bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
          >
            {allVariantsOutOfStock ? 'View Options' : 'Select Options'}
          </Link>
        ) : (
          <button 
            onClick={handleAddToCart}
            className="mt-auto w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!defaultVariant || defaultVariant.stock <= 0}
          >
            {!defaultVariant || defaultVariant.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}

      </div>
    </div>
  );
};

export default ProductCard;