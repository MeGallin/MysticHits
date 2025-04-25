import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../services/fetchServices';
import {
  FiMail,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiSend,
} from 'react-icons/fi';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPassword() {
  // Form state
  const [email, setEmail] = useState('');

  // Validation state
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form validity state
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate email
  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
    return '';
  };

  // Handle email input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Validate and update error
    const error = validateEmail(value);
    setEmailError(error);
  };

  // Handle field blur
  const handleBlur = () => {
    setTouched(true);
  };

  // Check if the form is valid
  useEffect(() => {
    setIsFormValid(!emailError);
  }, [emailError]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      // Mark field as touched to show validation error
      setTouched(true);
      return;
    }

    // Reset submission states
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      // Call the API service to request password reset
      const response = await requestPasswordReset(email);

      if (response.success) {
        // Handle successful submission
        setSubmitSuccess(true);
      } else {
        // Handle error from API
        setSubmitError(
          response.error ||
            'Failed to request password reset. Please try again.',
        );
      }
    } catch (err: any) {
      // Handle unexpected errors
      setSubmitError(err.message || 'An unexpected error occurred');
      console.error('Password reset request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,50,255,0.15),transparent_70%)] pointer-events-none"></div>

      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="bg-gray-800/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Forgot Password
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            Enter your email address and we'll send you instructions to reset
            your password
          </p>

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg flex items-start mb-4">
              <FiCheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>
                Password reset instructions have been sent to your email. Please
                check your inbox and follow the instructions.
              </p>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg flex items-start mb-4">
              <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{submitError}</p>
            </div>
          )}

          {!submitSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-300" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-custom-blue placeholder-gray-400"
                    required
                  />
                </div>
                {touched && emailError && (
                  <div className="mt-1 text-red-400 text-sm flex items-center">
                    <FiAlertTriangle className="mr-1" />
                    {emailError}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-full py-3 px-4 ${
                  isFormValid
                    ? 'bg-custom-blue hover:bg-blue-600'
                    : 'bg-gray-500 cursor-not-allowed'
                } text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center`}
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
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          )}

          {/* Links Section */}
          <div className="mt-6 flex flex-col gap-2 text-sm text-center text-gray-200">
            <span>
              Remembered your password?{' '}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                Back to Login
              </Link>
            </span>
            <span>
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                Register
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
