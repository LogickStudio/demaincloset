import React from 'react';

const JewelryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12,1.25a1,1,0,0,1,.84.45l8.75,10.5a1,1,0,0,1,0,1.1l-8.75,10.5a1,1,0,0,1-1.68,0L3.16,13.3a1,1,0,0,1,0-1.1L11.16,1.7A1,1,0,0,1,12,1.25Z" />
  </svg>
);

export default JewelryIcon;