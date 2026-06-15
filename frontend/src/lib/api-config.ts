const LOCAL_API_BASE_URL = "http://localhost:8000";
const PRODUCTION_API_BASE_URL = "https://super-lottomatch.onrender.com";

function cleanUrl(value: string | undefined) {
  const cleanedValue = value?.trim().replace(/\/+$/, "");
  return cleanedValue || undefined;
}

function isSupabaseProjectUrl(value: string) {
  try {
    return new URL(value).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function hasSupabaseConfig() {
  return Boolean(
    cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}

function resolveApiBaseUrl() {
  const configuredUrl =
    cleanUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ??
    cleanUrl(process.env.NEXT_PUBLIC_API_URL);

  if (configuredUrl && !isSupabaseProjectUrl(configuredUrl)) {
    return configuredUrl;
  }

  if (!configuredUrl && hasSupabaseConfig()) {
    return undefined;
  }

  if (configuredUrl && process.env.NODE_ENV === "production") {
    return PRODUCTION_API_BASE_URL;
  }

  return LOCAL_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

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
