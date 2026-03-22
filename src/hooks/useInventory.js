import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import inventoryService from "../services/inventoryService";

export function useInventory(page = 1) {
  return useQuery({
    queryKey: ["inventory", page],
    queryFn: () => inventoryService.listInventory(page),
    keepPreviousData: true,
  });
}

export function useLowStock(page = 1) {
  return useQuery({
    queryKey: ["lowStock", page],
    queryFn: () => inventoryService.getLowStockItems(page),
    keepPreviousData: true,
  });
}

export function useInventoryDetail(productId) {
  return useQuery({
    queryKey: ["inventoryDetail", productId],
    queryFn: () => inventoryService.getInventoryDetail(productId),
    enabled: !!productId,
  });
}

export function useUpdateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity, reason }) =>
      inventoryService.updateInventory(productId, quantity, reason),
    onSuccess: (data, vars) => {
      qc.invalidateQueries(["inventory"]);
      if (vars?.productId)
        qc.invalidateQueries(["inventoryDetail", vars.productId]);
    },
  });
}

export function useRestock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity, supplierId, trackingNumber }) =>
      inventoryService.restock(productId, quantity, supplierId, trackingNumber),
    onSuccess: (data, vars) => {
      qc.invalidateQueries(["inventory"]);
      if (vars?.productId)
        qc.invalidateQueries(["inventoryDetail", vars.productId]);
    },
  });
}
