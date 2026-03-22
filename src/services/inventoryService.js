/**
 * Inventory Service
 * Handles inventory management, stock updates, and low stock tracking
 */
import api from "./api";

export const inventoryService = {
  /**
   * Get all inventory items
   * @param {number} page - Page number
   * @returns {Promise<{results, count, next, previous}>}
   */
  async listInventory(page = 1) {
    const params = new URLSearchParams();
    if (page) params.append("page", page);

    return api.get(`/inventory/?${params.toString()}`);
  },

  /**
   * Get low stock items
   * @param {number} page - Page number
   * @returns {Promise<{results, count, next, previous}>}
   */
  async getLowStockItems(page = 1) {
    const params = new URLSearchParams();
    if (page) params.append("page", page);

    return api.get(`/inventory/low-stock/?${params.toString()}`);
  },

  /**
   * Get inventory detail for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Inventory>}
   */
  async getInventoryDetail(productId) {
    return api.get(`/inventory/${productId}/`);
  },

  /**
   * Check product stock availability
   * @param {string} productId - Product ID
   * @returns {Promise<{available, quantity}>}
   */
  async checkStock(productId) {
    return api.get(`/inventory/${productId}/stock/`);
  },

  /**
   * Update inventory quantity
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   * @param {string} reason - Reason for update
   * @returns {Promise<Inventory>}
   */
  async updateInventory(productId, quantity, reason = "") {
    return api.post(`/inventory/${productId}/update/`, {
      quantity,
      reason,
    });
  },

  /**
   * Restock product
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @param {string} supplierId - Supplier ID
   * @param {string} trackingNumber - Tracking/reference number
   * @returns {Promise<Inventory>}
   */
  async restock(productId, quantity, supplierId = "", trackingNumber = "") {
    return api.post(`/inventory/${productId}/restock/`, {
      quantity,
      supplier_id: supplierId,
      tracking_number: trackingNumber,
    });
  },
};

export default inventoryService;
