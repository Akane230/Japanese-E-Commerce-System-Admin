/**
 * Product Service
 * Handles product CRUD operations, listing, and management
 */
import api from "./api";

export const productService = {
  /**
   * Get products list
   * @param {number} page - Page number
   * @param {string} search - Search query
   * @param {string} category - Category filter
   * @param {string} sort - Sort by (newest|oldest|price_asc|price_desc|rating|popular)
   * @returns {Promise<{results, count, next, previous}>}
   */
  async listProducts(page = 1, search = "", category = "", sort = "newest") {
    const queryParams = {};

    if (page) queryParams.page = page;
    if (search && search.trim()) queryParams.search = search.trim();
    if (category) queryParams.category_id = category;
    if (sort) queryParams.sort_by = sort;

    const params = new URLSearchParams(queryParams).toString();
    const url = params ? `/products/?${params}` : "/products/";

    return api.get(url);
  },

  /**
   * Get product detail by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Product>}
   */
  async getProduct(slug) {
    return api.get(`/products/${slug}/`);
  },

  /**
   * Create new product
   * @param {FormData} formData - Product data with file uploads
   * @returns {Promise<Product>}
   */
  async createProduct(formData) {
    // Use FormData directly for file uploads
    return api.post(`/products/admin/create/`, formData);
  },

  /**
   * Update product
   * @param {string} slug - Product slug
   * @param {FormData} formData - Updated product data
   * @returns {Promise<Product>}
   */
  async updateProduct(slug, formData) {
    return api.put(`/products/${slug}/admin/`, formData);
  },

  /**
   * Delete product
   * @param {string} slug - Product slug
   * @returns {Promise<any>}
   */
  async deleteProduct(slug) {
    return api.delete(`/products/${slug}/admin/delete/`);
  },

  /**
   * Get featured products
   * @returns {Promise<Product[]>}
   */
  async getFeaturedProducts() {
    return api.get(`/products/featured/`);
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @returns {Promise<Product[]>}
   */
  async searchProducts(query) {
    return api.get(`/products/search/?q=${encodeURIComponent(query)}`);
  },
};

export default productService;
