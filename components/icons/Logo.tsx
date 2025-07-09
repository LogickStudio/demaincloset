import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 200 50" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Demain Closet Logo"
  >
    <text 
      x="50%" 
      y="30" 
      dominantBaseline="middle" 
      textAnchor="middle" 
      fontFamily="Garamond, serif" 
      fontSize="32" 
      fontWeight="600"
      letterSpacing="0.1em"
      fill="currentColor"
    >
      DEMAIN
    </text>
    <line x1="60" y1="40" x2="140" y2="40" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export default Logo;
