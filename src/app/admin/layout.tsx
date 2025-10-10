import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import AdminSidebar from '@/components/admin/AdminSidebar';

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getAdminData();

  const navItems = [
    { href: '/admin', label: 'Executive Overview', icon: '📊' },
    { href: '/admin/vehicles', label: 'Fleet Intelligence', icon: '🏍️' },
    { href: '/admin/rentals', label: 'Rental Pipeline', icon: '📋' },
    { href: '/admin/gps', label: 'GPS Command', icon: '📍' },
    { href: '/admin/customers', label: 'Client Network', icon: '👥' },
    { href: '/admin/logs', label: 'Audit Logs', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sand-50">
      <div className="flex min-h-screen">
        <AdminSidebar
          items={navItems}
          profileName={profile?.full_name ?? 'Admin'}
          cta={{ href: '/admin/vehicles/new', label: 'Launch a New Experience' }}
        />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 xl:px-14">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-lg shadow-sky-100/60 ring-1 ring-white/60 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-orange-500">Performance Pulse</p>
                <h2 className="mt-2 text-3xl font-bold text-pine-800">{profile?.full_name || 'Leadership'} Dashboard</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-rock-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 font-medium text-pine-700">
                  📈 Daily occupancy auto-synced
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-600">
                  ⚡ Lightning-fast approvals
                </span>
              </div>
            </div>

            <div className="lg:hidden mb-6">
              <div className="grid grid-cols-2 gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-pine-700 shadow-sm shadow-sky-100 hover:bg-sky-50"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-8 pb-12">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
