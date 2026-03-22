import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import orderService from "../services/orderService";

export function useOrders({ page = 1, status = "", search = "" } = {}) {
  return useQuery({
    queryKey: ["orders", { page, status, search }],
    queryFn: () => orderService.listOrders(page, status, search),
    keepPreviousData: true,
  });
}

export function useOrder(orderId) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, newStatus, note }) =>
      orderService.updateStatus(orderId, newStatus, note),
    onSuccess: (data, vars) => {
      qc.invalidateQueries(["orders"]);
      if (vars?.orderId) qc.invalidateQueries(["order", vars.orderId]);
    },
  });
}

export function useShipOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, carrier, trackingNumber }) =>
      orderService.shipOrder(orderId, carrier, trackingNumber),
    onSuccess: (data, vars) => {
      qc.invalidateQueries(["orders"]);
      if (vars?.orderId) qc.invalidateQueries(["order", vars.orderId]);
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }) =>
      orderService.cancelOrder(orderId, reason),
    onSuccess: (data, vars) => {
      qc.invalidateQueries(["orders"]);
      if (vars?.orderId) qc.invalidateQueries(["order", vars.orderId]);
    },
  });
}
