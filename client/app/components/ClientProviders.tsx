// app/components/ClientProviders.tsx
"use client";

import { Toaster } from "@/app/components/ui/toaster";
import { Toaster as Sonner } from "@/app/components/ui/sonner";
import { TooltipProvider } from "@/app/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";


interface ClientProvidersProps {
    children: ReactNode;
}

// Component that handles scrolling, wrapped in Suspense
function ScrollHandler() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto" // Use "smooth" for smooth scrolling
        });
    }, [pathname, searchParams]); // Triggers on both pathname and query param changes

    return null;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
                        <TooltipProvider>
                            {/* Wrap ScrollHandler in Suspense since it uses useSearchParams */}
                            <Suspense fallback={null}>
                                <ScrollHandler />
                            </Suspense>
                            <main className="min-h-screen">
                                {children}
                            </main>
                            <Toaster />
                            <Sonner />
                        </TooltipProvider>
        </QueryClientProvider>
    );
}