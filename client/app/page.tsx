// app/page.tsx
"use client";

import Index from "./pages/Index";
import SEOHead from "./components/SEOHead";

export default function HomePage() {
    return (
        <>
            {/*<SEOHead page="home" />*/}
            <Index />
        </>
    );
}