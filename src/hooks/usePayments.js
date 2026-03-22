import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import paymentService from "../services/paymentService";

export function usePayments({ page = 1, search = "" } = {}) {
  return useQuery({
    queryKey: ["payments", { page, search }],
    queryFn: () => paymentService.getPendingPayments(page, search),
    keepPreviousData: true,
  });
}

export function usePayment(paymentId) {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => paymentService.getPayment(paymentId),
    enabled: !!paymentId,
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, status }) =>
      paymentService.updateStatus(paymentId, status),
    onSuccess: (data, vars) => {
      qc.invalidateQueries(["payments"]);
      if (vars?.paymentId) qc.invalidateQueries(["payment", vars.paymentId]);
    },
  });
}
export function useConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => paymentService.confirmPayment(orderId),
    onSuccess: () => {
      qc.invalidateQueries(["payments"]);
      qc.invalidateQueries(["orders"]);
    },
  });
}

export function useRejectPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }) =>
      paymentService.rejectPayment(orderId, reason),
    onSuccess: () => {
      qc.invalidateQueries(["payments"]);
      qc.invalidateQueries(["orders"]);
    },
  });
}

export function useProcessRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason, fullRefund, amount }) =>
      paymentService.processRefund(orderId, reason, fullRefund, amount),
    onSuccess: () => qc.invalidateQueries(["payments"]),
  });
}
