import { describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api';

// A Response body can only be read once, so every call gets a fresh one
const mockFetch = (status: number, body?: unknown) => {
  const fetchMock = vi.fn().mockImplementation(
    async () =>
      new Response(body === undefined ? null : JSON.stringify(body), {
        status,
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

// Runs a request that is expected to fail and returns the error it threw
const failure = async (request: Promise<unknown>): Promise<ApiError> => {
  try {
    await request;
  } catch (err) {
    return err as ApiError;
  }
  throw new Error('Expected the request to fail');
};

describe('apiFetch', () => {
  it('calls the API base URL and always sends the session cookie', async () => {
    const fetchMock = mockFetch(200, { ok: true });

    const data = await apiFetch('/venues');

    expect(data).toEqual({ ok: true });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/api/venues');
    expect(options.credentials).toBe('include');
  });

  it('sets a JSON content type only when there is a body', async () => {
    const fetchMock = mockFetch(200, {});

    await apiFetch('/venues');
    await apiFetch('/auth/login', { method: 'POST', body: '{}' });

    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty(
      'Content-Type',
    );
    expect(fetchMock.mock.calls[1][1].headers).toHaveProperty(
      'Content-Type',
      'application/json',
    );
  });

  it('returns undefined for a 204 response', async () => {
    mockFetch(204);

    expect(await apiFetch('/auth/logout', { method: 'POST' })).toBeUndefined();
  });

  it('turns an error response into an ApiError with the status and code', async () => {
    mockFetch(409, {
      error: 'Slot is fully booked',
      code: 'SLOT_FULLY_BOOKED',
    });

    const error = await failure(apiFetch('/bookings'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.code).toBe('SLOT_FULLY_BOOKED');
    expect(error.message).toBe('Slot is fully booked');
  });

  it('shows the first validation message when there are details', async () => {
    mockFetch(400, {
      error: 'Validation failed',
      code: 'VALIDATION_FAILED',
      details: [
        { message: 'Password must be at least 8 characters' },
        { message: 'Other' },
      ],
    });

    const error = await failure(apiFetch('/auth/register'));

    expect(error.message).toBe('Password must be at least 8 characters');
  });

  it('still throws a useful error when the body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('<html>Bad gateway</html>', { status: 502 }),
        ),
    );

    const error = await failure(apiFetch('/venues'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBe('Request failed: 502');
  });
});
