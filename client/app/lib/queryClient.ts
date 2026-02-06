// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import api from "../service/api";
import toast from "react-hot-toast";

// Generic API request wrapper
export async function apiRequest<T = any>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: unknown
): Promise<T> {
    try {
        const res = await api.request<T>({
            method,
            url,
            data,
        });
        return res.data;
    } catch (error: any) {
        console.error("API Error:", error);

        // Axios error handling
        if (error.response) {
            const msg = error.response.data?.message || error.response.statusText;
            toast.error(msg);
            throw new Error(msg);
        } else {
            toast.error("Network error");
            throw new Error("Network error");
        }
    }
}

// QueryClient with defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            refetchInterval: false,
            staleTime: Infinity,
        },
        mutations: {
            retry: false,
        },
    },
});
