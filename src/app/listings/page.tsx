'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getVehicleIcon, getVehicleTypeName, formatPrice, getVehiclePlaceholderImage } from '@/lib/vehicle-utils';
import Image from 'next/image';

interface Vehicle {
  id: string;
  type: 'motorcycle' | 'utv' | 'guided_tour';
  name: string;
  description: string | null;
  price_per_day: number;
  images: string[] | null;
  available: boolean;
  specifications: Record<string, any> | null;
}

function ListingsContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) {
      setSelectedType(type);
    }
  }, [searchParams]);

  const fetchVehicles = async () => {
    setLoading(true);
    let query = supabase.from('vehicles').select('*').eq('available', true);
    
    if (selectedType !== 'all') {
      query = query.eq('type', selectedType);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching vehicles:', error);
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, [selectedType]);

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'motorcycle': return 'Motorcycles';
      case 'utv': return 'UTVs';
      case 'guided_tour': return 'Guided Tours';
      default: return 'All Vehicles';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rock-600 text-lg">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="site-container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pine-700 mb-4">
            {getTypeDisplayName(selectedType)}
          </h1>
          <p className="text-xl text-rock">
            Find the perfect vehicle for your next adventure
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['all', 'motorcycle', 'utv', 'guided_tour'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedType === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-rock-600 hover:bg-sand-700'
              }`}
            >
              {getTypeDisplayName(type)}
            </button>
          ))}
        </div>

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-pine-700 mb-2">No vehicles found</h3>
            <p className="text-rock-600 mb-6">
              We dondon't have anyapos;t have any {selectedType === 'all' ? 'vehicles' : getTypeDisplayName(selectedType).toLowerCase()} available right now.
            </p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="card hover:shadow-lg transition-shadow">
                {/* Vehicle Image */}
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <Image
                      src={vehicle.images[0]}
                      alt={vehicle.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={getVehiclePlaceholderImage(vehicle.type)}
                      alt={vehicle.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                
                {/* Vehicle Info */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-pine-700 text-white text-sm rounded-full mb-2">
                    {getVehicleIcon(vehicle.type)} {getTypeDisplayName(vehicle.type).slice(0, -1)}
                  </span>
                  <h3 className="text-xl font-semibold text-pine-700 mb-2">{vehicle.name}</h3>
                  <p className="text-rock-600 text-sm mb-4 line-clamp-3">
                    {vehicle.description || 'No description available'}
                  </p>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-orange-500">
                      {formatPrice(vehicle.price_per_day)}
                    </span>
                    <span className="text-rock-600 text-sm">/day</span>
                  </div>
                  <Link 
                    href={`/listings/${vehicle.id}`}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-rock-600 text-lg">Loading...</p>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ListingsContent />
    </Suspense>
  );
}