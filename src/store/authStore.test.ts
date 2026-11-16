import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { useBookingStore } from './bookingStore';

const user = {
  id: 'u1',
  email: 'jane@example.com',
  name: 'Jane',
  role: 'customer',
  createdAt: '2026-11-01T00:00:00.000Z',
};

const respond = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

beforeEach(() => {
  useAuthStore.setState({ user: null, initialized: false });
  useBookingStore.getState().reset();
});

describe('fetchMe', () => {
  it('stores the user when the session is valid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(200, { user })));

    await useAuthStore.getState().fetchMe();

    expect(useAuthStore.getState()).toMatchObject({ user, initialized: true });
  });

  it('treats 401 as "nobody is logged in" without logging an error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respond(401, {
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        }),
      ),
    );

    await useAuthStore.getState().fetchMe();

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      initialized: true,
    });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('logs other failures but still finishes loading, so the app does not hang', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    await useAuthStore.getState().fetchMe();

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      initialized: true,
    });
    expect(consoleError).toHaveBeenCalled();
  });
});

describe('login', () => {
  it('stores the user and sends the credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond(200, { user }));
    vi.stubGlobal('fetch', fetchMock);

    await useAuthStore.getState().login('jane@example.com', 'secret-password');

    expect(useAuthStore.getState().user).toEqual(user);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/api/auth/login');
    expect(JSON.parse(options.body)).toEqual({
      email: 'jane@example.com',
      password: 'secret-password',
    });
  });

  it('leaves the user logged out and rethrows when the credentials are wrong', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respond(401, {
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        }),
      ),
    );

    await expect(
      useAuthStore.getState().login('jane@example.com', 'wrong'),
    ).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('logout', () => {
  it('clears the user and the previous booking selection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respond(204)));
    useAuthStore.setState({
      user: { ...user, role: 'customer' },
      initialized: true,
    });
    useBookingStore.setState({
      booking: {
        ...useBookingStore.getState().booking,
        venueId: 'v1',
        slotId: 's1',
        pricePerSpot: 30,
      },
    });

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useBookingStore.getState().booking).toMatchObject({
      venueId: '',
      slotId: '',
      pricePerSpot: 0,
    });
  });
});
