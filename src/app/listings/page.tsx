'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getVehicleIcon, formatPrice, getVehiclePlaceholderImage } from '@/lib/vehicle-utils';
import Image from 'next/image';

type VehicleType = 'motorcycle' | 'utv' | 'guided_tour';

const LISTING_FILTERS: ReadonlyArray<VehicleType | 'all'> = ['all', 'motorcycle', 'utv', 'guided_tour'];

interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  description: string | null;
  price_per_day: number;
  images: string[] | null;
  available: boolean;
  specifications: Record<string, unknown> | null;
}

function ListingsContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<VehicleType | 'all'>('all');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type && LISTING_FILTERS.includes(type as VehicleType | 'all')) {
      setSelectedType(type === 'all' ? 'all' : (type as VehicleType));
    }
  }, [searchParams]);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ available: 'true' });
      if (selectedType !== 'all') {
        params.set('type', selectedType);
      }

      const response = await fetch(`/api/vehicles?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store',
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = payload?.error || 'Failed to load vehicles';
        setError(message);
        setVehicles([]);
        return;
      }

      const payload = (await response.json()) as { vehicles?: unknown };
      if (Array.isArray(payload.vehicles)) {
        const sanitized = payload.vehicles
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const record = item as Record<string, unknown>;
            if (typeof record.id !== 'string' || typeof record.name !== 'string') {
              return null;
            }

            const rawType = record.type;
            const vehicleType: VehicleType = rawType === 'motorcycle' || rawType === 'utv' || rawType === 'guided_tour'
              ? rawType
              : 'motorcycle';

            const vehicle: Vehicle = {
              id: record.id,
              name: record.name,
              type: vehicleType,
              description: typeof record.description === 'string' ? record.description : null,
              price_per_day: Number(record.price_per_day ?? 0),
              images: Array.isArray(record.images) ? (record.images as string[]) : null,
              available: typeof record.available === 'boolean' ? record.available : Boolean(record.available),
              specifications:
                record.specifications && typeof record.specifications === 'object'
                  ? (record.specifications as Record<string, unknown>)
                  : null,
            };

            return vehicle;
          })
          .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));
        setVehicles(sanitized);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('We hit a wave while loading vehicles. Please refresh.');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  const handleFilterChange = (type: VehicleType | 'all') => {
    setSelectedType(type);
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'all') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.replace(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
  };

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  const getTypeDisplayName = (type: VehicleType | 'all') => {
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
          {LISTING_FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-6 py-3 rounded-full font-medium transition-colors shadow-sm w-full sm:w-auto ${
                selectedType === type
                  ? 'bg-orange-500 text-white shadow-orange-200/60'
                  : 'bg-white/90 text-rock-600 hover:bg-sky-50'
              }`}
            >
              {getTypeDisplayName(type)}
            </button>
          ))}
        </div>

        {/* Vehicles Grid */}
        {error && (
          <div className="card border-orange-200 bg-white/80 text-center mb-10">
            <p className="text-orange-600 font-medium mb-1">{error}</p>
            <p className="text-rock-600 text-sm">If this continues, please check your connection or try again later.</p>
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-pine-700 mb-2">No vehicles found</h3>
            <p className="text-rock-600 mb-6">
              We don&apos;t have any {selectedType === 'all' ? 'vehicles' : getTypeDisplayName(selectedType).toLowerCase()} available right now.
            </p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="card hover:shadow-lg transition-shadow h-full flex flex-col">
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
                <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-2xl font-bold text-orange-500">
                      {formatPrice(vehicle.price_per_day)}
                    </span>
                    <span className="text-rock-600 text-sm">/day</span>
                  </div>
                  <Link 
                    href={`/listings/${vehicle.id}`}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors text-center w-full sm:w-auto"
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