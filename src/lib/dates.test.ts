import { describe, expect, it } from 'vitest';
import {
  dateKey,
  formatTime,
  formatTimeRange,
  keyToLocalDate,
  localDateKey,
  timeZoneAbbreviation,
} from './dates';

describe('dateKey', () => {
  it('uses the venue’s calendar day, not UTC’s', () => {
    // 03:00 UTC on Nov 2 is still the evening of Nov 1 in New York
    expect(dateKey('2026-11-02T03:00:00Z', 'America/New_York')).toBe(
      '2026-11-01',
    );
    expect(dateKey('2026-11-02T03:00:00Z', 'UTC')).toBe('2026-11-02');
    // and already the next day in Tokyo
    expect(dateKey('2026-11-02T20:00:00Z', 'Asia/Tokyo')).toBe('2026-11-03');
  });
});

describe('local date keys', () => {
  it('round-trips a date and pads month and day', () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(localDateKey(keyToLocalDate('2026-11-02'))).toBe('2026-11-02');
  });
});

describe('time formatting', () => {
  it('formats a time in the venue’s timezone', () => {
    expect(formatTime('2026-11-02T15:00:00Z', 'America/New_York')).toMatch(
      /^10:00\sAM$/,
    );
    expect(formatTime('2026-11-02T15:00:00Z', 'UTC')).toMatch(/^3:00\sPM$/);
  });

  it('formats a time range', () => {
    expect(
      formatTimeRange(
        '2026-11-02T15:00:00Z',
        '2026-11-02T16:30:00Z',
        'America/New_York',
      ),
    ).toMatch(/^10:00\sAM – 11:30\sAM$/);
  });

  it('shows the timezone abbreviation that applies on that date', () => {
    // US daylight saving time ended on 2026-11-01
    expect(
      timeZoneAbbreviation('2026-10-30T15:00:00Z', 'America/New_York'),
    ).toBe('EDT');
    expect(
      timeZoneAbbreviation('2026-11-02T15:00:00Z', 'America/New_York'),
    ).toBe('EST');
  });
});
