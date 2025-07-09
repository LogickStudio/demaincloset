import React from 'react';
import { Testimonial } from '../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <img 
        src={testimonial.avatar} 
        alt={testimonial.name} 
        className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-amber-200"
        onError={(e) => (e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(testimonial.name)}`)}
      />
      <p className="text-gray-600 italic text-center mb-4">"{testimonial.text}"</p>
      <h4 className="text-xl font-semibold text-amber-600 text-center">{testimonial.name}</h4>
      <p className="text-gray-500 text-sm text-center">{testimonial.role}</p>
    </div>
  );
};

export default TestimonialCard;