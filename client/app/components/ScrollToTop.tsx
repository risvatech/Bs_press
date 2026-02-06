"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ScrollToTop() {
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

    return null; // This component doesn't render anything
}