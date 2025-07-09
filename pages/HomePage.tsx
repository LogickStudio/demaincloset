
import React from 'react';
import HeroBanner from '../components/HeroBanner';
import CategoryCard from '../components/CategoryCard';
import FeaturedProductsSection from '../components/FeaturedProductsSection';
import AboutUsSection from '../components/AboutUsSection';
import TestimonialCard from '../components/TestimonialCard';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES, TESTIMONIALS } from '../constants';

const HomePage: React.FC = () => {
  const { products: allProducts } = useProducts();
  // Select first 4 products as featured, or customize as needed
  const featuredProducts = allProducts.slice(0, 4);

  return (
    <div className="space-y-12 md:space-y-16">
      <HeroBanner />

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {CATEGORIES.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <FeaturedProductsSection products={featuredProducts} />
      
      <AboutUsSection />

      {/* Testimonials Section */}
      <section className="py-12 bg-amber-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
