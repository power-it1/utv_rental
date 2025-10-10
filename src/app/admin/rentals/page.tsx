'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Rental {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
    email?: string;
  };
  vehicles: {
    name: string;
    type: string;
  };
}

export default function RentalsManagementPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | Rental['status']>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const statusOptions: ReadonlyArray<'all' | Rental['status']> = [
    'all',
    'pending',
    'confirmed',
    'active',
    'completed',
    'cancelled',
  ];

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('rentals')
      .select(`
        *,
        profiles:user_id(full_name, phone),
        vehicles:vehicle_id(name, type)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rentals:', error);
    } else {
      setRentals((data ?? []) as Rental[]);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    void fetchRentals();
  }, [fetchRentals]);

  async function updateRentalStatus(id: string, status: Rental['status']) {
    const { error } = await supabase
      .from('rentals')
      .update({ status } as never)
      .eq('id', id);

    if (error) {
      console.error('Error updating rental:', error);
      alert('Failed to update rental status');
    } else {
      await fetchRentals();
    }
  }

  async function saveAdminNotes(id: string) {
    const { error } = await supabase
      .from('rentals')
      .update({ admin_notes: adminNotes } as never)
      .eq('id', id);

    if (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    } else {
      setEditingNotes(null);
      setAdminNotes('');
      await fetchRentals();
    }
  }

  function getStatusColor(status: Rental['status']) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getTypeIcon(type: Rental['vehicles']['type']) {
    switch (type) {
      case 'motorcycle':
        return '🏍️';
      case 'utv':
        return '🚛';
      case 'guided_tour':
        return '🗺️';
      default:
        return '🚗';
    }
  }

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
        <h1 className="text-4xl font-bold text-pine-700 mb-2">Rental Management</h1>
        <p className="text-rock-600">View and manage all customer rentals</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-rock-600 mb-2">Filter by Status</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setStatusFilter(statusOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                statusFilter === statusOption
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-rock-600 hover:bg-gray-300'
              }`}
            >
              {statusOption}
            </button>
          ))}
        </div>
      </div>

      {/* Rentals List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-rock-600">Loading rentals...</p>
        </div>
      ) : rentals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-xl font-semibold text-pine-700 mb-2">No rentals found</p>
          <p className="text-rock-600">
            {statusFilter !== 'all' 
              ? `No ${statusFilter} rentals at the moment`
              : 'No rentals have been created yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <div key={rental.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Vehicle & Customer Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-4xl">{getTypeIcon(rental.vehicles.type)}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-pine-700 mb-1">
                        {rental.vehicles.name}
                      </h3>
                      <div className="text-sm text-rock-600 space-y-1">
                        <p>
                          <span className="font-medium">Customer:</span>{' '}
                          {rental.profiles.full_name || 'Unknown'}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{' '}
                          {rental.profiles.phone || 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Rental Period:</span>{' '}
                          {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
                        </p>
                        <p className="text-lg font-bold text-orange-500">
                          Total: ${rental.total_price}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {rental.notes && (
                    <div className="bg-sand-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-medium text-pine-700 mb-1">Customer Notes:</p>
                      <p className="text-sm text-rock-600">{rental.notes}</p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {editingNotes === rental.id ? (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-pine-700 mb-2">Admin Notes:</p>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                        rows={3}
                        placeholder="Add internal notes..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveAdminNotes(rental.id)}
                          className="px-4 py-1 bg-pine-700 text-white rounded text-sm hover:bg-pine-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(null);
                            setAdminNotes('');
                          }}
                          className="px-4 py-1 bg-gray-200 text-rock-600 rounded text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : rental.admin_notes ? (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-pine-700 mb-1">Admin Notes:</p>
                      <p className="text-sm text-rock-600">{rental.admin_notes}</p>
                      <button
                        onClick={() => {
                          setEditingNotes(rental.id);
                          setAdminNotes(rental.admin_notes || '');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNotes(rental.id);
                        setAdminNotes('');
                      }}
                      className="text-sm text-pine-700 hover:text-pine-800 font-medium"
                    >
                      + Add Admin Notes
                    </button>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-rock-600 mb-2">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rental.status)}`}>
                      {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-rock-600 mb-2">Actions</p>
                    
                    {rental.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateRentalStatus(rental.id, 'confirmed')}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => updateRentalStatus(rental.id, 'cancelled')}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}

                    {rental.status === 'confirmed' && (
                      <button
                        onClick={() => updateRentalStatus(rental.id, 'active')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Start Rental
                      </button>
                    )}

                    {rental.status === 'active' && (
                      <button
                        onClick={() => updateRentalStatus(rental.id, 'completed')}
                        className="w-full px-4 py-2 bg-pine-700 text-white rounded-lg hover:bg-pine-800 text-sm font-medium"
                      >
                        Complete Rental
                      </button>
                    )}

                    {rental.status !== 'cancelled' && rental.status !== 'completed' && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this rental?')) {
                            updateRentalStatus(rental.id, 'cancelled');
                          }
                        }}
                        className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                      >
                        Cancel Rental
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-rock-600 mt-4">
                    Created: {formatDate(rental.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
