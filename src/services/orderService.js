/**
 * Order Service
 * Handles order listing, detail retrieval, and status management
 */
import api from "./api";

export const orderService = {
  /**
   * Get admin order list
   * @param {number} page - Page number
   * @param {string} status - Filter by status
   * @param {string} search - Search query
   * @returns {Promise<{results, count, next, previous}>}
   */
  async listOrders(page = 1, status = "", search = "") {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    return api.get(`/orders/admin/?${params.toString()}`);
  },

  /**
   * Get order detail
   * @param {string} orderId - Order ID
   * @returns {Promise<Order>}
   */
  async getOrder(orderId) {
    return api.get(`/orders/${orderId}/`);
  },

  /**
   * Get order by order number
   * @param {string} orderNumber - Order number
   * @returns {Promise<Order>}
   */
  async getOrderByNumber(orderNumber) {
    return api.get(`/orders/number/${orderNumber}/`);
  },

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status (pending|processing|shipped|delivered|cancelled)
   * @param {string} note - Optional note
   * @returns {Promise<Order>}
   */
  async updateStatus(orderId, newStatus, note = "") {
    return api.put(`/orders/${orderId}/status/`, {
      status: newStatus,
      note,
    });
  },

  /**
   * Ship order
   * @param {string} orderId - Order ID
   * @param {string} carrier - Carrier name (e.g., DHL, FedEx, UPS)
   * @param {string} trackingNumber - Tracking number
   * @returns {Promise<Order>}
   */
  async shipOrder(orderId, carrier, trackingNumber) {
    return api.post(`/orders/${orderId}/ship/`, {
      carrier,
      tracking_number: trackingNumber,
    });
  },

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Order>}
   */
  async cancelOrder(orderId, reason = "") {
    return api.post(`/orders/${orderId}/cancel/`, { reason });
  },
};

export default orderService;
