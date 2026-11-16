import { describe, expect, it } from 'vitest';
import { bookingTotal, spotsLabel } from './bookings';

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
