
import React from 'react';
import { LOGO_TEXT, APP_NAME } from '../constants';

const BrandIntroSplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-amber-50 flex flex-col items-center justify-center z-50 p-8 text-center">
      <div className="animate-fade-in-slow">
        <h1 className="text-5xl font-bold text-amber-500 mb-6 tracking-wider">{LOGO_TEXT}</h1>
        <p className="text-2xl text-gray-800 mb-4">
          Welcome to {APP_NAME}!
        </p>
        <p className="text-lg max-w-xl mx-auto text-gray-700 leading-relaxed">
          Discover curated collections of chic and elegant fashion. Quality style is now within your reach.
        </p>
        <p className="mt-8 text-sm text-gray-600 opacity-75">Get ready to explore...</p>
      </div>
      <style>
        {`
          .animate-fade-in-slow {
            animation: fadeInSlow 2s ease-out forwards;
          }
          @keyframes fadeInSlow {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default BrandIntroSplashScreen;
