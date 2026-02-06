import { useMutation } from "@tanstack/react-query";
import api from "../service/api";
import { toast } from "react-hot-toast";

export function useApiMutation({
                                   url,
                                   method = "post",
                                   successMsg = "Action completed successfully!",
                                   onSuccessExtra = () => {},
                                   onErrorExtra = () => {},
                                   axiosOptions = {}, // 👈 separate Axios options (responseType, headers, etc.)
                                   ...reactQueryOptions // 👈 React Query options
                               }) {
    return useMutation({
        mutationFn: async (data) => {
            let endpoint;
            let bodyOrParams;

            // handle url as fn or string
            if (
                typeof url === "function" &&
                data &&
                typeof data === "object" &&
                "id" in data
            ) {
                const { id, ...rest } = data;
                endpoint = url(id);
                bodyOrParams = rest;
            } else if (typeof url === "function") {
                endpoint = url(data);
                bodyOrParams = data;
            } else {
                endpoint = url;
                bodyOrParams = data;
            }

            const methodLower = method.toLowerCase();

            if (methodLower === "get") {
                const res = await api.get(endpoint, {
                    params: bodyOrParams || {},
                    ...axiosOptions, // ✅ pass responseType here
                });
                return res.data;
            }

            if (methodLower === "delete") {
                const res = await api.delete(endpoint, {
                    data: bodyOrParams || {},   // 👈 send body here
                    ...axiosOptions,
                });
                return res.data;
            }

            if (methodLower === "put" || methodLower === "patch") {
                const res = await api[methodLower](endpoint, bodyOrParams || {}, {
                    ...axiosOptions,
                });
                return res.data;
            }

            // POST and others
            const res = await api[methodLower](endpoint, bodyOrParams || {}, {
                ...axiosOptions,
            });
            return res.data;
        },

        onSuccess: (data, variables) => {
            onSuccessExtra(data, variables);
        },

        onError: (error) => {
            toast.error(error.response?.data?.error || error.message);
            onErrorExtra(error);
        },

        ...reactQueryOptions, // ✅ keep React Query options
    });
}
