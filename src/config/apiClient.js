import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7257";
const AUTH_REDIRECT_MESSAGE_KEY = "auth_redirect_message_key";

let isHandlingUnauthorized = false;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.config?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    const hasAccessToken = Boolean(sessionStorage.getItem("access_token"));

    if (
      error.response?.status === 401 &&
      hasAccessToken &&
      !isHandlingUnauthorized
    ) {
      isHandlingUnauthorized = true;
      localStorage.setItem(AUTH_REDIRECT_MESSAGE_KEY, "auth:accessExpired");
      sessionStorage.clear();

      // Token expired or invalid - dispatch logoutRequest to trigger saga
      // Lazy import to avoid circular dependency
      Promise.all([
        import("../redux/store"),
        import("../feature/auth/authSlice"),
      ])
        .then(([storeModule, authSliceModule]) => {
          const store = storeModule.default;
          const { logoutRequest } = authSliceModule;
          store.dispatch(logoutRequest());
        })
        .finally(() => {
          // Redirect to login after logout is dispatched
          window.location.href = "/login";
        });
    }
    return Promise.reject(error);
  },
);

export default apiClient;
