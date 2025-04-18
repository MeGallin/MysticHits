import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { contactServices } from '../../services/fetchServices';

// Icons
import {
  FiUser,
  FiMail,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
} from 'react-icons/fi';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const ContactPage: React.FC = () => {
  // Loading state for placeholder UI
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });

  // Validation state
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    message: '',
  });

  // Touched state (to show validation errors only after field is touched)
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    message: false,
  });

  // Form validity state
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form fields
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2)
          return 'Name must be at least 2 characters';
        if (value.trim().length > 50)
          return 'Name must be less than 50 characters';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_REGEX.test(value))
          return 'Please enter a valid email address';
        return '';

      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10)
          return 'Message must be at least 10 characters';
        if (value.trim().length > 500)
          return 'Message must be less than 500 characters';
        return '';

      default:
        return '';
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field and update errors
    const errorMessage = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  // Handle field blur (to mark as touched)
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // Check if the entire form is valid
  useEffect(() => {
    const { fullName, email, message } = formData;

    // Validate all fields
    const nameError = validateField('fullName', fullName);
    const emailError = validateField('email', email);
    const messageError = validateField('message', message);

    // Update form validity
    setIsFormValid(!nameError && !emailError && !messageError);
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset submission states
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      // Call the API service to submit the form
      const result = await contactServices.submitContactForm(formData);

      if (result.success) {
        // Handle successful submission
        setSubmitSuccess(true);

        // Reset form after successful submission
        setFormData({
          fullName: '',
          email: '',
          message: '',
        });
      } else {
        // Handle error from API
        setSubmitError(
          result.error || 'Failed to submit the form. Please try again.',
        );
      }
    } catch (error) {
      // Handle unexpected errors
      setSubmitError('An unexpected error occurred. Please try again later.');
      console.error('Contact form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      onBlur={handleBlur}
                      className="bg-gray-700/50 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                      placeholder="John Doe"
                    />
                  </div>
                  {touched.fullName && errors.fullName && (
                    <div className="mt-1 text-red-400 text-sm flex items-center">
                      <FiAlertTriangle className="mr-1" />
                      {errors.fullName}
                    </div>
                  )}
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
                      onBlur={handleBlur}
                      className="bg-gray-700/50 text-white w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                      placeholder="john@example.com"
                    />
                  </div>
                  {touched.email && errors.email && (
                    <div className="mt-1 text-red-400 text-sm flex items-center">
                      <FiAlertTriangle className="mr-1" />
                      {errors.email}
                    </div>
                  )}
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
                      onBlur={handleBlur}
                      rows={5}
                      className="bg-gray-700/50 text-white w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  {touched.message && errors.message && (
                    <div className="mt-1 text-red-400 text-sm flex items-center">
                      <FiAlertTriangle className="mr-1" />
                      {errors.message}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`w-full ${
                      isSubmitting || !isFormValid
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-custom-blue hover:bg-blue-600'
                    } text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                  <div className="mt-4 bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg flex items-start">
                    <FiCheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>
                      Thank you for your message! We'll get back to you as soon
                      as possible.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="mt-4 bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg flex items-start">
                    <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{submitError}</p>
                  </div>
                )}
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
