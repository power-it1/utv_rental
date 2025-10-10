import { createClient } from '@/lib/supabase';
import Link from 'next/link';

type RentalStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

interface RecentRental {
  id: string;
  status: RentalStatus;
  total_price: number | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
  } | null;
  vehicles: {
    name: string | null;
    type: string | null;
  } | null;
}

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  totalRentals: number;
  activeRentals: number;
  pendingRentals: number;
  totalCustomers: number;
  recentRentals: RecentRental[];
  totalRevenue: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get counts
  const [
    totalVehiclesResponse,
    availableVehiclesResponse,
    totalRentalsResponse,
    activeRentalsResponse,
    pendingRentalsResponse,
    totalCustomersResponse,
  ] = await Promise.all([
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('available', true),
    supabase.from('rentals').select('*', { count: 'exact', head: true }),
    supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('rentals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  // Get recent rentals
  const { data: recentRentalsRaw } = await supabase
    .from('rentals')
    .select(`
      id,
      status,
      total_price,
      created_at,
      profiles:user_id(full_name, phone),
      vehicles:vehicle_id(name, type)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get revenue data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: revenueData } = await supabase
    .from('rentals')
    .select('total_price, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .in('status', ['confirmed', 'active', 'completed']);
  const totalRevenue = (revenueData ?? []).reduce((sum, rental) => {
    const price = typeof rental.total_price === 'number' ? rental.total_price : Number(rental.total_price ?? 0)
    return sum + price
  }, 0);

  const parseStatus = (status: unknown): RentalStatus => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'active':
      case 'completed':
      case 'cancelled':
        return status
      default:
        return 'pending'
    }
  };

  const coerceProfile = (profile: unknown): RecentRental['profiles'] => {
    if (profile && typeof profile === 'object') {
      const record = profile as Record<string, unknown>;
      return {
        full_name: typeof record.full_name === 'string' ? record.full_name : null,
        phone: typeof record.phone === 'string' ? record.phone : null,
      };
    }
    return null;
  };

  const coerceVehicle = (vehicle: unknown): RecentRental['vehicles'] => {
    if (vehicle && typeof vehicle === 'object') {
      const record = vehicle as Record<string, unknown>;
      return {
        name: typeof record.name === 'string' ? record.name : null,
        type: typeof record.type === 'string' ? record.type : null,
      };
    }
    return null;
  };

  const toRecentRental = (rental: unknown): RecentRental | null => {
    if (!rental || typeof rental !== 'object') return null;
    const record = rental as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.created_at !== 'string') {
      return null;
    }

    return {
      id: record.id,
      status: parseStatus(record.status),
      total_price:
        typeof record.total_price === 'number'
          ? record.total_price
          : Number(record.total_price ?? 0),
      created_at: record.created_at,
      profiles: coerceProfile(record.profiles ?? null),
      vehicles: coerceVehicle(record.vehicles ?? null),
    };
  };

  const recentRentals: RecentRental[] = Array.isArray(recentRentalsRaw)
    ? recentRentalsRaw
        .map(toRecentRental)
        .filter((rental): rental is RecentRental => rental !== null)
    : [];

  return {
    totalVehicles: totalVehiclesResponse.count ?? 0,
    availableVehicles: availableVehiclesResponse.count ?? 0,
    totalRentals: totalRentalsResponse.count ?? 0,
    activeRentals: activeRentalsResponse.count ?? 0,
    pendingRentals: pendingRentalsResponse.count ?? 0,
    totalCustomers: totalCustomersResponse.count ?? 0,
    recentRentals,
    totalRevenue,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pine-700 mb-2">Dashboard</h1>
        <p className="text-rock-600">Overview of your rental business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Revenue (30d)</p>
              <p className="text-3xl font-bold mt-1">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-4xl opacity-50">💰</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-pine-700 to-pine-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pine-200 text-sm">Active Rentals</p>
              <p className="text-3xl font-bold mt-1">{stats.activeRentals}</p>
            </div>
            <div className="text-4xl opacity-50">🚗</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-sand-400 to-sand-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sand-100 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingRentals}</p>
            </div>
            <div className="text-4xl opacity-50">⏳</div>
          </div>
          {stats.pendingRentals > 0 && (
            <Link 
              href="/admin/rentals?status=pending"
              className="mt-3 text-sm text-white underline hover:no-underline inline-block"
            >
              Review Now →
            </Link>
          )}
        </div>

        <div className="card bg-gradient-to-br from-rock-600 to-rock-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rock-200 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="text-4xl opacity-50">👥</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-pine-700 mb-4">Vehicle Fleet</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-rock-600">Total Vehicles</span>
              <span className="font-semibold">{stats.totalVehicles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rock-600">Available</span>
              <span className="font-semibold text-green-600">{stats.availableVehicles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rock-600">In Use</span>
              <span className="font-semibold text-orange-500">
                {stats.totalVehicles - stats.availableVehicles}
              </span>
            </div>
          </div>
          <Link 
            href="/admin/vehicles"
            className="mt-4 text-orange-500 hover:text-orange-600 font-medium inline-block"
          >
            Manage Vehicles →
          </Link>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-pine-700 mb-4">Recent Rentals</h3>
          <div className="space-y-3">
            {stats.recentRentals.length === 0 ? (
              <p className="text-rock-600 text-sm">No rentals yet</p>
            ) : (
              stats.recentRentals.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-pine-700">
                      {rental.vehicles?.name || 'Unknown Vehicle'}
                    </p>
                    <p className="text-sm text-rock-600">
                      {rental.profiles?.full_name || 'Unknown Customer'} • {rental.profiles?.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      rental.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      rental.status === 'active' ? 'bg-green-100 text-green-800' :
                      rental.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rental.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {stats.recentRentals.length > 0 && (
            <Link 
              href="/admin/rentals"
              className="mt-4 text-orange-500 hover:text-orange-600 font-medium inline-block"
            >
              View All Rentals →
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-pine-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/vehicles/new"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <span className="text-3xl mb-2">➕</span>
            <span className="text-sm font-medium text-pine-700">Add Vehicle</span>
          </Link>

          <Link
            href="/admin/rentals?status=pending"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <span className="text-3xl mb-2">📋</span>
            <span className="text-sm font-medium text-pine-700">Review Rentals</span>
          </Link>

          <Link
            href="/admin/gps"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <span className="text-3xl mb-2">📍</span>
            <span className="text-sm font-medium text-pine-700">Track Vehicles</span>
          </Link>

          <Link
            href="/admin/logs"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <span className="text-3xl mb-2">📊</span>
            <span className="text-sm font-medium text-pine-700">View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
