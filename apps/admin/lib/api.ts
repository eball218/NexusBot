import { API_URL, WEB_URL } from '@/lib/constants';

const API_BASE = API_URL;

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

let isRefreshing = false;

export async function authApi<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const tokens = getTokens();
  if (!tokens) {
    window.location.href = `${WEB_URL}/login`;
    throw new ApiError(401, 'UNAUTHORIZED', 'Not logged in');
  }

  try {
    return await api<T>(path, { ...options, token: tokens.accessToken });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) {
      throw err;
    }

    // Prevent infinite refresh loops
    if (isRefreshing) {
      clearTokens();
      window.location.href = `${WEB_URL}/login`;
      throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
    }

    isRefreshing = true;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!res.ok) {
        clearTokens();
        window.location.href = `${WEB_URL}/login`;
        throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
      }

      const json = await res.json();
      const { accessToken, refreshToken } = json as {
        accessToken: string;
        refreshToken: string;
      };
      setTokens(accessToken, refreshToken);

      // Retry the original request with the new access token
      return await api<T>(path, { ...options, token: accessToken });
    } catch (refreshErr) {
      if (refreshErr instanceof ApiError) {
        throw refreshErr;
      }
      clearTokens();
      window.location.href = `${WEB_URL}/login`;
      throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
    } finally {
      isRefreshing = false;
    }
  }
}
