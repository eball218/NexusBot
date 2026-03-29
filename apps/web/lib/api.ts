const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json.code || 'UNKNOWN_ERROR',
      json.error || 'Something went wrong',
      json.details,
    );
  }

  return json.data as T;
}

// Auth helpers
export function getTokens(): { accessToken: string; refreshToken: string } | null {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem('nexusbot_access_token');
  const refreshToken = localStorage.getItem('nexusbot_refresh_token');
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('nexusbot_access_token', accessToken);
  localStorage.setItem('nexusbot_refresh_token', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('nexusbot_access_token');
  localStorage.removeItem('nexusbot_refresh_token');
}

export async function authApi<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const tokens = getTokens();
  if (!tokens) throw new ApiError(401, 'UNAUTHORIZED', 'Not logged in');
  return api<T>(path, { ...options, token: tokens.accessToken });
}
