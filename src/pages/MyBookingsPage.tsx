import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BookingCard from '../components/BookingCard';
import ConfirmDialog from '../components/ConfirmDialog';
import Header from '../components/Header';
import { apiFetch, ApiError } from '../lib/api';
import { groupBookingsByStatus } from '../lib/bookings';
import { useAuthStore } from '../store/authStore';
import type { MyBooking } from '../types';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<MyBooking | null>(null);
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

  const groups = groupBookingsByStatus(bookings, now);
  const sections = [
    { title: 'Waiting for confirmation', bookings: groups.pending },
    { title: 'Confirmed', bookings: groups.confirmed },
    { title: 'Past', bookings: groups.past },
    { title: 'Cancelled', bookings: groups.cancelled },
  ].filter((section) => section.bookings.length > 0);

  const renderCard = (booking: MyBooking) => {
    // The slot has started: nothing left to cancel
    const started = Date.parse(booking.startTime) <= now;
    return (
      <BookingCard
        key={booking.id}
        booking={booking}
        started={started}
        viewer="customer"
      >
        {booking.status !== 'cancelled' && !started && (
          <button
            onClick={() => setToCancel(booking)}
            disabled={cancellingId === booking.id}
            className="bg-red-600 enabled:hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 enabled:cursor-pointer disabled:cursor-not-allowed"
          >
            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </BookingCard>
    );
  };

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

        <h1 className="text-4xl font-bold mb-8">My bookings</h1>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <ConfirmDialog
          open={toCancel !== null}
          title="Cancel this booking?"
          message={`Your booking at ${toCancel?.venueName ?? ''} will be cancelled and its spots released.`}
          confirmLabel="Cancel booking"
          onConfirm={() => {
            if (toCancel) handleCancel(toCancel);
            setToCancel(null);
          }}
          onCancel={() => setToCancel(null)}
        />

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

        {sections.map((section) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {section.title} ({section.bookings.length})
            </h2>
            <div className="grid gap-4">{section.bookings.map(renderCard)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
