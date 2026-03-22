import { useQuery } from "@tanstack/react-query";
import categoryService from "../services/categoryService";

// Returns a flattened list of categories suitable for select inputs
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await categoryService.listCategories();
      const data = response.data || response.results || response || [];

      const flatten = (cats, level = 0, out = []) => {
        cats.forEach((cat) => {
          out.push({ ...cat, level });
          if (cat.children && cat.children.length > 0) {
            flatten(cat.children, level + 1, out);
          }
        });
        return out;
      };

      return flatten(data);
    },
  });
}
