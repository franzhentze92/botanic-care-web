import { useEffect } from 'react';

/**
 * React SPA lives in app.html; marketing home is static index.html at `/`.
 * Client-side navigation to `/` must perform a full load of that document.
 */
export function MarketingHomeRedirect() {
  useEffect(() => {
    window.location.replace('/');
  }, []);
  return null;
}
