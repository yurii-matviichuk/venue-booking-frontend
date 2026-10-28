import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { apiFetch, ApiError } from '../lib/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { booking, reset } = useBookingStore();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      // The backend takes the customer's name and email from the logged-in user
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          venueId: booking.venueId,
          slotId: booking.slotId,
        }),
      });

      reset();
      navigate('/confirmation');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      setError('Failed to create booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!booking.venueId || !booking.slotId) {
    return (
      <div className="p-8">
        <p>Invalid booking. Please start over.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Booking Summary</h1>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="mb-2">
              <strong>Venue:</strong> {booking.venueName}
            </p>
            <p className="mb-2">
              <strong>City:</strong> {booking.venueCity}
            </p>
            <p className="mb-2">
              <strong>Date:</strong>{' '}
              {new Date(booking.slotTime).toLocaleDateString('en-US', {
                dateStyle: 'full',
              })}
            </p>
            <p className="mb-2">
              <strong>Time:</strong>{' '}
              {[booking.slotTime, booking.slotEndTime]
                .map((time) =>
                  new Date(time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  }),
                )
                .join(' – ')}
            </p>
            <p className="mb-2">
              <strong>Name:</strong> {user?.name}
            </p>
            <p className="mb-2">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="mb-2">
              <strong>Price:</strong> ${booking.totalPrice} (1 spot)
            </p>
            <p>
              <strong>Status:</strong> Pending Payment
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
