/**
 * Payment Service
 * Handles payment verification, confirmation, rejection, and refunds
 */
import api from "./api";

export const paymentService = {
  /**
   * Get pending payment confirmations
   * @param {number} page - Page number
   * @param {string} search - Search query
   * @returns {Promise<{results, count, next, previous}>}
   */
  async getPendingPayments(page = 1, search = "") {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (search) params.append("search", search);

    return api.get(`/payments/admin/pending/?${params.toString()}`);
  },

  /**
   * Get payment instructions for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<{method, instructions, fields_required}>}
   */
  async getPaymentInstructions(orderId) {
    return api.get(`/payments/instructions/${orderId}/`);
  },

  /**
   * Get all payment methods and instructions
   * @returns {Promise<{methods: Array}>}
   */
  async getAllPaymentMethods() {
    return api.get(`/payments/methods/`);
  },

  /**
   * Confirm payment submission
   * @param {string} orderId - Order ID
   * @returns {Promise<any>}
   */
  async confirmPayment(orderId) {
    return api.post(`/payments/confirm/${orderId}/`, {});
  },

  /**
   * Reject payment submission
   * @param {string} orderId - Order ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<any>}
   */
  async rejectPayment(orderId, reason) {
    return api.post(`/payments/reject/${orderId}/`, { reason });
  },

  /**
   * Process refund for an order
   * @param {string} orderId - Order ID
   * @param {string} reason - Refund reason
   * @param {boolean} fullRefund - Full refund (true) or partial refund (false)
   * @param {number} amount - Amount to refund (if partial)
   * @returns {Promise<any>}
   */
  async processRefund(orderId, reason, fullRefund = true, amount = null) {
    const data = {
      reason,
      full_refund: fullRefund,
    };

    if (!fullRefund && amount) {
      data.amount = amount;
    }

    return api.post(`/payments/refund/${orderId}/`, data);
  },
};

export default paymentService;
