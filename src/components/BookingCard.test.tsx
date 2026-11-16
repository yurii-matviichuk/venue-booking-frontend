import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { OwnerBooking } from '../types';
import BookingCard from './BookingCard';

afterEach(cleanup);

const booking: OwnerBooking = {
  id: 'b1',
  createdAt: '2026-11-03T23:05:00Z',
  venueId: 'v1',
  slotId: 's1',
  spots: 3,
  status: 'pending',
  price: 25,
  venueName: 'Bowling Alley Downtown',
  venueAddress: '100 Example Street',
  venueCity: 'New York',
  venueTimezone: 'America/New_York',
  startTime: '2026-11-20T23:00:00Z',
  endTime: '2026-11-21T00:00:00Z',
  customerName: 'Jane Doe',
  customerEmail: 'jane@example.com',
};

describe('BookingCard', () => {
  it('shows the venue, its address, the total and when it was booked to a customer', () => {
    render(<BookingCard booking={booking} started={false} viewer="customer" />);

    expect(screen.getByText('Bowling Alley Downtown')).toBeTruthy();
    expect(screen.getByText(/100 Example Street, New York/)).toBeTruthy();
    expect(screen.getByText(/3 spots · \$75/)).toBeTruthy();
    expect(screen.getByText(/^Booked Nov 3, 6:05\sPM EST$/)).toBeTruthy();
    expect(screen.getByText('pending')).toBeTruthy();
    expect(screen.queryByText(/jane@example.com/)).toBeNull();
  });

  it('shows who booked, and not the address, to an owner', () => {
    render(<BookingCard booking={booking} started={false} viewer="owner" />);

    expect(screen.getByText('Jane Doe · jane@example.com')).toBeTruthy();
    expect(screen.queryByText(/100 Example Street/)).toBeNull();
  });

  it('shows an unanswered booking as expired once its slot has started', () => {
    render(<BookingCard booking={booking} started viewer="customer" />);

    expect(screen.getByText('expired')).toBeTruthy();
    expect(screen.queryByText('pending')).toBeNull();
  });

  it('renders the action buttons it is given', () => {
    render(
      <BookingCard booking={booking} started={false} viewer="owner">
        <button>Confirm</button>
      </BookingCard>,
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeTruthy();
  });
});
