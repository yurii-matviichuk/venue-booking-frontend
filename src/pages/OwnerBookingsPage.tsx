import { useEffect, useState } from 'react';
import BookingCard from '../components/BookingCard';
import ConfirmDialog from '../components/ConfirmDialog';
import Header from '../components/Header';
import { ApiError, apiFetch } from '../lib/api';
import { groupBookingsByStatus } from '../lib/bookings';
import { useAuthStore } from '../store/authStore';
import type { OwnerBooking } from '../types';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<OwnerBooking | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiFetch<{ bookings: OwnerBooking[] }>(
          '/owner/bookings',
        );
        setBookings(data.bookings);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          useAuthStore.setState({ user: null });
          return;
        }
        console.error('Failed to fetch venue bookings:', err);
        setError('Failed to load the bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const changeStatus = async (
    booking: OwnerBooking,
    status: 'confirmed' | 'cancelled',
  ) => {
    setUpdatingId(booking.id);
    setError('');

    try {
      await apiFetch(`/bookings/${booking.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setBookings((current) =>
        current.map((b) => (b.id === booking.id ? { ...b, status } : b)),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        useAuthStore.setState({ user: null });
        return;
      }
      console.error('Failed to update booking:', err);
      setError('Failed to update the booking. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const groups = groupBookingsByStatus(bookings, now);
  const sections = [
    { title: 'Waiting for your confirmation', bookings: groups.pending },
    { title: 'Confirmed', bookings: groups.confirmed },
    { title: 'Past', bookings: groups.past },
    { title: 'Cancelled', bookings: groups.cancelled },
  ].filter((section) => section.bookings.length > 0);

  const renderCard = (booking: OwnerBooking) => {
    // Nothing to decide once the slot has started
    const started = Date.parse(booking.startTime) <= now;
    return (
      <BookingCard
        key={booking.id}
        booking={booking}
        started={started}
        viewer="owner"
      >
        {booking.status === 'pending' && !started && (
          <button
            onClick={() => changeStatus(booking, 'confirmed')}
            disabled={updatingId === booking.id}
            className="bg-green-600 enabled:hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 enabled:cursor-pointer disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        )}
        {booking.status !== 'cancelled' && !started && (
          <button
            onClick={() => setToCancel(booking)}
            disabled={updatingId === booking.id}
            className="bg-red-600 enabled:hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 enabled:cursor-pointer disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </BookingCard>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Header />

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <ConfirmDialog
          open={toCancel !== null}
          title="Cancel this booking?"
          message={`${toCancel?.customerName ?? ''}'s booking at ${toCancel?.venueName ?? ''} will be cancelled and its spots released.`}
          confirmLabel="Cancel booking"
          onConfirm={() => {
            if (toCancel) changeStatus(toCancel, 'cancelled');
            setToCancel(null);
          }}
          onCancel={() => setToCancel(null)}
        />

        {bookings.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600">
              No one has booked your venues yet.
            </p>
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
