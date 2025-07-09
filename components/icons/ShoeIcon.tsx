import React from 'react';

const ShoeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.89,6.23l-3.21-3.21A2,2,0,0,0,16.27,2H8.43A4,4,0,0,0,4.72,5.17L2.09,11.39a1,1,0,0,0,.29,1.09L8,18H3a1,1,0,0,0,0,2H19a1,1,0,0,0,1-1V7.64A1,1,0,0,0,20.89,6.23ZM9.17,4H16v8.34l-5-5L9.17,4Z" />
  </svg>
);

export default ShoeIcon;