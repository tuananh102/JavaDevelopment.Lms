import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

// Local dev: VITE_API_URL trống -> "/api/v1" đi qua mock server (server.ts).
// Production: .env.production đặt VITE_API_URL trỏ tới backend Azure.
const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Access-token refresh on 401 ---------------------------------------------
// When a request 401s because the short-lived access token expired, transparently
// exchange the refresh token for a new pair and retry the original request once.
// A single in-flight refresh is shared across concurrent 401s so we don't fire N
// refreshes at once. If refresh fails (or there's no refresh token), we log out.
function redirectToLogin() {
  if (!window.location.hash.startsWith("#/login")) {
    // App dùng HashRouter (GitHub Pages) -> điều hướng bằng hash route.
    window.location.hash = "#/login";
  }
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");
  // Bare axios (not `api`) so this call doesn't recurse through the interceptor.
  const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  const { token, refreshToken: newRefresh } = res.data;
  useAuthStore.getState().setTokens(token, newRefresh);
  return token;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const hasToken = !!localStorage.getItem("token");

    const isRefreshCall = original?.url?.includes("/auth/refresh");

    // Only attempt a refresh for an authenticated session, once per request, and
    // never for the refresh call itself.
    if (status === 401 && hasToken && !original?._retry && !isRefreshCall) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        refreshPromise = null;
        useAuthStore.getState().logout();
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    // Session truly gone (refresh failed/absent) — log out. A guest hitting a 401
    // (no token) is NOT bounced, since that isn't a session-expiry.
    if (status === 401 && hasToken && isRefreshCall) {
      useAuthStore.getState().logout();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export default api;
