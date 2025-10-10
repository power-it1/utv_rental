'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authHelpers } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

interface UnavailableRange {
  start_date: string;
  end_date: string;
  status: string;
}

interface ReserveVehicleFormProps {
  vehicleId: string;
  pricePerDay: number;
  unavailableRanges: UnavailableRange[];
  vehicleAvailable: boolean;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function ReserveVehicleForm({
  vehicleId,
  pricePerDay,
  unavailableRanges,
  vehicleAvailable,
}: ReserveVehicleFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
  }, []);

  const computedUnavailable = useMemo(() => {
    return unavailableRanges.map((range) => {
      const start = new Date(range.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(range.end_date);
      end.setHours(23, 59, 59, 999);
      return {
        start,
        end,
        status: range.status,
      };
    });
  }, [unavailableRanges]);

  const dateRangesOverlap = (start: Date, end: Date) => {
    return computedUnavailable.some(({ start: s, end: e }) => {
      return start <= e && end >= s;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleAvailable) {
      showToast('This vehicle is currently unavailable.', 'warning');
      return;
    }

    if (!startDate || !endDate) {
      showToast('Please select a start and end date.', 'warning');
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (start >= end) {
      showToast('End date must be after the start date.', 'warning');
      return;
    }

    if (dateRangesOverlap(start, end)) {
      showToast('Selected dates overlap with an existing booking.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { user } = await authHelpers.getCurrentUser();
      if (!user) {
        showToast('Please sign in to book this vehicle.', 'info');
        router.push(`/auth/signin?redirectTo=${encodeURIComponent(`/listings/${vehicleId}`)}`);
        return;
      }

      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        showToast(error || 'Failed to create reservation.', 'error');
        return;
      }

      showToast('Reservation submitted! We will confirm shortly.', 'success');
      setStartDate('');
      setEndDate('');
      setNotes('');
      router.push('/my-rentals');
    } catch (error) {
      console.error('Reservation error:', error);
      showToast('Unexpected error creating reservation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const estimatedTotal = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return null;

    const dayCount = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
    return dayCount * pricePerDay;
  }, [startDate, endDate, pricePerDay]);

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-2xl font-semibold text-pine-700">Book this vehicle</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-rock-600 mb-2">
            Start Date
          </label>
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-rock-600 mb-2">
            End Date
          </label>
          <input
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-rock-600 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Any special requests?"
        />
      </div>

      {estimatedTotal !== null && (
        <div className="rounded-lg bg-sand-50 border border-sand-200 px-4 py-3 text-sm text-pine-700">
          Estimated total: <span className="font-semibold">{currencyFormatter.format(estimatedTotal)}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !vehicleAvailable}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {vehicleAvailable ? (loading ? 'Submitting...' : 'Request Reservation') : 'Currently Unavailable'}
      </button>

      {unavailableRanges.length > 0 && (
        <div className="bg-sand-50 border border-sand-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-pine-700 mb-2">Upcoming bookings:</p>
          <ul className="space-y-1 text-sm text-rock-600">
            {unavailableRanges.map((range) => {
              const start = new Date(range.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const end = new Date(range.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const label = range.status === 'pending' ? 'Pending approval' : range.status === 'confirmed' ? 'Confirmed' : 'Active';
              return (
                <li key={`${range.start_date}-${range.end_date}`}>
                  {start} → {end} · <span className="font-medium">{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </form>
  );
}
