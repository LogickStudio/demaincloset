import React from 'react';

const TshirtIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12,2A4,4,0,0,0,8,6H8A4,4,0,0,0,4.42,7.59L3.1,12.05A1,1,0,0,0,4,13.22L4,20A2,2,0,0,0,6,22H18A2,2,0,0,0,20,20V13.22A1,1,0,0,0,20.9,12.05L19.58,7.59A4,4,0,0,0,16,6H16A4,4,0,0,0,12,2Z" />
    </svg>
);

export default TshirtIcon;