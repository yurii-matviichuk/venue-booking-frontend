import { create } from 'zustand';
import type { Booking, TimeSlot, Venue } from '../types';

interface BookingStore {
  booking: Booking;
  setVenue: (venue: Venue) => void;
  setDate: (date: Date) => void;
  setSlot: (slot: TimeSlot) => void;
  setSpots: (spots: number) => void;
  setCustomer: (name: string, email: string) => void;
  reset: () => void;
}

const emptyBooking: Booking = {
  venueId: '',
  venueName: '',
  venueCity: '',
  venueTimezone: '',
  slotId: '',
  slotTime: '',
  slotEndTime: '',
  customerName: '',
  customerEmail: '',
  date: null,
  pricePerSpot: 0,
  spots: 1,
  slotSpotsRemaining: 0,
};

export const useBookingStore = create<BookingStore>((set) => ({
  booking: emptyBooking,
  setVenue: (venue) =>
    set((state) => ({
      booking: {
        ...state.booking,
        venueId: venue.id,
        venueName: venue.name,
        venueCity: venue.city,
        venueTimezone: venue.timezone,
      },
    })),
  setDate: (date) =>
    set((state) => ({
      booking: { ...state.booking, date },
    })),
  // Choosing a slot starts over with one spot
  setSlot: (slot) =>
    set((state) => ({
      booking: {
        ...state.booking,
        slotId: slot.id,
        slotTime: slot.time,
        slotEndTime: slot.endTime,
        pricePerSpot: slot.price,
        slotSpotsRemaining: slot.spotsRemaining,
        spots: 1,
      },
    })),
  setSpots: (spots) =>
    set((state) => ({
      booking: { ...state.booking, spots },
    })),
  setCustomer: (name, email) =>
    set((state) => ({
      booking: { ...state.booking, customerName: name, customerEmail: email },
    })),
  reset: () => set({ booking: emptyBooking }),
}));
