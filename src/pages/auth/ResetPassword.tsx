import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../services/fetchServices';
import {
  FiLock,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
} from 'react-icons/fi';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form validity state
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setSubmitError('Missing password reset token');
      return;
    }

    if (!isFormValid) {
      // Mark all fields as touched to show validation errors
      setTouched({
        password: true,
        confirmPassword: true,
      });
      return;
    }

    // Reset submission states
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      // Call the API service to reset password
      const response = await resetPassword(token, formData.password);

      if (response.success) {
        // Handle successful submission
        setSubmitSuccess(true);

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Handle error from API
        setSubmitError(
          response.error || 'Failed to reset password. Please try again.',
        );
      }
    } catch (err: any) {
      // Handle unexpected errors
      setSubmitError(err.message || 'An unexpected error occurred');
      console.error('Password reset error:', err);
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
            Reset Password
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            Enter your new password below
          </p>

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg flex items-start mb-4">
              <FiCheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>
                Your password has been reset successfully! You will be
                redirected to the login page in a few seconds...
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
              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  New Password <span className="text-red-400">*</span>
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
                <label
                  htmlFor="show-passwords"
                  className="text-sm text-gray-200"
                >
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
                    Resetting...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="mr-2" />
                    Reset Password
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
          </div>
        </div>
      </div>
    </div>
  );
}
