import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import reviewService from "../services/reviewService";

export function useAdminReviews(status = "pending", page = 1) {
  return useQuery({
    queryKey: ["adminReviews", status, page],
    queryFn: () =>
      status === "pending"
        ? reviewService.getPendingReviews(page)
        : reviewService.getReviewsByStatus(status, page),
    keepPreviousData: true,
  });
}

export function useProductReviews(productId, page = 1) {
  return useQuery({
    queryKey: ["productReviews", productId, page],
    queryFn: () => reviewService.getProductReviews(productId, page),
    enabled: !!productId,
    keepPreviousData: true,
  });
}

export function useModerateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, action, note }) =>
      reviewService.moderateReview(reviewId, action, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminReviews"] });
    },
  });
}

export function useVoteHelpful() {
  return useMutation({
    mutationFn: ({ reviewId, helpful }) =>
      reviewService.voteHelpful(reviewId, helpful),
  });
}
