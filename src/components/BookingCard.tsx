import type { ReactNode } from 'react';
import {
  bookingTotal,
  formatCreated,
  formatSlot,
  spotsLabel,
  statusBadge,
} from '../lib/bookings';
import type { MyBooking, OwnerBooking } from '../types';

// One booking, as shown on both "My bookings" and "Venue bookings".
// Customers see where the venue is; owners see who booked. The action buttons are the children.
export default function BookingCard({
  booking,
  started,
  viewer,
  children,
}: {
  booking: MyBooking | OwnerBooking;
  started: boolean;
  viewer: 'customer' | 'owner';
  children?: ReactNode;
}) {
  const badge = statusBadge(booking.status, started);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          {booking.venueName}
        </h3>
        {viewer === 'customer' && (
          <p className="text-gray-600">
            📍 {booking.venueAddress}, {booking.venueCity}
          </p>
        )}
        <p className="font-bold">{formatSlot(booking)}</p>
        {viewer === 'owner' && 'customerName' in booking && (
          <p className="text-gray-600">
            {booking.customerName} · {booking.customerEmail}
          </p>
        )}
        <p className="text-gray-600">
          {spotsLabel(booking.spots)} · $
          {bookingTotal(booking.price, booking.spots)}
        </p>
        <p className="text-sm text-gray-500">Booked {formatCreated(booking)}</p>
      </div>
      <div className="flex sm:flex-col items-start sm:items-end gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${badge.style}`}
        >
          {badge.label}
        </span>
        {children && <div className="flex gap-2">{children}</div>}
      </div>
    </div>
  );
}
