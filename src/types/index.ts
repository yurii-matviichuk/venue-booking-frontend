export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  timezone: string;
  category: string;
  description: string;
  imageFile: string | null;
  // Lowest price per spot among upcoming slots; null when the venue has none
  minPricePerSpot: number | null;
}

export interface TimeSlot {
  id: string;
  time: string;
  endTime: string;
  price: number;
  available: boolean;
  spotsRemaining: number;
}

export interface Booking {
  venueId: string;
  venueName: string;
  venueCity: string;
  venueTimezone: string;
  slotId: string;
  slotTime: string;
  slotEndTime: string;
  customerName: string;
  customerEmail: string;
  date: Date | null;
  pricePerSpot: number;
  spots: number;
  slotSpotsRemaining: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface MyBooking {
  id: string;
  venueId: string;
  slotId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  price: number;
  venueName: string;
  venueLocation: string;
  startTime: string;
  endTime: string;
}
