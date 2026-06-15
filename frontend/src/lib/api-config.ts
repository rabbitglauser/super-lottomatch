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

export const HAS_EXPLICIT_API_BASE_URL = Boolean(API_BASE_URL);

export const HAS_SUPABASE_MODE = Boolean(
  cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    cleanUrl(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
);
