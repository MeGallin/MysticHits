import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/fetchServices';
import {
  FiMail,
  FiLock,
  FiAlertTriangle,
  FiAlertCircle,
  FiUser,
  FiEye,
  FiEyeOff,
  FiUserPlus,
} from 'react-icons/fi';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Register() {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form validity state
  const [isFormValid, setIsFormValid] = useState(false);

  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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

  // Handle form submission
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

    // Reset submission states
    setIsSubmitting(true);
    setSubmitError(null);

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    try {
      // Call the API service to register
      const response = await registerUser(userData);

      if (response.success) {
        // Redirect to login page after successful registration
        navigate('/login');
      } else {
        // Handle error from API
        setSubmitError(
          response.error || 'Registration failed. Please try again.',
        );
      }
    } catch (err: any) {
      // Handle unexpected errors
      setSubmitError(err.message || 'An unexpected error occurred');
      console.error('Registration error:', err);
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
            Create Account
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            Join Mystic Hits for a personalized music experience
          </p>

          {/* Error Message */}
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
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-300" />
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="johndoe"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-custom-blue placeholder-gray-400"
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
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-custom-blue placeholder-gray-400"
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
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-300" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-custom-blue placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-white"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
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
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-300" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-custom-blue placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-white"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <div className="mt-1 text-red-400 text-sm flex items-center">
                  <FiAlertTriangle className="mr-1" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Password visibility toggle checkbox */}
            <div className="flex items-center space-x-2">
              <input
                id="show-passwords"
                type="checkbox"
                checked={showPassword && showConfirmPassword}
                onChange={() => {
                  setShowPassword(!showPassword);
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                className="h-4 w-4 border-gray-400 rounded bg-gray-700 text-blue-500 focus:ring-custom-blue focus:ring-offset-gray-800"
              />
              <label htmlFor="show-passwords" className="text-sm text-gray-200">
                Show passwords
              </label>
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
                  Creating account...
                </>
              ) : (
                <>
                  <FiUserPlus className="mr-2" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Links Section */}
          <div className="mt-6 text-sm text-center text-gray-200">
            <span>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                Log in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
