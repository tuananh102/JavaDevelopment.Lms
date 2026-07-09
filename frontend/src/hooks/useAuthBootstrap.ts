import { useEffect } from "react";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

/**
 * On app start, if a token is present, re-fetch the current user from /users/me and
 * refresh the store. This keeps the persisted user in sync (role/name changes) and
 * validates the token — a stale/expired token triggers a 401, and the axios response
 * interceptor logs the user out. The persisted user (from localStorage) is used
 * immediately so there's no flash of a logged-out header before this resolves.
 */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    let cancelled = false;
    api
      .get("/users/me")
      .then((res) => {
        if (!cancelled) setUser(res.data);
      })
      .catch(() => {
        // 401 is handled by the response interceptor (logout + redirect).
        // Other errors (e.g. backend down) leave the persisted user in place.
      });
    return () => {
      cancelled = true;
    };
  }, [setUser]);
}
