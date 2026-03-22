import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";
import authService from "../services/authService";

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token");

  // Use authService to refresh token
  const response = await authService.refreshToken(refresh);
  if (!response.access) throw new Error("Refresh failed");

  return response.access;
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: "",
      user: null,

      // Actions
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem("access", token);
        }
      },

      setUser: (user) => set({ user }),

      /**
       * Admin login
       */
      login: async (email, password) => {
        const { user, tokens } = await authService.login(email, password);

        set({
          token: tokens.access,
          user,
        });
      },

      /**
       * Admin logout
       */
      logout: async () => {
        const refresh = localStorage.getItem("refresh");

        if (refresh) {
          try {
            await authService.logout(refresh);
          } catch {
            // Ignore errors during logout
          }
        }

        // Clear state
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        set({ token: "", user: null });
      },

      /**
       * Load user profile
       */
      loadProfile: async () => {
        try {
          const user = await authService.getProfile();
          set({ user });
          return user;
        } catch (error) {
          // If profile load fails, user may be unauthorized
          get().logout();
          throw error;
        }
      },

      /**
       * Make API call with automatic token refresh on 401
       */
      call: async (method, path, body) => {
        const { token } = get();
        const m = method.toLowerCase();

        const makeRequest = async (useToken) => {
          const config = {
            method: m,
            url: path,
            headers: {},
          };

          if (useToken) {
            config.headers.Authorization = `Bearer ${useToken}`;
          }

          if (m === "get" || m === "delete") {
            if (body) config.params = body;
          } else if (body) {
            config.data = body;
          }

          try {
            const res = await api.client.request(config);
            const json = res.data;

            // Check for success flag
            const successFlag =
              json && typeof json === "object" && "success" in json
                ? json.success
                : true;

            if (successFlag === false) {
              const message =
                (json && (json.message || json.detail)) || "Request failed";
              const error = new Error(message);
              error.status = res.status;
              error.payload = json;
              throw error;
            }

            if (json && typeof json === "object" && "data" in json) {
              return json.data;
            }

            return json;
          } catch (err) {
            if (err.response) {
              const { status, data } = err.response;
              const message =
                (data && (data.message || data.detail)) ||
                err.message ||
                `Request failed with status ${status}`;
              const error = new Error(message);
              error.status = status;
              error.payload = data;
              throw error;
            }
            throw err;
          }
        };

        try {
          return await makeRequest(token);
        } catch (e) {
          // If 401, try to refresh token and retry once
          if (e.status === 401) {
            try {
              const newToken = await refreshAccessToken();
              set({ token: newToken });
              return await makeRequest(newToken);
            } catch (refreshError) {
              // Refresh failed, logout
              get().logout();
              throw e;
            }
          }
          throw e;
        }
      },

      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

export default useAuthStore;
