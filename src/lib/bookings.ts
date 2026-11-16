import type { MyBooking } from '../types';
import { formatTimeRange, timeZoneAbbreviation } from './dates';

// Shared by the customer's and the owner's booking lists
export const statusStyles: Record<MyBooking['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
};

// Shown in the venue's timezone, like the availability page, e.g. "Mon, Nov 2, 6:00 PM – 7:00 PM EST"
export const formatSlot = (
  booking: Pick<MyBooking, 'startTime' | 'endTime' | 'venueTimezone'>,
) => {
  const { startTime, endTime, venueTimezone } = booking;
  const day = new Date(startTime).toLocaleDateString('en-US', {
    timeZone: venueTimezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const times = formatTimeRange(startTime, endTime, venueTimezone);
  return `${day}, ${times} ${timeZoneAbbreviation(startTime, venueTimezone)}`;
};

export const spotsLabel = (spots: number) =>
  `${spots} ${spots === 1 ? 'spot' : 'spots'}`;

// A slot's price is per spot. Rounded to cents so 3 × 0.1 doesn't show as 0.30000000000000004
export const bookingTotal = (pricePerSpot: number, spots: number) =>
  Math.round(pricePerSpot * spots * 100) / 100;

// What the status badge shows. A pending booking whose slot has already started was never
// answered in time, so it reads "expired" instead of "pending"
export const statusBadge = (
  status: MyBooking['status'],
  slotStarted: boolean,
) =>
  status === 'pending' && slotStarted
    ? { label: 'expired', style: 'bg-gray-100 text-gray-500' }
    : { label: status, style: statusStyles[status] };

// Splits an owner's bookings into the lists the page shows. Cancelled ones stay together;
// of the rest, those whose slot has started are "past". Newest booking first in each list
export const groupBookingsByStatus = <
  T extends {
    status: MyBooking['status'];
    createdAt: string;
    startTime: string;
  },
>(
  bookings: T[],
  now: number,
) => {
  const newestFirst = [...bookings].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  const started = (booking: T) => Date.parse(booking.startTime) <= now;
  return {
    pending: newestFirst.filter((b) => b.status === 'pending' && !started(b)),
    confirmed: newestFirst.filter(
      (b) => b.status === 'confirmed' && !started(b),
    ),
    past: newestFirst.filter((b) => b.status !== 'cancelled' && started(b)),
    cancelled: newestFirst.filter((b) => b.status === 'cancelled'),
  };
};

// When the booking was made, in the venue's timezone like the slot time
export const formatCreated = (
  booking: Pick<MyBooking, 'venueTimezone'> & { createdAt: string },
) => {
  const { createdAt, venueTimezone } = booking;
  const when = new Date(createdAt).toLocaleString('en-US', {
    timeZone: venueTimezone,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${when} ${timeZoneAbbreviation(createdAt, venueTimezone)}`;
};
