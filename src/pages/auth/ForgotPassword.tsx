import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../../services/fetchServices';
import {
  FiMail,
  FiAlertTriangle,
  FiAlertCircle,
  FiArrowLeft,
} from 'react-icons/fi';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });

  // Validate email
  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address';
    return '';
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const error = validateEmail(value);
    setEmailError(error);
  };

  // Handle field blur (to mark as touched)
  const handleBlur = () => {
    setTouched(true);
  };

  // Check if the form is valid
  useEffect(() => {
    setIsFormValid(!validateEmail(email));
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setTouched(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: null });

    try {
      const response = await requestPasswordReset(email);

      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message:
            'Reset link sent! Please check your email and follow the instructions to reset your password.',
        });
        setEmail(''); // Clear the form
      } else {
        setSubmitStatus({
          type: 'error',
          message:
            response.error || 'Failed to send reset link. Please try again.',
        });
      }
    } catch (err: any) {
      setSubmitStatus({
        type: 'error',
        message: err.message || 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Reset Password
        </h1>

        {submitStatus.type === 'success' ? (
          <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg flex items-start mb-4">
            <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{submitStatus.message}</p>
          </div>
        ) : submitStatus.type === 'error' ? (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg flex items-start mb-4">
            <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{submitStatus.message}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {touched && emailError && (
              <div className="mt-1 text-red-400 text-sm flex items-center">
                <FiAlertTriangle className="mr-1" />
                {emailError}
              </div>
            )}

            <p className="text-sm text-gray-400 mt-2">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 ${
              isFormValid
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-500 cursor-not-allowed'
            } text-white font-medium rounded transition duration-300 flex items-center justify-center`}
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
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-6 text-sm text-center">
          <Link
            to="/login"
            className="text-blue-500 hover:underline flex items-center justify-center"
          >
            <FiArrowLeft className="mr-1" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
