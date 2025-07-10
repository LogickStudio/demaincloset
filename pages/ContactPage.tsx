import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: '', type: 'success' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ text: '', type: 'success' });

    try {
      const { error } = await supabase.from('messages').insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }]);

      if (error) throw error;

      setFormMessage({ text: 'Thank you! Your message has been sent successfully.', type: 'success' });
      setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' }); // Reset form
    } catch (error: any) {
      setFormMessage({ text: 'Sorry, there was an error sending your message. Please try again later.', type: 'error' });
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 rounded-lg shadow-xl">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-600">Contact Us</h1>
          <p className="mt-4 text-xl text-gray-600">We'd love to hear from you!</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Get in Touch</h2>
              <p className="text-gray-700 leading-relaxed">Have a question about an order, a product, or just want to say hello? Use the form or contact us directly through the details below.</p>
            </div>
            <div className="flex items-start space-x-4">
              <i className="fas fa-map-marker-alt text-amber-500 text-2xl mt-1"></i>
              <div>
                <h3 className="font-semibold text-gray-800">Our Address</h3>
                <p className="text-gray-600">Abuja, FCT, Nigeria</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <i className="fas fa-envelope text-amber-500 text-2xl mt-1"></i>
              <div>
                <h3 className="font-semibold text-gray-800">Email Us</h3>
                <a href="mailto:support@demaincloset.com" className="text-gray-600 hover:text-amber-600">support@demaincloset.com</a>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <i className="fas fa-phone text-amber-500 text-2xl mt-1"></i>
              <div>
                <h3 className="font-semibold text-gray-800">Call Us</h3>
                <a href="tel:+2349053223790" className="text-gray-600 hover:text-amber-600">+234 905 322 3790</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-lg">
            {formMessage.text && (
              <div className={`p-3 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {formMessage.text}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"/>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea name="message" id="message" rows={5} value={formData.message} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white text-black placeholder-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"></textarea>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
