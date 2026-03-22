import api from "./api";

export const reviewService = {
  async getPendingReviews(page = 1) {
    return api.get(`/reviews/admin/pending/?page=${page}`);
  },

  async getReviewsByStatus(status, page = 1) {
    return api.get(`/reviews/admin/?moderation_status=${status}&page=${page}`);
  },

  async getProductReviews(productId, page = 1) {
    return api.get(`/reviews/product/${productId}/?page=${page}`);
  },

  async moderateReview(reviewId, action, note = "") {
    return api.post(`/reviews/admin/${reviewId}/moderate/`, { action, note });
  },

  async voteHelpful(reviewId, helpful = true) {
    return api.post(`/reviews/${reviewId}/helpful/`, { helpful });
  },
};

export default reviewService;
