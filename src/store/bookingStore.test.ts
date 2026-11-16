import { beforeEach, describe, expect, it } from 'vitest';
import { useBookingStore } from './bookingStore';

const slot = {
  id: 's1',
  time: '2026-11-03T23:00:00Z',
  endTime: '2026-11-04T00:00:00Z',
  price: 30,
  available: true,
  spotsRemaining: 5,
};

beforeEach(() => {
  useBookingStore.getState().reset();
});

describe('bookingStore', () => {
  it('starts a booking at one spot with the slot’s price and spots left', () => {
    useBookingStore.getState().setSlot(slot);

    expect(useBookingStore.getState().booking).toMatchObject({
      slotId: 's1',
      pricePerSpot: 30,
      slotSpotsRemaining: 5,
      spots: 1,
    });
  });

  it('keeps the chosen number of spots', () => {
    useBookingStore.getState().setSlot(slot);
    useBookingStore.getState().setSpots(3);

    expect(useBookingStore.getState().booking.spots).toBe(3);
  });

  it('goes back to one spot when another slot is chosen', () => {
    useBookingStore.getState().setSlot(slot);
    useBookingStore.getState().setSpots(4);

    useBookingStore
      .getState()
      .setSlot({ ...slot, id: 's2', spotsRemaining: 2 });

    expect(useBookingStore.getState().booking).toMatchObject({
      slotId: 's2',
      spots: 1,
      slotSpotsRemaining: 2,
    });
  });

  it('resets to an empty booking', () => {
    useBookingStore.getState().setSlot(slot);
    useBookingStore.getState().setSpots(3);

    useBookingStore.getState().reset();

    expect(useBookingStore.getState().booking).toMatchObject({
      slotId: '',
      spots: 1,
      pricePerSpot: 0,
    });
  });
});
