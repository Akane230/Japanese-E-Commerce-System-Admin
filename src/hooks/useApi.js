import { useCallback } from "react";
import useAuthStore from "../stores/authStore";
import useToastStore from "../stores/toastStore";

export function useApi() {
  const call = useAuthStore((state) => state.call);
  const addToast = useToastStore((state) => state.addToast);

  const apiCall = useCallback(
    async (method, path, body, options = {}) => {
      const { showSuccessToast = false, successMessage = "Success!" } = options;

      try {
        const result = await call(method, path, body);
        if (showSuccessToast) {
          addToast(successMessage, "success");
        }
        return result;
      } catch (err) {
        addToast(err.message, "error");
        throw err;
      }
    },
    [call, addToast],
  );

  return apiCall;
}
