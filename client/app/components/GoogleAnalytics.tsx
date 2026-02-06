// app/components/GoogleAnalytics.tsx
"use client";

import Script from 'next/script';

export default function GoogleAnalytics() {
    // This reads from your .env.local file
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    // For now, use fallback since you haven't added it yet
    const trackingId = gaId || 'G-L02T7MRHM0';

    // Optional: Don't load in development
    if (process.env.NODE_ENV === 'development') {
        return null;
    }

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${trackingId}');
                    `,
                }}
            />
        </>
    );
}