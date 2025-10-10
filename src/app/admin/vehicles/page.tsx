'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';
import {
  getVehicleIcon,
  formatPrice,
  getVehiclePlaceholderImage,
} from '@/lib/vehicle-utils';

interface Coordinates {
  lat: number;
  lng: number;
  label?: string;
}

interface TrackingMetadata {
  status?: string;
  last_ping_at?: string;
  last_known_location?: Coordinates;
  history?: Array<{ timestamp: string; location: Coordinates }>;
}

interface Vehicle {
  id: string;
  type: 'motorcycle' | 'utv' | 'guided_tour';
  name: string;
  description: string | null;
  price_per_day: number;
  images: string[];
  available: boolean;
  specifications: Record<string, any>;
  created_at: string;
}

const SAMPLE_LOCATIONS: Record<Vehicle['type'] | 'default', Coordinates[]> = {
  motorcycle: [
    { lat: 20.5217, lng: -86.9557, label: 'Coastal Highway Lookout' },
    { lat: 21.1243, lng: -86.8617, label: 'Laguna Shores Scenic Loop' },
  ],
  utv: [
    { lat: 20.7052, lng: -86.9465, label: 'Coral Dunes Trailhead' },
    { lat: 20.8134, lng: -86.9962, label: 'Mangrove Safari Track' },
  ],
  guided_tour: [
    { lat: 20.6276, lng: -87.0739, label: 'Sunset Boardwalk Meetup' },
    { lat: 20.5743, lng: -87.1195, label: 'Cenote Explorer Rendezvous' },
  ],
  default: [
    { lat: 20.6531, lng: -86.9318, label: 'Beachside Depot' },
  ],
};

function jitteredLocation(type: Vehicle['type']): Coordinates {
  const pool = SAMPLE_LOCATIONS[type] ?? SAMPLE_LOCATIONS.default;
  const base = pool[Math.floor(Math.random() * pool.length)] ?? SAMPLE_LOCATIONS.default[0];
  const latOffset = (Math.random() - 0.5) * 0.01;
  const lngOffset = (Math.random() - 0.5) * 0.01;
  return {
    lat: Number((base.lat + latOffset).toFixed(5)),
    lng: Number((base.lng + lngOffset).toFixed(5)),
    label: base.label,
  };
}

function extractTracking(specs: Record<string, any> | null | undefined): TrackingMetadata | null {
  if (!specs || typeof specs !== 'object') return null;
  const raw = specs.gps_tracking;
  if (!raw || typeof raw !== 'object') return null;
  return {
    status: raw.status,
    last_ping_at: raw.last_ping_at,
    last_known_location: raw.last_known_location,
    history: Array.isArray(raw.history) ? raw.history : undefined,
  };
}

function formatRelativeTime(isoDate?: string) {
  if (!isoDate) return 'No pings yet';
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return 'Recently';
  const now = Date.now();
  const diffMs = target - now;
  const minutes = Math.round(diffMs / (1000 * 60));
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, 'minute');
  }
  if (Math.abs(hours) < 24) {
    return rtf.format(hours, 'hour');
  }
  return rtf.format(days, 'day');
}

export default function VehiclesPage() {
  const { showToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'motorcycle' | 'utv' | 'guided_tour'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [trackingVehicleId, setTrackingVehicleId] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, [filter, availabilityFilter]);

  async function fetchVehicles() {
    setLoading(true);
    let query = supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    if (availabilityFilter === 'available') {
      query = query.eq('available', true);
    } else if (availabilityFilter === 'unavailable') {
      query = query.eq('available', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vehicles:', error);
    } else {
      const normalized = (data || []).map((item) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        specifications:
          item.specifications && typeof item.specifications === 'object'
            ? item.specifications
            : {},
      }));
      setVehicles(normalized as Vehicle[]);
    }
    setLoading(false);
  }

  async function toggleAvailability(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('vehicles')
      .update({ available: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating vehicle:', error);
      alert('Failed to update vehicle availability');
    } else {
      fetchVehicles();
    }
  }

  async function requestGpsPing(vehicle: Vehicle) {
    setTrackingVehicleId(vehicle.id);
    const location = jitteredLocation(vehicle.type);
    const requestedAt = new Date().toISOString();
    const baseSpecs = (vehicle.specifications && typeof vehicle.specifications === 'object') ? vehicle.specifications : {};
    const gpsMeta = baseSpecs.gps_tracking && typeof baseSpecs.gps_tracking === 'object' ? baseSpecs.gps_tracking : {};
    const history = Array.isArray(gpsMeta.history) ? gpsMeta.history.slice(-4) : [];

    const updatedSpecs = {
      ...baseSpecs,
      gps_tracking: {
        status: 'tracking',
        last_ping_at: requestedAt,
        last_known_location: location,
        history: [...history, { timestamp: requestedAt, location }],
      },
    };

    const { error } = await supabase
      .from('vehicles')
      .update({ specifications: updatedSpecs })
      .eq('id', vehicle.id);

    if (error) {
      console.error('Error requesting GPS ping:', error);
      showToast('Failed to request GPS tracking. Please try again.', 'error');
    } else {
      showToast('GPS ping logged with the latest location.', 'success');
      await fetchVehicles();
    }

    setTrackingVehicleId(null);
  }

  function viewOnMap(location: Coordinates | undefined) {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    window.open(url, '_blank', 'noopener');
  }

  async function deleteVehicle(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle. It may have active rentals.');
    } else {
      fetchVehicles();
    }
  }

  function getTypeIcon(type: string) {
    return getVehicleIcon(type);
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'motorcycle':
        return 'Motorcycle';
      case 'utv':
        return 'UTV';
      case 'guided_tour':
        return 'Guided Tour';
      default:
        return type;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-pine-700 mb-2">Vehicles</h1>
          <p className="text-rock-600">Manage your rental fleet</p>
        </div>
        <Link
          href="/admin/vehicles/new"
          className="btn-primary inline-flex items-center"
        >
          <span className="mr-2">➕</span>
          Add Vehicle
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-rock-600 mb-2">Vehicle Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-rock-600 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('motorcycle')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'motorcycle'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-rock-600 hover:bg-gray-300'
                }`}
              >
                🏍️ Motorcycles
              </button>
              <button
                onClick={() => setFilter('utv')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'utv'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-rock-600 hover:bg-gray-300'
                }`}
              >
                🚛 UTVs
              </button>
              <button
                onClick={() => setFilter('guided_tour')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'guided_tour'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-rock-600 hover:bg-gray-300'
                }`}
              >
                🗺️ Tours
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-rock-600 mb-2">Availability</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  availabilityFilter === 'all'
                    ? 'bg-pine-700 text-white'
                    : 'bg-gray-200 text-rock-600 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAvailabilityFilter('available')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  availabilityFilter === 'available'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-rock-600 hover:bg-gray-300'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setAvailabilityFilter('unavailable')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  availabilityFilter === 'unavailable'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-rock-600 hover:bg-gray-300'
                }`}
              >
                Unavailable
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-rock-600">Loading vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">🚗</p>
          <p className="text-xl font-semibold text-pine-700 mb-2">No vehicles found</p>
          <p className="text-rock-600 mb-6">Add your first vehicle to get started</p>
          <Link href="/admin/vehicles/new" className="btn-primary inline-block">
            Add Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => {
            const tracking = extractTracking(vehicle.specifications);
            return (
              <div key={vehicle.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Vehicle Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
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
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-pine-700">{vehicle.name}</h3>
                        <span className="inline-block px-2 py-1 bg-pine-100 text-pine-700 text-xs font-medium rounded mt-1">
                          {getTypeIcon(vehicle.type)} {getTypeLabel(vehicle.type)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">{formatPrice(vehicle.price_per_day)}</p>
                        <p className="text-xs text-rock-600">per day</p>
                      </div>
                    </div>

                    <p className="text-rock-600 text-sm mb-4 line-clamp-2">
                      {vehicle.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          vehicle.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.available ? '✓ Available' : '✗ Unavailable'}
                      </span>
                    </div>

                    {tracking && (
                      <div className="mb-4 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-pine-700">
                        <p className="font-medium">Last GPS ping: {formatRelativeTime(tracking.last_ping_at)}</p>
                        {tracking.last_known_location && (
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-rock-600">
                            <span>
                              Location: {tracking.last_known_location.label ?? `${tracking.last_known_location.lat}, ${tracking.last_known_location.lng}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => viewOnMap(tracking.last_known_location)}
                              className="inline-flex items-center gap-1 font-medium text-sky-700 hover:text-sky-800"
                            >
                              View map ↗
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/vehicles/${vehicle.id}/edit`}
                        className="flex-1 min-w-[140px] text-center px-4 py-2 bg-pine-700 text-white rounded-lg font-medium hover:bg-pine-800 transition-colors text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => requestGpsPing(vehicle)}
                        disabled={trackingVehicleId === vehicle.id}
                        className={`flex-1 min-w-[140px] px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                          trackingVehicleId === vehicle.id
                            ? 'bg-sky-200 text-sky-700 cursor-wait'
                            : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                        }`}
                      >
                        {trackingVehicleId === vehicle.id ? 'Requesting GPS…' : 'Track via GPS'}
                      </button>
                      <button
                        onClick={() => toggleAvailability(vehicle.id, vehicle.available)}
                        className={`flex-1 min-w-[140px] px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                          vehicle.available
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {vehicle.available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => deleteVehicle(vehicle.id, vehicle.name)}
                        className="min-w-[100px] px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
