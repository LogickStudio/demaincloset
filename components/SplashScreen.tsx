
import React from 'react';
import { LOGO_TEXT, HERO_TAGLINE } from '../constants';

const SplashScreen: React.FC = () => {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fade-in-splash {
          animation: fadeIn 1.5s ease-out forwards;
        }
        .animate-subtle-pulse {
            animation: pulse 3s ease-in-out infinite;
        }
        .loading-bar-inner {
          animation: loading-bar 2s ease-out forwards;
        }
      `}</style>
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 text-white">
        <div className="text-center animate-fade-in-splash">
          <h1 className="text-6xl font-bold text-amber-400 tracking-wider animate-subtle-pulse" style={{ animationDelay: '0.5s' }}>
            {LOGO_TEXT}
          </h1>
          <p className="text-amber-200 text-center mt-3 text-lg">
            {HERO_TAGLINE}
          </p>
        </div>
        
        {/* Simple Loading Bar */}
        <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden mt-8 absolute bottom-24">
          <div className="h-full bg-amber-400 rounded-full loading-bar-inner"></div>
        </div>
        
      </div>
    </>
  );
};

export default SplashScreen;
