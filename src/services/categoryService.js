/**
 * Category Service
 * Handles category CRUD operations and listing
 */
import api from "./api";

export const categoryService = {
  /**
   * Get all categories
   * @returns {Promise<Category[]>}
   */
  async listCategories() {
    return api.get(`/categories/`);
  },

  /**
   * Get category by slug
   * @param {string} slug - Category slug
   * @returns {Promise<Category>}
   */
  async getCategory(slug) {
    return api.get(`/categories/${slug}/`);
  },

  /**
   * Create new category
   * @param {Object} data - Category data
   * @returns {Promise<Category>}
   */
  async createCategory(data) {
    return api.post(`/categories/create/`, data);
  },

  /**
   * Update category
   * @param {string} slug - Category slug
   * @param {Object} data - Updated category data
   * @returns {Promise<Category>}
   */
  async updateCategory(slug, data) {
    return api.put(`/categories/${slug}/update/`, data);
  },

  /**
   * Delete category - currently no delete endpoint in backend
   * @param {string} slug - Category slug
   * @returns {Promise<any>}
   */
  async deleteCategory(slug) {
    // TODO: Backend may need to add delete endpoint
    return api.delete(`/categories/${slug}/`);
  },
};

export default categoryService;
