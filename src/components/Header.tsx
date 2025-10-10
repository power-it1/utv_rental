'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { authHelpers } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const checkAdminRole = useCallback(async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to check admin role:', error);
      setIsAdmin(false);
      return;
    }

    const role =
      profile && typeof profile === 'object' && 'role' in profile && typeof (profile as { role: unknown }).role === 'string'
        ? (profile as { role: string }).role
        : null;

    setIsAdmin(role === 'admin');
  }, []);

  const checkUser = useCallback(async () => {
    const { user } = await authHelpers.getCurrentUser();
    setUser(user ?? null);
    if (user) {
      await checkAdminRole(user.id);
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  }, [checkAdminRole]);

  useEffect(() => {
    void checkUser();

    const { data: authListener } = authHelpers.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkAdminRole(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [checkAdminRole, checkUser]);

  const handleSignOut = async () => {
    await authHelpers.signOut();
    setUser(null);
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
  <nav className="site-container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-pine-700">Adventure Rentals</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/listings" className="text-rock-600 hover:text-orange-500 transition-colors">
              Browse Vehicles
            </Link>
            <Link href="/listings?type=guided_tour" className="text-rock-600 hover:text-orange-500 transition-colors">
              Guided Tours
            </Link>
            
            {loading ? (
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link href="/my-rentals" className="text-rock-600 hover:text-orange-500 transition-colors">
                  My Rentals
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                    👑 Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-rock-600 hover:text-orange-500 transition-colors"
                >
                  Sign Out
                </button>
                <div className="w-8 h-8 bg-pine-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="text-rock-600 hover:text-orange-500 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 text-rock"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-4 space-y-4">
              <Link 
                href="/listings" 
                className="block text-rock-600 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Vehicles
              </Link>
              <Link 
                href="/listings?type=guided_tour" 
                className="block text-rock-600 hover:text-orange-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Guided Tours
              </Link>
              
              {user ? (
                <>
                  <Link 
                    href="/my-rentals" 
                    className="block text-rock-600 hover:text-orange-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Rentals
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="block text-purple-600 hover:text-purple-700 font-medium transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👑 Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-rock-600 hover:text-orange-500 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin" 
                    className="block text-rock-600 hover:text-orange-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block btn-primary inline-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}