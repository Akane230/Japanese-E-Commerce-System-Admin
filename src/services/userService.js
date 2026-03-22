/**
 * User Service
 * Handles user management and querying
 * NOTE: Backend needs user list/management endpoints for full functionality
 */
import api from "./api";

export const userService = {
  /**
   * Get current user profile
   * @returns {Promise<User>}
   */
  async getCurrentUser() {
    return api.get("/auth/me/");
  },

  /**
   * Get user by ID
   * NOTE: This endpoint may not exist in backend yet
   * @param {string} userId - User ID
   * @returns {Promise<User>}
   */
  async getUserById(userId) {
    // TODO: Backend needs to provide user detail endpoint
    return api.get(`/users/${userId}/`);
  },

  /**
   * List all users (admin only)
   * NOTE: This endpoint may not exist in backend yet
   * @param {number} page - Page number
   * @param {string} search - Search query
   * @param {string} role - Role filter (admin|customer|all)
   * @returns {Promise<{results, count, next, previous}>}
   */
  async listUsers(page = 1, search = "", role = "") {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (search) params.append("search", search);
    if (role && role !== "all") params.append("role", role);

    // TODO: Backend needs to provide user list endpoint
    return api.get(`/users/admin/?${params.toString()}`);
  },

  /**
   * Update user role
   * NOTE: This endpoint may not exist in backend yet
   * @param {string} userId - User ID
   * @param {string} role - New role (admin|customer)
   * @returns {Promise<User>}
   */
  async updateUserRole(userId, role) {
    // TODO: Backend needs to provide user role update endpoint
    return api.patch(`/users/${userId}/role/`, { role });
  },

  /**
   * Disable user account
   * NOTE: This endpoint may not exist in backend yet
   * @param {string} userId - User ID
   * @param {string} reason - Reason for disabling
   * @returns {Promise<any>}
   */
  async disableUser(userId, reason = "") {
    // TODO: Backend needs to provide user disable endpoint
    return api.post(`/users/${userId}/disable/`, { reason });
  },

  /**
   * Enable user account
   * NOTE: This endpoint may not exist in backend yet
   * @param {string} userId - User ID
   * @returns {Promise<any>}
   */
  async enableUser(userId) {
    // TODO: Backend needs to provide user enable endpoint
    return api.post(`/users/${userId}/enable/`, {});
  },

  /**
   * Update user profile
   * @param {Object} data - User profile data
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

export default userService;
