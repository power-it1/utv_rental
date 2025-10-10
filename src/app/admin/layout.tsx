import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard - Adventure Rentals',
  description: 'Manage vehicles, rentals, and track GPS locations',
};

async function getAdminData() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  return { user, profile };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getAdminData();

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-pine-700 text-white min-h-screen fixed">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
            <p className="text-pine-200 text-sm">Welcome, {profile?.full_name || 'Admin'}</p>
          </div>

          <nav className="mt-6">
            <Link
              href="/admin"
              className="block px-6 py-3 hover:bg-pine-600 transition-colors border-l-4 border-transparent hover:border-orange-500"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">📊</span>
                <span>Dashboard</span>
              </div>
            </Link>

            <Link
              href="/admin/vehicles"
              className="block px-6 py-3 hover:bg-pine-600 transition-colors border-l-4 border-transparent hover:border-orange-500"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">🏍️</span>
                <span>Vehicles</span>
              </div>
            </Link>

            <Link
              href="/admin/rentals"
              className="block px-6 py-3 hover:bg-pine-600 transition-colors border-l-4 border-transparent hover:border-orange-500"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">📋</span>
                <span>Rentals</span>
              </div>
            </Link>

            <Link
              href="/admin/gps"
              className="block px-6 py-3 hover:bg-pine-600 transition-colors border-l-4 border-transparent hover:border-orange-500"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">📍</span>
                <span>GPS Tracking</span>
              </div>
            </Link>

            <Link
              href="/admin/customers"
              className="block px-6 py-3 hover:bg-pine-600 transition-colors border-l-4 border-transparent hover:border-orange-500"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">👥</span>
                <span>Customers</span>
              </div>
            </Link>

            <Link
              href="/admin/logs"
              className="block px-6 py-3 hover:bg-pine-600 transition-colors border-l-4 border-transparent hover:border-orange-500"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">📝</span>
                <span>Activity Logs</span>
              </div>
            </Link>

            <div className="border-t border-pine-600 mt-6 pt-6">
              <Link
                href="/"
                className="block px-6 py-3 hover:bg-pine-600 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">🏠</span>
                  <span>Back to Site</span>
                </div>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
