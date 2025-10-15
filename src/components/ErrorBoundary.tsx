'use client';

import { Component, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-sky-50 flex items-center justify-center px-4">
          <div className="card max-w-2xl text-center py-16">
            <div className="text-8xl mb-6">⚠️</div>
            <h1 className="text-4xl font-bold text-pine-700 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-rock-600 mb-8 max-w-md mx-auto">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working on it.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="font-mono text-sm text-red-800 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn-primary"
              >
                Try Again
              </button>
              <Link href="/" className="btn-secondary">
                Go to Homepage
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-sky-200">
              <p className="text-sm text-rock-500">
                If this problem persists, please{' '}
                <a href="mailto:support@adventurerentals.com" className="text-orange-500 hover:text-orange-600 font-medium">
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
