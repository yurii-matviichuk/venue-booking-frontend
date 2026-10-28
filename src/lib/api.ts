export const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Sends the auth cookie and turns the backend's { error, code, details } body into an ApiError
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    // Validation errors carry zod issues; the first one is the most useful to show
    const detail = Array.isArray(body?.details)
      ? body.details[0]?.message
      : undefined;
    throw new ApiError(
      response.status,
      detail ?? body?.error ?? `Request failed: ${response.status}`,
      body?.code,
    );
  }

  return response.status === 204 ? (undefined as T) : response.json();
}
