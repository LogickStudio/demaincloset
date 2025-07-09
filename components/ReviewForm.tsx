import React, { useState } from 'react';
import StarRating from './StarRating';
import { useAuth } from '../hooks/useAuth';

interface ReviewFormProps {
  productId: string;
  onSubmitReview: (review: { rating: number, comment: string }) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSubmitReview, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!user) {
        setError('You must be logged in to submit a review.');
        return;
    }

    onSubmitReview({
      rating,
      comment: comment.trim(),
    });
    setRating(0);
    setComment('');
  };

  if (!user) {
    return (
      <p className="text-sm text-gray-600 p-4 bg-gray-100 rounded-md">
        Please <a href="#/login" className="text-amber-600 hover:underline font-medium">log in</a> to write a review.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-6 px-4 sm:px-6 bg-gray-50 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Write a Review</h3>
      {error && <p className="text-red-500 text-sm mb-3 bg-red-100 p-2 rounded-md">{error}</p>}
      
      <div className="mb-4">
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Your Rating*</label>
        <StarRating rating={rating} interactive onRatingChange={setRating} size="h-7 w-7" />
      </div>

      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about the product..."
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white text-black placeholder-gray-600 transition"
        ></textarea>
      </div>

      <div className="flex items-center justify-end space-x-3">
        {onCancel && (
             <button
             type="button"
             onClick={onCancel}
             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
           >
             Cancel
           </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75"
        >
          Submit Review
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;