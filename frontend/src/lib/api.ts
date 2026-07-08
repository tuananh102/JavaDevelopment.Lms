import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Local dev: VITE_API_URL trống -> "/api/v1" đi qua mock server (server.ts).
// Production: .env.production đặt VITE_API_URL trỏ tới backend Azure.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
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
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Chỉ đá về /login khi PHIÊN thực sự hết hạn: có token nhưng bị 401.
    // Khách chưa đăng nhập gặp 401 (vd. gọi /enrollments/.../check) KHÔNG được
    // đá đi — đó không phải lỗi phiên.
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      useAuthStore.getState().logout();
      // App dùng HashRouter (GitHub Pages) -> phải điều hướng bằng hash route,
      // không dùng path tuyệt đối "/login" (sẽ ra URL không tồn tại trên Pages).
      if (!window.location.hash.startsWith("#/login")) {
        window.location.hash = "#/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
