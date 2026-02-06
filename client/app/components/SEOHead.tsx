// app/components/SEOHead.tsx
"use client";

import React from 'react';
import { SEO_CONFIG, PageKey } from '../lib/seoMetadata';

interface SEOHeadProps {
    page: PageKey;
}

export default function SEOHead({ page }: SEOHeadProps) {
    const metadata = SEO_CONFIG[page];
    const SITE_NAME = "Risva Technologies";

    if (!metadata) {
        console.warn(`No metadata found for page: ${page}`);
        return null;
    }

    return (
        <>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
            <meta name="keywords" content={metadata.keywords} />

            {/* Author and Publisher */}
            <meta name="author" content={SITE_NAME} />
            <meta name="publisher" content={SITE_NAME} />

            {/* Open Graph */}
            <meta property="og:title" content={metadata.ogTitle} />
            <meta property="og:description" content={metadata.ogDescription} />
            <meta property="og:image" content={metadata.ogImage} />
            <meta property="og:url" content={metadata.ogUrl} />
            <meta property="og:type" content={metadata.ogType} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />

            {/* Open Graph - Article specific (if applicable) */}
            {metadata.ogType === 'article' && (
                <>
                    <meta property="article:author" content={SITE_NAME} />
                    <meta property="article:publisher" content={SITE_NAME} />
                </>
            )}

            <meta property="og:image:secure_url" content={metadata.ogImage} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Twitter */}
            <meta name="twitter:card" content={metadata.twitterCard} />
            <meta name="twitter:title" content={metadata.twitterTitle} />
            <meta name="twitter:description" content={metadata.twitterDescription} />
            <meta name="twitter:image" content={metadata.twitterImage} />

            {/* Twitter - Creator/Site */}
            <meta name="twitter:site" content="@RisvaTech" />
            <meta name="twitter:creator" content="@RisvaTech" />

            {/* Canonical */}
            <link rel="canonical" href={metadata.ogUrl} />

            {/* Additional useful meta tags */}
            <meta name="application-name" content={SITE_NAME} />
            <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        </>
    );
}