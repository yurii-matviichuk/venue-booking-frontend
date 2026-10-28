import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { apiFetch, ApiError } from '../lib/api';
import TimeSlotSelector from '../components/TimeSlotSelector';
import type { TimeSlot, Venue } from '../types';

export default function AvailabilityPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { setVenue, setSlot } = useBookingStore();

  const [venue, setVenueData] = useState<Venue | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!venueId) return;

    const fetchData = async () => {
      try {
        const venueData = await apiFetch<Venue>(`/venues/${venueId}`);
        setVenueData(venueData);
        setVenue(venueData);
        setSlots(await apiFetch<TimeSlot[]>(`/availability/${venueId}`));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          useAuthStore.setState({ user: null });
          return;
        }
        if (err instanceof ApiError && err.status === 404) {
          setVenueData(null);
          return;
        }
        console.error('Failed to fetch data:', err);
        setError('Failed to load venue availability. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venueId, setVenue]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!venue) return <div className="p-8">Venue not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/?city=${encodeURIComponent(venue.city)}`)}
          className="mb-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold mb-2">{venue.name}</h1>
        <p className="text-xl text-gray-600 mb-8">📍 {venue.location}</p>

        <h2 className="text-2xl font-bold mb-4">Available Time Slots</h2>

        <TimeSlotSelector
          slots={slots}
          onSelect={(slot) => {
            setSlot(slot);
            navigate('/checkout');
          }}
        />
      </div>
    </div>
  );
}
