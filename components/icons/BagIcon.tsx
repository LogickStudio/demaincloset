import React from 'react';

const BagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M18,6A4,4,0,0,0,14,2H10A4,4,0,0,0,6,6V8H4V20A2,2,0,0,0,6,22H18A2,2,0,0,0,20,20V8H18ZM10,4h4a2,2,0,0,1,2,2V8H8V6A2,2,0,0,1,10,4Z" />
    </svg>
);

export default BagIcon;