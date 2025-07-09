
import React from 'react';
import { APP_NAME, LOGO_TEXT } from '../constants';
import { Link } from 'react-router-dom';
import Logo from '../components/icons/Logo';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 rounded-lg shadow-xl">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-600">
          About {LOGO_TEXT}
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Your Trusted Source for Chic, Affordable Fashion.
        </p>
      </header>

      <section className="mb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="prose prose-lg text-gray-700">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Story</h2>
            <p>
              {APP_NAME} was born from a passion for sharing elegant, on-trend fashion without the luxury price tag. We noticed a growing need for high-quality, stylish pieces that are easily accessible. What started as a small idea has blossomed into a commitment to connect people with the confidence that comes from a great outfit.
            </p>
            <p>
              We work closely with designers and manufacturers to ensure every item we offer meets our stringent standards for quality and style. Our journey is one of dedication to making you look and feel your best.
            </p>
          </div>
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg shadow-inner">
            <Logo className="w-full max-w-sm text-gray-700 h-auto" />
          </div>
        </div>
      </section>

      <section className="mb-16 bg-gray-50 p-8 rounded-lg">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">Our Mission & Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-medium text-amber-600 mb-3">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To provide our customers with the most stylish, high-quality fashion at affordable prices, ensuring an exceptional shopping experience and empowering everyone to express their unique style with confidence.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-medium text-amber-600 mb-3">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be the leading and most trusted online destination for affordable luxury fashion, celebrated for our commitment to quality, customer satisfaction, and trend-setting style.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Style', description: 'Curating on-trend and timeless pieces.', icon: 'fas fa-tshirt' },
              { title: 'Quality', description: 'Sourcing the best materials and craftsmanship.', icon: 'fas fa-gem' },
              { title: 'Affordability', description: 'Making elegant fashion accessible to everyone.', icon: 'fas fa-tag' },
              { title: 'Customer Focus', description: 'Putting our customers at the heart of everything we do.', icon: 'fas fa-users' },
              { title: 'Integrity', description: 'Operating with honesty and transparency.', icon: 'fas fa-handshake' },
              { title: 'Passion', description: 'A deep love for fashion and helping people shine.', icon: 'fas fa-heart' }
            ].map(value => (
              <div key={value.title} className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200 hover:shadow-lg transition-shadow">
                <i className={`${value.icon} text-3xl text-amber-500 mb-3`}></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="text-center mt-12">
         <Link 
            to="/products" 
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
          >
            Explore Our Collection
          </Link>
      </section>
    </div>
  );
};

export default AboutPage;