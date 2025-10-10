'use client';

import { useState } from 'react';
import { authHelpers } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await authHelpers.signUp(
      email, 
      password, 
      { full_name: fullName }
    );

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else if (data.user) {
      setSuccess(true);
      setLoading(false);
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="card">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-pine-700 mb-4">
              Account Created Successfully!
            </h2>
            <p className="text-rock-600 mb-6">
              Please check your email to verify your account. YouYou'll be redirectedapos;ll be redirected to sign in shortly.
            </p>
            <Link href="/auth/signin" className="btn-primary">
              Continue to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-bold text-pine">
            Create your account
          </h2>
          <p className="mt-2 text-center text-rock">
            Join us and start your adventure today
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="card">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-pine-700 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  placeholder="Create a secure password"
                />
                <p className="mt-1 text-xs text-rock">
                  Password must be at least 6 characters long
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-rock">
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-medium text-orange-500 hover:text-orange-600">
                  Sign in here
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