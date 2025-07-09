import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewItemProps {
  review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="py-6 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start">
        <img
          src={review.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.user_name)}`}
          alt={`${review.user_name}'s avatar`}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover"
          onError={(e) => (e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.user_name)}`)}
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
            <h4 className="text-base sm:text-lg font-semibold text-gray-800">{review.user_name}</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">{formatDate(review.created_at)}</p>
          </div>
          <div className="mb-2">
            <StarRating rating={review.rating} size="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          {review.comment && (
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;