import React, { useState } from 'react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

// Icons
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
} from 'react-icons/fi';

const ContactPage: React.FC = () => {
  // Loading state for placeholder UI
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission will be implemented in Ticket 7
    console.log('Form submitted:', formData);
    alert(
      'Form submitted successfully! (This is a placeholder - actual API submission will be implemented in the next ticket)',
    );

    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  // Simulate loading for demonstration purposes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>

      {/* Animated background elements - keeping the same style as the main app */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="bg-gray-800/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl max-w-3xl w-full">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Contact Us
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            Have questions or feedback about Mystic Hits? We'd love to hear from
            you!
          </p>

          {isLoading ? (
            // Placeholder UI while loading
            <div className="space-y-4 animate-pulse">
              <div className="h-14 bg-gray-700/50 rounded-lg"></div>
              <div className="h-14 bg-gray-700/50 rounded-lg"></div>
              <div className="h-14 bg-gray-700/50 rounded-lg"></div>
              <div className="h-14 bg-gray-700/50 rounded-lg"></div>
            </div>
          ) : (
            // Contact Form Section - Full Width
            <div className="w-full">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-white font-medium"
                  >
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-gray-700/50 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-white font-medium"
                  >
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-gray-700/50 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-white font-medium"
                  >
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="bg-gray-700/50 text-white w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    className="w-full bg-custom-blue hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                  >
                    <FiSend className="mr-2" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Back to Home button */}
          <div className="flex justify-center mt-8">
            <Link
              to="/"
              className="px-6 py-2 bg-custom-blue hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
