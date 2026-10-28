import { create } from 'zustand';
import { apiFetch, ApiError } from '../lib/api';
import { useBookingStore } from './bookingStore';
import type { User } from '../types';

interface AuthStore {
  user: User | null;
  initialized: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  initialized: false,
  fetchMe: async () => {
    try {
      const { user } = await apiFetch<{ user: User }>('/auth/me');
      set({ user, initialized: true });
    } catch (err) {
      // 401 just means nobody is logged in
      if (!(err instanceof ApiError && err.status === 401)) {
        console.error('Failed to load session:', err);
      }
      set({ user: null, initialized: true });
    }
  },
  login: async (email, password) => {
    const { user } = await apiFetch<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    set({ user });
  },
  register: async (name, email, password) => {
    const { user } = await apiFetch<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    set({ user });
  },
  logout: async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    // Don't leave the previous user's slot selection for the next person
    useBookingStore.getState().reset();
    set({ user: null });
  },
}));
