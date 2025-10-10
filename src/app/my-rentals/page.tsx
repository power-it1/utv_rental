'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { authHelpers } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Rental {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  vehicle: {
    id: string;
    name: string;
    type: 'motorcycle' | 'utv' | 'guided_tour';
    price_per_day: number;
  };
}

export default function MyRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchRentals();
  }, []);

  const checkAuthAndFetchRentals = async () => {
    const { user } = await authHelpers.getCurrentUser();
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    setUser(user);
    await fetchRentals(user.id);
  };

  const fetchRentals = async (userId: string) => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        vehicle:vehicles(id, name, type, price_per_day)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching rentals:', error);
    } else {
      setRentals(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-pine-700-100 text-pine-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-sand-700-100 text-sand-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'motorcycle': return '🏍️';
      case 'utv': return '🚛';
      case 'guided_tour': return '🗺️';
      default: return '🚗';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rock-600 text-lg">Loading your rentals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="site-container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-pine-700 mb-4">
              My Rentals
            </h1>
            <p className="text-xl text-rock">
              Track and manage your vehicle rentals
            </p>
          </div>
          <Link href="/listings" className="btn-primary">
            Browse More Vehicles
          </Link>
        </div>

        {/* Rentals List */}
        {rentals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold text-pine-700 mb-2">No rentals yet</h3>
            <p className="text-rock-600 mb-6">
              You havenhaven't made anyapos;t made any rentals yet. Start exploring our available vehicles!
            </p>
            <Link href="/listings" className="btn-primary">
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {rentals.map((rental) => (
              <div key={rental.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                    <div className="text-3xl">{getTypeIcon(rental.vehicle.type)}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-pine-700 mb-1">
                        {rental.vehicle.name}
                      </h3>
                      <p className="text-rock-600 text-sm mb-2">
                        {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rental.status)}`}>
                        {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:items-end space-y-2">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-orange">
                        ${rental.total_price}
                      </span>
                      <span className="text-rock-600 text-sm ml-1">total</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        href={`/rentals/${rental.id}`}
                        className="bg-pine-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-pine-700-600 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                      
                      {rental.status === 'pending' && (
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {rental.notes && (
                  <div className="mt-4 p-4 bg-sand-700-50 rounded-lg">
                    <p className="text-rock-600 text-sm">
                      <strong>Note:</strong> {rental.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}