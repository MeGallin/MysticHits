import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Only log to server in development or if we have a proper logging endpoint
    this.logErrorToServer(error, errorInfo);
  }

  logErrorToServer = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Check if we're in development mode using import.meta.env instead of process
      const isDevelopment =
        import.meta.env?.DEV || import.meta.env?.MODE === 'development';

      if (isDevelopment) {
        console.warn('Development mode - not sending error to server:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });
        return;
      }

      // In production, you might want to send errors to a logging service
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: error.message,
      //     stack: error.stack,
      //     componentStack: errorInfo.componentStack,
      //     timestamp: new Date().toISOString(),
      //   }),
      // }).catch(err => console.error('Failed to log error to server:', err));
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500/30 rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-300 mb-6">
              An unexpected error occurred. Please refresh the page to try
              again.
            </p>

            {/* Show error details in development */}
            {import.meta.env?.DEV && this.state.error && (
              <details className="text-left mb-4">
                <summary className="text-red-400 cursor-pointer">
                  Error Details
                </summary>
                <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-32 bg-gray-900 p-2 rounded">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
