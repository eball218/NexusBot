'use client';

import { useEffect } from 'react';

export function TokenHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refresh = params.get('refresh');

    if (token && refresh) {
      localStorage.setItem('nexusbot_access_token', token);
      localStorage.setItem('nexusbot_refresh_token', refresh);

      // Remove token params from the URL without triggering a reload
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      url.searchParams.delete('refresh');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  return null;
}
