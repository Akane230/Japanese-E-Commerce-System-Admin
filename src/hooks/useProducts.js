import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import productService from "../services/productService";

// Fetch a paginated list of products with optional search
export function useProducts({ search = "", page = 1 } = {}) {
  return useQuery({
    queryKey: ["products", { search, page }],
    queryFn: () => productService.listProducts(page, search),
    keepPreviousData: true,
  });
}

// Fetch a single product by slug
export function useProduct(slug) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getProduct(slug),
    enabled: !!slug,
  });
}

// Mutations
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, formData }) =>
      productService.updateProduct(slug, formData),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      if (variables?.slug) {
        qc.invalidateQueries(["product", variables.slug]);
      }
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
