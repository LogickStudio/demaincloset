
import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
}

const FeaturedProductsSection: React.FC<FeaturedProductsProps> = ({ products, title = "Featured Products" }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50 rounded-lg">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
