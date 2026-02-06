// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'www.bspressproducts.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // ⚠️ IMPORTANT: Block CMS routes from search engines
            disallow: ['/cms/', '/admin/', '/api/', '/_next/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl.replace(/^https?:\/\//, ''),
    };
}