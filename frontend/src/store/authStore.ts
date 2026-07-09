import { create } from "zustand";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken?: string | null) => void;
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken?: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";

// The JWT lives in localStorage so it survives refreshes. The user object must be
// persisted alongside it — otherwise after a refresh the token is present (so the app
// thinks you're logged in) but `user` is null, which blanks the header name and hides
// the "Instructor Area" link. We rehydrate from localStorage on store creation and
// re-validate against /users/me on app start (see useAuthBootstrap).
function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_KEY),
  setAuth: (user, token, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    set({ user, token, refreshToken: refreshToken ?? get().refreshToken });
  },
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
  setTokens: (token, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    set({ token, refreshToken: refreshToken ?? get().refreshToken });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, refreshToken: null });
  },
  isAuthenticated: () => !!get().token,
}));
