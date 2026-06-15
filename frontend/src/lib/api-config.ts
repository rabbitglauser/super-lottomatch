function cleanUrl(value: string | undefined) {
  const cleanedValue = value?.trim().replace(/\/+$/, "");
  return cleanedValue || undefined;
}

function resolveApiBaseUrl() {
  return (
    cleanUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ??
    cleanUrl(process.env.NEXT_PUBLIC_API_URL)
  );
}

export const API_BASE_URL = resolveApiBaseUrl();

<<<<<<< HEAD
export const HAS_EXPLICIT_API_BASE_URL = Boolean(API_BASE_URL);

export const HAS_SUPABASE_MODE = Boolean(
  cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    cleanUrl(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
);
=======
// Private-network host ranges (RFC 1918). Used to detect a LAN device such as a
// phone on the dev WiFi — public hostnames (e.g. the Vercel domain) never match.
const PRIVATE_LAN_HOST =
  /^(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/;

/**
 * Resolves the API base URL at runtime. When the configured API points at
 * localhost but the page is opened from a device on the LAN (e.g. a phone via the
 * dev machine's IP), the API host is rewritten to the current page hostname so
 * requests reach the dev machine instead of the phone itself. Public hostnames are
 * left untouched, so the production Vercel -> Render path is unaffected.
 */
export function getRuntimeApiBaseUrl(): string {
  if (typeof window === "undefined" || !API_BASE_URL) {
    return API_BASE_URL ?? "";
  }

  const apiUrl = new URL(API_BASE_URL);
  const apiIsLocal = ["localhost", "127.0.0.1"].includes(apiUrl.hostname);

  if (apiIsLocal && PRIVATE_LAN_HOST.test(window.location.hostname)) {
    apiUrl.hostname = window.location.hostname;
  }

  return apiUrl.origin;
}
>>>>>>> 566d6c48aa6a9b1fd8a096f9316d611aa984a842
