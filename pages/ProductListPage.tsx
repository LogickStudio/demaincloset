import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';

const ProductListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const { products: allProducts, loading } = useProducts();

  const filteredProducts = useMemo(() => {
    if (categoryFilter) {
      return allProducts.filter(product => product.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    return allProducts;
  }, [categoryFilter, allProducts]);

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        {categoryFilter ? `${categoryFilter} Products` : 'All Products'}
      </h1>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-xl">
          No products found {categoryFilter ? `in the ${categoryFilter} category` : ''}.
        </p>
      )}
    </div>
  );
};

export default ProductListPage;