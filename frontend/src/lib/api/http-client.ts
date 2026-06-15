import { API_BASE_URL, getRuntimeApiBaseUrl } from "@/lib/api-config";

export class RuntimeApiClient {
  constructor(private readonly configuredBaseUrl: string | undefined = API_BASE_URL) {}

  shouldUseHttpApi() {
    if (!this.configuredBaseUrl) {
      return false;
    }

    if (typeof window === "undefined") {
      return true;
    }

    const isLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(
      this.configuredBaseUrl,
    );

    if (!isLocalApi) {
      return true;
    }

    const host = window.location.hostname;
    const isLocalView = ["localhost", "127.0.0.1"].includes(host);
    const isLanView = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
      host,
    );
    return isLocalView || isLanView;
  }

  async json<T>(path: string, options?: RequestInit): Promise<T> {
    if (!this.configuredBaseUrl) {
      throw new Error("API base URL is not configured");
    }

    const response = await fetch(`${getRuntimeApiBaseUrl()}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async blob(path: string): Promise<Blob> {
    if (!this.configuredBaseUrl) {
      throw new Error("API base URL is not configured");
    }

    const response = await fetch(`${getRuntimeApiBaseUrl()}${path}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.blob();
  }
}

export const runtimeApiClient = new RuntimeApiClient();
