import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { apiFetch, ApiError } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { MyBooking } from '../types';

const statusStyles: Record<MyBooking['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
};

const formatSlot = (booking: MyBooking) => {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const time = { hour: '2-digit', minute: '2-digit' } as const;
  return `${start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })}, ${start.toLocaleTimeString('en-US', time)} – ${end.toLocaleTimeString('en-US', time)}`;
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiFetch<{ bookings: MyBooking[] }>('/bookings');
        setBookings(data.bookings);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          useAuthStore.setState({ user: null });
          return;
        }
        console.error('Failed to fetch bookings:', err);
        setError('Failed to load your bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (booking: MyBooking) => {
    if (!window.confirm(`Cancel your booking at ${booking.venueName}?`)) {
      return;
    }

    setCancellingId(booking.id);
    setError('');

    try {
      await apiFetch(`/bookings/${booking.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      setBookings((current) =>
        current.map((b) =>
          b.id === booking.id ? { ...b, status: 'cancelled' } : b,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        useAuthStore.setState({ user: null });
        return;
      }
      console.error('Failed to cancel booking:', err);
      setError('Failed to cancel the booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const isUpcoming = (b: MyBooking) => new Date(b.startTime).getTime() > now;
  // The API returns the latest slot first; upcoming reads better soonest first
  const upcoming = bookings.filter(isUpcoming).reverse();
  const past = bookings.filter((b) => !isUpcoming(b));

  const renderCard = (booking: MyBooking, canCancel: boolean) => (
    <div
      key={booking.id}
      className="bg-white rounded-lg shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          {booking.venueName}
        </h3>
        <p className="text-gray-600 mb-2">📍 {booking.venueLocation}</p>
        <p className="font-bold">{formatSlot(booking)}</p>
        <p className="text-gray-600">${booking.price}</p>
      </div>
      <div className="flex sm:flex-col items-start sm:items-end gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${statusStyles[booking.status]}`}
        >
          {booking.status}
        </span>
        {canCancel && booking.status !== 'cancelled' && (
          <button
            onClick={() => handleCancel(booking)}
            disabled={cancellingId === booking.id}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 cursor-pointer"
          >
            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Header />

        <button
          onClick={() => navigate('/')}
          className="mb-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        {bookings.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-6">
              You have no bookings yet.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg cursor-pointer"
            >
              Browse venues
            </button>
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Upcoming</h2>
            <div className="grid gap-4 mb-8">
              {upcoming.map((b) => renderCard(b, true))}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Past</h2>
            <div className="grid gap-4">
              {past.map((b) => renderCard(b, false))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
