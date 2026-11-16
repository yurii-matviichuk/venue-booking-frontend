import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../store/authStore';
import RequireAuth from './RequireAuth';

// Shows where the redirect came from, so the test can check the original path was kept
function LoginStub() {
  const from = (useLocation().state as { from?: string } | null)?.from;
  return <div>{`Login page (from ${from})`}</div>;
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/login" element={<LoginStub />} />
        <Route
          path="/owner"
          element={
            <RequireAuth role="owner">
              <div>Owner area</div>
            </RequireAuth>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <RequireAuth>
              <div>Secret bookings</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

// Without vitest globals, Testing Library doesn't clean up between tests by itself
afterEach(cleanup);

beforeEach(() => {
  useAuthStore.setState({ user: null, initialized: false });
});

describe('RequireAuth', () => {
  it('waits for the session check instead of redirecting too early', () => {
    renderAt('/my-bookings');

    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.queryByText(/Login page/)).toBeNull();
  });

  it('redirects to /login and remembers the original path when logged out', () => {
    useAuthStore.setState({ user: null, initialized: true });

    renderAt('/my-bookings');

    expect(screen.getByText('Login page (from /my-bookings)')).toBeTruthy();
    expect(screen.queryByText('Secret bookings')).toBeNull();
  });

  it('shows the page when logged in', () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        email: 'jane@example.com',
        name: 'Jane',
        role: 'customer',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
      initialized: true,
    });

    renderAt('/my-bookings');

    expect(screen.getByText('Secret bookings')).toBeTruthy();
  });

  describe('with a required role', () => {
    const userWithRole = (role: 'customer' | 'owner') => ({
      id: 'u1',
      email: 'jane@example.com',
      name: 'Jane',
      role,
      createdAt: '2026-11-01T00:00:00.000Z',
    });

    it('shows the page to a user with that role', () => {
      useAuthStore.setState({ user: userWithRole('owner'), initialized: true });

      renderAt('/owner');

      expect(screen.getByText('Owner area')).toBeTruthy();
    });

    it('sends a logged-in user with another role to the home page', () => {
      useAuthStore.setState({
        user: userWithRole('customer'),
        initialized: true,
      });

      renderAt('/owner');

      expect(screen.getByText('Home page')).toBeTruthy();
      expect(screen.queryByText('Owner area')).toBeNull();
    });

    it('still sends a logged-out visitor to /login', () => {
      useAuthStore.setState({ user: null, initialized: true });

      renderAt('/owner');

      expect(screen.getByText('Login page (from /owner)')).toBeTruthy();
    });
  });
});
