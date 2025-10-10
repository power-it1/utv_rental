'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
  id: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  email?: string;
  role: 'user' | 'admin';
  created_at: string;
  rental_count?: number;
  total_spent?: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    
    // Fetch all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
      return;
    }

    // Fetch rental stats for each customer
    const customersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: rentals } = await supabase
          .from('rentals')
          .select('total_price')
          .eq('user_id', profile.id);

        const rental_count = rentals?.length || 0;
        const total_spent = rentals?.reduce((sum, r) => sum + Number(r.total_price), 0) || 0;

        return {
          ...profile,
          rental_count,
          total_spent,
        };
      })
    );

    setCustomers(customersWithStats);
    setLoading(false);
  }

  async function toggleAdminRole(customerId: string, currentRole: 'user' | 'admin') {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`Are you sure you want to make this user ${newRole === 'admin' ? 'an admin' : 'a regular user'}?`)) {
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', customerId);

    if (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    } else {
      fetchCustomers();
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = search.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(searchLower) ||
      customer.username?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pine-700 mb-2">Customer Management</h1>
        <p className="text-rock-600">View and manage customer accounts</p>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username, phone, or email..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-pine-700 to-pine-800 text-white">
          <p className="text-pine-200 text-sm mb-1">Total Customers</p>
          <p className="text-3xl font-bold">{customers.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-orange-100 text-sm mb-1">Admin Users</p>
          <p className="text-3xl font-bold">
            {customers.filter((c) => c.role === 'admin').length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-sand-400 to-sand-700 text-white">
          <p className="text-sand-100 text-sm mb-1">Regular Users</p>
          <p className="text-3xl font-bold">
            {customers.filter((c) => c.role === 'user').length}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-rock-600">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-xl font-semibold text-pine-700 mb-2">No customers found</p>
          <p className="text-rock-600">
            {search ? 'Try a different search term' : 'No customers have signed up yet'}
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-pine-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-pine-700">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-pine-700">Role</th>
                <th className="text-right py-3 px-4 font-semibold text-pine-700">Rentals</th>
                <th className="text-right py-3 px-4 font-semibold text-pine-700">Total Spent</th>
                <th className="text-left py-3 px-4 font-semibold text-pine-700">Joined</th>
                <th className="text-center py-3 px-4 font-semibold text-pine-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-pine-700">
                        {customer.full_name || 'Unnamed User'}
                      </p>
                      {customer.username && (
                        <p className="text-sm text-rock-600">@{customer.username}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-rock-600">
                      {customer.phone && <p>{customer.phone}</p>}
                      {customer.email && <p>{customer.email}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        customer.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {customer.role === 'admin' ? '👑 Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-medium text-pine-700">{customer.rental_count || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-medium text-orange-500">
                      ${(customer.total_spent || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-rock-600">
                    {formatDate(customer.created_at)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleAdminRole(customer.id, customer.role)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        customer.role === 'admin'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      {customer.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
