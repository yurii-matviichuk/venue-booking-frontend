import { describe, expect, it } from 'vitest';
import {
  bookingTotal,
  formatCreated,
  formatSlot,
  groupBookingsByStatus,
  spotsLabel,
  statusBadge,
} from './bookings';

const slot = {
  startTime: '2026-11-03T23:00:00Z',
  endTime: '2026-11-04T00:00:00Z',
};

describe('formatSlot', () => {
  it('shows the venue’s local day, time range and timezone', () => {
    // 23:00 UTC is 6:00 PM in New York (EST after the daylight saving change)
    expect(formatSlot({ ...slot, venueTimezone: 'America/New_York' })).toMatch(
      /^Tue, Nov 3, 6:00\sPM – 7:00\sPM EST$/,
    );
  });

  it('does not depend on the viewer’s timezone: the same slot reads differently per venue', () => {
    // The same instant is already the next day in Tokyo
    expect(formatSlot({ ...slot, venueTimezone: 'Asia/Tokyo' })).toMatch(
      /^Wed, Nov 4, 8:00\sAM – 9:00\sAM /,
    );
  });
});

describe('spotsLabel', () => {
  it('uses the singular for one spot and the plural otherwise', () => {
    expect(spotsLabel(1)).toBe('1 spot');
    expect(spotsLabel(3)).toBe('3 spots');
  });
});

describe('bookingTotal', () => {
  it('multiplies the price per spot by the number of spots', () => {
    expect(bookingTotal(25, 4)).toBe(100);
  });

  it('rounds to cents', () => {
    expect(bookingTotal(0.1, 3)).toBe(0.3);
    expect(bookingTotal(12.99, 3)).toBe(38.97);
  });
});

describe('groupBookingsByStatus', () => {
  const now = Date.parse('2026-11-10T12:00:00Z');
  const booking = (
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled',
    createdAt: string,
    startTime = '2026-11-20T18:00:00Z',
  ) => ({ id, status, createdAt, startTime });

  it('splits by status and puts the newest booking first in each group', () => {
    const groups = groupBookingsByStatus(
      [
        booking('a', 'pending', '2026-11-01T10:00:00Z'),
        booking('b', 'confirmed', '2026-11-02T10:00:00Z'),
        booking('c', 'pending', '2026-11-03T10:00:00Z'),
        booking('d', 'cancelled', '2026-11-01T09:00:00Z'),
        booking('e', 'confirmed', '2026-11-04T10:00:00Z'),
      ],
      now,
    );

    expect(groups.pending.map((b) => b.id)).toEqual(['c', 'a']);
    expect(groups.confirmed.map((b) => b.id)).toEqual(['e', 'b']);
    expect(groups.cancelled.map((b) => b.id)).toEqual(['d']);
    expect(groups.past).toEqual([]);
  });

  it('moves bookings whose slot has started to past, unless they are cancelled', () => {
    const started = '2026-11-09T18:00:00Z';
    const groups = groupBookingsByStatus(
      [
        booking('a', 'pending', '2026-11-01T10:00:00Z', started),
        booking('b', 'confirmed', '2026-11-02T10:00:00Z', started),
        booking('c', 'cancelled', '2026-11-03T10:00:00Z', started),
        booking('d', 'confirmed', '2026-11-04T10:00:00Z'),
      ],
      now,
    );

    expect(groups.past.map((b) => b.id)).toEqual(['b', 'a']);
    expect(groups.cancelled.map((b) => b.id)).toEqual(['c']);
    expect(groups.confirmed.map((b) => b.id)).toEqual(['d']);
    expect(groups.pending).toEqual([]);
  });

  it('treats a slot that starts exactly now as started', () => {
    const groups = groupBookingsByStatus(
      [booking('a', 'pending', '2026-11-01T10:00:00Z', '2026-11-10T12:00:00Z')],
      now,
    );

    expect(groups.past.map((b) => b.id)).toEqual(['a']);
  });

  it('does not change the list it is given', () => {
    const list = [
      booking('a', 'pending', '2026-11-01T10:00:00Z'),
      booking('b', 'pending', '2026-11-02T10:00:00Z'),
    ];

    groupBookingsByStatus(list, now);

    expect(list.map((b) => b.id)).toEqual(['a', 'b']);
  });

  it('returns empty groups for no bookings', () => {
    expect(groupBookingsByStatus([], now)).toEqual({
      pending: [],
      confirmed: [],
      past: [],
      cancelled: [],
    });
  });
});

describe('statusBadge', () => {
  it('shows the status as it is while the slot is ahead', () => {
    expect(statusBadge('pending', false).label).toBe('pending');
    expect(statusBadge('confirmed', false).label).toBe('confirmed');
  });

  it('shows an unanswered booking as expired once its slot has started', () => {
    expect(statusBadge('pending', true).label).toBe('expired');
  });

  it('keeps confirmed and cancelled bookings as they are after the slot started', () => {
    expect(statusBadge('confirmed', true).label).toBe('confirmed');
    expect(statusBadge('cancelled', true).label).toBe('cancelled');
  });
});

describe('formatCreated', () => {
  it('shows when the booking was made in the venue’s timezone', () => {
    expect(
      formatCreated({
        createdAt: '2026-11-03T23:05:00Z',
        venueTimezone: 'America/New_York',
      }),
    ).toMatch(/^Nov 3, 6:05\sPM EST$/);
  });
});
