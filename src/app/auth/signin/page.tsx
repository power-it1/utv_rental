'use client';

import { useEffect, useState } from 'react';
import { authHelpers } from '@/lib/auth';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/my-rentals';

  useEffect(() => {
    const checkExistingSession = async () => {
      const { user } = await authHelpers.getCurrentUser();
      if (user) {
        window.location.href = redirectTo;
      }
    };

    checkExistingSession();
  }, [redirectTo]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await authHelpers.signIn(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else if (data.user) {
      // Force a hard refresh to update auth state
      window.location.href = redirectTo;
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-bold text-pine-700">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-rock-600">
            Welcome back! Please sign in to continue
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="card">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-pine-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-pine-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-rock-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-orange-500 hover:text-orange-600">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </form>

        <div className="text-center">
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}