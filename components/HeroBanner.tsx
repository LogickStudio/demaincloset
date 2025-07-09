
import React from 'react';
import { Link } from 'react-router-dom';
import { HERO_TAGLINE, HERO_CTA_TEXT, HERO_IMAGE_URL } from '../constants';

const HeroBanner: React.FC = () => {
  return (
    <div 
      className="relative bg-cover bg-center rounded-lg shadow-xl overflow-hidden min-h-[300px] md:min-h-[400px] lg:min-h-[500px] flex items-center justify-center text-center text-white"
      style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 p-8 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {HERO_TAGLINE}
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-200">
          Explore curated collections of timeless style and modern trends.
        </p>
        <Link 
          to="/products"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-400"
        >
          {HERO_CTA_TEXT}
        </Link>
      </div>
    </div>
  );
};

export default HeroBanner;
