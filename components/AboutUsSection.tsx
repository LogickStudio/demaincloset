
import React from 'react';
import { ABOUT_US_TEXT } from '../constants';
import Logo from './icons/Logo';

const AboutUsSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-50 rounded-lg shadow-inner">
             <Logo className="w-full max-w-xs text-gray-700 h-auto" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">About Us</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              {ABOUT_US_TEXT}
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Our commitment is to ensure every product you receive is fresh, hygienically prepared, and full of the authentic flavors you love.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;