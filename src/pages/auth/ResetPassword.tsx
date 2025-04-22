import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../services/fetchServices';
import {
  FiLock,
  FiAlertTriangle,
  FiAlertCircle,
  FiArrowLeft,
} from 'react-icons/fi';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Validation state
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  // Touched state (to show validation errors only after field is touched)
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string | null;
  }>({ type: null, message: null });
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form fields
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.trim().length < 6)
          return 'Password must be at least 6 characters';
        return '';

      case 'confirmPassword':
        if (!value.trim()) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';

      default:
        return '';
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // If this is password, also validate confirmPassword (for matching)
    if (name === 'password') {
      const confirmError =
        formData.confirmPassword && formData.confirmPassword !== value
          ? 'Passwords do not match'
          : '';

      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  // Handle field blur (to mark as touched)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // Check if the entire form is valid
  useEffect(() => {
    const { password, confirmPassword } = formData;

    // Validate all fields
    const passwordError = validateField('password', password);
    const confirmPasswordError = validateField(
      'confirmPassword',
      confirmPassword,
    );

    // Update form validity
    setIsFormValid(!passwordError && !confirmPasswordError);
  }, [formData]);

  // Verify token exists
  useEffect(() => {
    if (!token) {
      setSubmitStatus({
        type: 'error',
        message:
          'Invalid or missing reset token. Please request a new password reset link.',
      });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !token) {
      // Mark all fields as touched to show validation errors
      setTouched({
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: null });

    try {
      // Note: resetPassword now uses the token in the URL path instead of the request body
      const response = await resetPassword(token, formData.password);

      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message:
            'Password reset successful! You can now log in with your new password.',
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setSubmitStatus({
          type: 'error',
          message:
            response.error ||
            'Failed to reset password. The link may have expired.',
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

  // If no token, show error state
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Reset Password
          </h1>

          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg flex items-start mb-4">
            <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>
              Invalid or missing reset token. Please request a new password
              reset link.
            </p>
          </div>

          <div className="mt-6 text-sm text-center">
            <Link
              to="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Reset Your Password
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
          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {touched.password && errors.password && (
              <div className="mt-1 text-red-400 text-sm flex items-center">
                <FiAlertTriangle className="mr-1" />
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="mt-1 text-red-400 text-sm flex items-center">
                <FiAlertTriangle className="mr-1" />
                {errors.confirmPassword}
              </div>
            )}
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
                Resetting password...
              </>
            ) : (
              'Reset Password'
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
