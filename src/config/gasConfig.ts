/**
 * @file gasConfig.ts
 * @description Global configuration and persistence for Google Apps Script Web App URL
 */

// Default Fallback GAS Web App URL (if defined via environment or school deployment)
export const DEFAULT_GAS_URL =
  ((import.meta as any).env?.VITE_GAS_URL as string) ||
  '';

export const STORAGE_KEY_GAS_URL = 'eduquest_gas_url';
export const STORAGE_KEY_GAS_CONNECTED = 'eduquest_gas_connected';
export const STORAGE_KEY_LAST_SYNC = 'eduquest_last_sync_time';

/**
 * Extracts GAS URL from current browser URL query string (e.g. ?gas=... or ?gasUrl=...)
 */
export function getGasUrlFromUrlParams(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const param = params.get('gas') || params.get('gasUrl') || params.get('url');
    if (param && param.trim().startsWith('http')) {
      return param.trim();
    }
  } catch (err) {
    console.warn('Failed to parse URL query params:', err);
  }
  return null;
}

/**
 * Gets the current active Google Apps Script URL with prioritized fallback:
 * 1. URL Query Parameter (?gas=... or ?gasUrl=...)
 * 2. LocalStorage saved URL
 * 3. Default Environment variable / configuration
 */
export function resolveActiveGasUrl(): string {
  // 1. Check URL parameters first
  const fromUrl = getGasUrlFromUrlParams();
  if (fromUrl) {
    try {
      localStorage.setItem(STORAGE_KEY_GAS_URL, fromUrl);
      localStorage.setItem(STORAGE_KEY_GAS_CONNECTED, 'true');
    } catch {
      // ignore storage error
    }
    return fromUrl;
  }

  // 2. Check localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GAS_URL);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // ignore
  }

  // 3. Fallback to default
  return DEFAULT_GAS_URL;
}

/**
 * Generates a full shareable student link containing the connected GAS URL
 * so anyone opening the link on any device will instantly be connected.
 */
export function generateShareableAppUrl(gasUrlOverride?: string): string {
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const activeUrl = (gasUrlOverride || resolveActiveGasUrl()).trim();

  if (!activeUrl) {
    return currentUrl;
  }

  // Create clean URL with ?gas=...
  const url = new URL(currentUrl || 'https://eduquest.app');
  url.searchParams.set('gas', activeUrl);
  return url.toString();
}
