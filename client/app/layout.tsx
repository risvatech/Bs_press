// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import ClientProviders from "./components/ClientProviders";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { RolesProvider } from "@/app/context/rolesContext";
import { AuthProvider } from "@/app/context/AuthContext";
import QueryClientProviderWrapper from "./components/QueryClientProviderWrapper";

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

            {/* Favicons */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/site.webmanifest.json" />

            {/* Theme Color */}
            <meta name="theme-color" content="#ffffff" />

            {/* Robots */}
            <meta name="robots" content="index, follow" />

            {/* Structured Data - Homepage specific, you might want to make this dynamic */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Risva Technologies",
                        "url": "www.bspressproducts.com/",
                        "logo": "www.bspressproducts.com/assets/Logo.png",
                        "description": "Risva Technologies delivers fast, affordable web app, mobile app & AI solutions using React, Next.js, Node.js, Laravel & PostgreSQL.",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "HSR Layout, Bangalore,KA\n" +
                                "Hosur, TN\n" +
                                "India",
                            "addressLocality": "Bengaluru",
                            "postalCode": "",
                            "addressCountry": "IN"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+91 9740972122",
                            "contactType": "customer service",
                            "email": "info(at)risvatech.com"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Risva Technologies",
                            "url": "www.bspressproducts.com/",
                            "logo": "www.bspressproducts.com/assets/Logo.png",
                            "description": "Risva Technologies delivers fast, affordable web app, mobile app & AI solutions using React, Next.js, Node.js, Laravel & PostgreSQL."
                        },
                        "sameAs": []
                    })
                }}
            />

        </head>

        <body>
        {/* Add Google Analytics here */}
        <QueryClientProviderWrapper>
            <GoogleAnalytics />
            <RolesProvider>
                <AuthProvider>
                    <ClientProviders>{children}</ClientProviders>
                </AuthProvider>
            </RolesProvider>
        </QueryClientProviderWrapper>
        </body>
        </html>
    );
}