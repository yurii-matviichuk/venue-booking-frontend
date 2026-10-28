import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import Header from '../components/Header';
import VenueCard from '../components/VenueCard';
import type { Venue } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  // The selected city lives in the URL (/?city=Chicago), so Back from a venue returns to the same list
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get('city') ?? '';

  const [cities, setCities] = useState<string[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCities(await apiFetch<string[]>('/cities'));
      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setError('Failed to load cities. Please try again.');
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (!city) return;

    // Ignore the response if the user picks another city before it arrives
    let cancelled = false;
    const fetchVenues = async () => {
      setLoadingVenues(true);
      setError('');
      try {
        const data = await apiFetch<Venue[]>(
          `/venues?city=${encodeURIComponent(city)}`,
        );
        if (!cancelled) setVenues(data);
      } catch (err) {
        console.error('Failed to fetch venues:', err);
        if (!cancelled) setError('Failed to load venues. Please try again.');
      } finally {
        if (!cancelled) setLoadingVenues(false);
      }
    };

    fetchVenues();
    return () => {
      cancelled = true;
    };
  }, [city]);

  // Only show venues of the selected city, so the previous city's list never flashes
  const visibleVenues = venues.filter((venue) => venue.city === city);

  const selectCity = (value: string) => {
    setSearchParams(value ? { city: value } : {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎳 Venue Booking System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Book your entertainment venue instantly
          </p>
          <div className="relative inline-block">
            {/* appearance-none hides the browser's own arrow, whose position can't be styled */}
            <select
              value={city}
              onChange={(e) => selectCity(e.target.value)}
              disabled={loadingCities}
              aria-label="Select your city"
              className="appearance-none bg-white border border-gray-300 rounded-lg shadow pl-4 pr-12 py-3 text-lg min-w-64 cursor-pointer"
            >
              <option value="">Select your city</option>
              {cities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {error && <p className="text-center text-red-600 mb-8">{error}</p>}

        {!city && !error && (
          <p className="text-center text-gray-600">
            Choose a city to see its venues.
          </p>
        )}
        {city && loadingVenues && (
          <p className="text-center text-gray-600">Loading...</p>
        )}
        {city && !loadingVenues && !error && visibleVenues.length === 0 && (
          <p className="text-center text-gray-600">No venues in {city} yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onBook={(id) => navigate(`/availability/${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
