import { create } from 'zustand';
import type { Booking, TimeSlot, Venue } from '../types';

interface BookingStore {
  booking: Booking;
  setVenue: (venue: Venue) => void;
  setDate: (date: Date) => void;
  setSlot: (slot: TimeSlot) => void;
  setCustomer: (name: string, email: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  booking: {
    venueId: '',
    venueName: '',
    venueCity: '',
    slotId: '',
    slotTime: '',
    slotEndTime: '',
    customerName: '',
    customerEmail: '',
    date: null,
    totalPrice: 0,
  },
  setVenue: (venue) =>
    set((state) => ({
      booking: {
        ...state.booking,
        venueId: venue.id,
        venueName: venue.name,
        venueCity: venue.city,
      },
    })),
  setDate: (date) =>
    set((state) => ({
      booking: { ...state.booking, date },
    })),
  setSlot: (slot) =>
    set((state) => ({
      booking: {
        ...state.booking,
        slotId: slot.id,
        slotTime: slot.time,
        slotEndTime: slot.endTime,
        totalPrice: slot.price,
      },
    })),
  setCustomer: (name, email) =>
    set((state) => ({
      booking: { ...state.booking, customerName: name, customerEmail: email },
    })),
  reset: () =>
    set({
      booking: {
        venueId: '',
        venueName: '',
        venueCity: '',
        slotId: '',
        slotTime: '',
        slotEndTime: '',
        customerName: '',
        customerEmail: '',
        date: null,
        totalPrice: 0,
      },
    }),
}));
