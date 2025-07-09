
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link to={category.path} className="block group">
      <div className="bg-amber-50 rounded-lg shadow-md aspect-square transform group-hover:scale-105 group-hover:shadow-xl group-hover:bg-amber-100 transition-all duration-300 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="text-amber-500 w-2/3 h-2/3 max-w-[100px] max-h-[100px] group-hover:text-amber-600 transition-colors duration-300">
          {category.icon}
        </div>
        <h3 className="text-gray-800 text-base sm:text-lg font-bold mt-3 sm:mt-4 group-hover:text-black transition-colors duration-300">{category.name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;