import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Toast } from './ui/toast';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Log to server-side endpoint (optional)
    this.logErrorToServer(error, errorInfo);
  }

  logErrorToServer(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our backend API
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';
    
    axios.post(`${API_BASE_URL}/api/client-error`, {
      error: {
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }).catch(err => {
      // Silent catch - don't throw more errors from the error handler
      console.warn('Failed to send error to server:', err);
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
          <div className="bg-red-900/20 backdrop-blur-sm border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-6">
              We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
            </p>
            <button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
              onClick={() => window.location.reload()}
            >
              Refresh the page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;