import React, { useState } from 'react';
import StarIcon from './icons/StarIcon';

interface StarRatingProps {
  rating: number; // Current rating value (0-5)
  interactive?: boolean; // If true, allows user interaction
  onRatingChange?: (newRating: number) => void; // Callback when rating changes
  size?: string; // Tailwind size class for stars (e.g., 'h-6 w-6')
  starColor?: string; // Tailwind color class for filled stars (e.g., 'text-yellow-500')
  totalStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onRatingChange,
  size = 'h-5 w-5',
  starColor = 'text-yellow-400',
  totalStars = 5,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleStarClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div className="flex items-center" onMouseLeave={handleMouseLeave} role="img" aria-label={`Rating: ${rating} out of ${totalStars} stars`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = hoverRating
          ? starValue <= hoverRating
          : starValue <= rating;
        
        if (interactive) {
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              className={`p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 rounded-sm ${interactive ? 'cursor-pointer' : ''}`}
              aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
              aria-pressed={interactive && starValue === rating}
            >
              <StarIcon filled={isFilled} size={size} color={starColor} />
            </button>
          );
        }
        return <StarIcon key={index} filled={isFilled} size={size} color={starColor} className="mr-0.5" />;
      })}
    </div>
  );
};

export default StarRating;