// app/components/QueryClientProviderWrapper.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface QueryClientProviderWrapperProps {
    children: ReactNode;
}

export default function QueryClientProviderWrapper({ children }: QueryClientProviderWrapperProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}