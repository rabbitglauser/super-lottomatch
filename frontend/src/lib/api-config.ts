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

function resolveApiBaseUrl() {
  const configuredUrl =
    cleanUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ??
    cleanUrl(process.env.NEXT_PUBLIC_API_URL);

  if (configuredUrl && !isSupabaseProjectUrl(configuredUrl)) {
    return configuredUrl;
  }

  if (configuredUrl && process.env.NODE_ENV === "production") {
    return PRODUCTION_API_BASE_URL;
  }

  return LOCAL_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
