import { useState } from 'react';
import type { Venue } from '../types';

interface VenueCardProps {
  venue: Venue;
  onBook: (venueId: string) => void;
}

export default function VenueCard({ venue, onBook }: VenueCardProps) {
  // A missing file or a failed load falls back to the placeholder below
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
      <div className="aspect-3/2 bg-gray-200">
        {venue.imageFile && !imageFailed ? (
          <img
            src={`/images/venues/${venue.imageFile}`}
            alt={venue.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🎳
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col grow">
        <span className="self-start text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-full px-3 py-1 mb-3">
          {venue.category}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{venue.name}</h2>
        <p className="text-gray-600 mb-2">
          📍 {venue.address}, {venue.city}
        </p>
        <p className="text-gray-600 mb-6 grow">{venue.description}</p>
        <div className="mt-auto flex items-center justify-between gap-4">
          <p className="text-gray-900">
            {venue.minPricePerSpot === null ? (
              <span className="text-sm text-gray-500">No upcoming slots</span>
            ) : (
              <>
                <span className="text-sm text-gray-500">from </span>
                <span className="text-xl font-bold">
                  ${venue.minPricePerSpot}
                </span>
                <span className="text-sm text-gray-500"> / spot</span>
              </>
            )}
          </p>
          <button
            onClick={() => onBook(venue.id)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors cursor-pointer"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
