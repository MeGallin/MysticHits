import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/fetchServices';
import {
  FiMail,
  FiLock,
  FiAlertTriangle,
  FiAlertCircle,
  FiUser,
} from 'react-icons/fi';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Validation state
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Touched state (to show validation errors only after field is touched)
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Validate form fields
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.trim().length < 3)
          return 'Username must be at least 3 characters';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_REGEX.test(value))
          return 'Please enter a valid email address';
        return '';

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

    // If this is confirmPassword, also validate password (for matching)
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
    const { username, email, password, confirmPassword } = formData;

    // Validate all fields
    const usernameError = validateField('username', username);
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    const confirmPasswordError = validateField(
      'confirmPassword',
      confirmPassword,
    );

    // Update form validity
    setIsFormValid(
      !usernameError && !emailError && !passwordError && !confirmPasswordError,
    );
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      // Mark all fields as touched to show validation errors
      setTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    try {
      // Note: registerUser now calls '/auth/signup' internally
      const response = await registerUser(userData);

      if (response.success) {
        // Redirect to login page after successful registration
        navigate('/login');
      } else {
        setSubmitError(
          response.error || 'Registration failed. Please try again.',
        );
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Create Account
        </h1>

        {submitError && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg flex items-start mb-4">
            <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="johndoe"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {touched.username && errors.username && (
              <div className="mt-1 text-red-400 text-sm flex items-center">
                <FiAlertTriangle className="mr-1" />
                {errors.username}
              </div>
            )}
          </div>

          {/* Email Field */}
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {touched.email && errors.email && (
              <div className="mt-1 text-red-400 text-sm flex items-center">
                <FiAlertTriangle className="mr-1" />
                {errors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password <span className="text-red-500">*</span>
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-sm text-center">
          <span>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
