/**
 * Authentication Service
 * Handles admin login, logout, token management, and authentication state
 */
import api from "./api";

export const authService = {
  /**
   * Admin login
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<{user, tokens}>}
   */
  async login(email, password) {
    const response = await api.post("/auth/admin-login/", { email, password });

    if (!response.user || !response.user.is_staff) {
      throw new Error("You do not have admin access.");
    }

    // Store tokens
    localStorage.setItem("access", response.tokens.access);
    localStorage.setItem("refresh", response.tokens.refresh);

    return response;
  },

  /**
   * Admin logout
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<any>}
   */
  async logout(refreshToken) {
    try {
      await api.post("/auth/logout/", { refresh: refreshToken });
    } catch {
      // Ignore logout errors
    }

    // Clear local tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{access: string}>}
   */
  async refreshToken(refreshToken) {
    const response = await api.post("/auth/token/refresh/", {
      refresh: refreshToken,
    });

    if (response.access) {
      localStorage.setItem("access", response.access);
    }

    return response;
  },

  /**
   * Get current user profile
   * @returns {Promise<User>}
   */
  async getProfile() {
    return api.get("/auth/me/");
  },

  /**
   * Update user profile
   * @param {Object} data - Profile data to update
   * @returns {Promise<User>}
   */
  async updateProfile(data) {
    return api.put("/auth/profile/", data);
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<any>}
   */
  async changePassword(currentPassword, newPassword) {
    return api.post("/auth/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

export default authService;
