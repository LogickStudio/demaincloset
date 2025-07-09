
import React from 'react';
import { Link } from 'react-router-dom';

interface NotFoundPageProps {
  message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ message = "Oops! The page you're looking for doesn't exist." }) => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center px-4">
      <img 
        src="https://img.freepik.com/free-vector/404-error-with-a-cute-animal-concept-illustration_114360-1919.jpg?w=826"
        alt="404 Not Found Illustration" 
        className="w-64 h-64 object-contain mb-8"
      />
      <h1 className="text-5xl font-bold text-amber-500 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-8">{message}</p>
      <Link 
        to="/" 
        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
