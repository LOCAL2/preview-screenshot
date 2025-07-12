'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium ml-4"
                >
                  Try Again
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-gray-700 font-medium">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-sm text-red-600 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
