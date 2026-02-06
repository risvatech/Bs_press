// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'www.bspressproducts.com';

    console.log('🔧 Generating sitemap at build time...');

    // 1. Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/pallet-packaging`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/quote`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        // Services pages
        {
            url: `${baseUrl}/services/warehousing-supply-chain`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services/packing-kitting-services`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services/manufacturing-stillages`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services/industrial-trolleys`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services/wooden-pallets-boxes`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services/carton-boxes-materials`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services/returnable-packaging`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/services/design-customization`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];

    // 2. Blog posts - fetch at build time
    let blogPosts: MetadataRoute.Sitemap = [];

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'www.bspressproducts.com/api';
        const response = await fetch(`${apiUrl}/posts?status=published&limit=1000`, {
            // This will be cached at build time
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (response.ok) {
            const data = await response.json();

            // Handle response format
            const posts = Array.isArray(data) ? data :
                data?.data || data?.posts || data?.items || [];

            blogPosts = posts.map((post: any) => ({
                url: `${baseUrl}/pallet-packaging/${post.slug || post.id}`,
                lastModified: new Date(post.updatedAt || post.createdAt || new Date()),
                changeFrequency: 'weekly',
                priority: 0.7,
            }));
        }
    } catch (error) {
        console.error('Error fetching pallet-packaging posts:', error);
    }

    // 3. Products - fetch at build time
    let productsPages: MetadataRoute.Sitemap = [];

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'www.bspressproducts.com/api';
        const response = await fetch(`${apiUrl}/products?status=published&limit=1000`, {
            next: { revalidate: 3600 }
        });

        if (response.ok) {
            const data = await response.json();

            // Handle response format
            let products: any[] = [];

            if (data.success && data.products) {
                products = data.products;
            } else if (Array.isArray(data)) {
                products = data;
            } else if (data.data && Array.isArray(data.data)) {
                products = data.data;
            }

            console.log(`✅ Found ${products.length} products for sitemap`);

            productsPages = products
                .filter((product: any) => product.slug && product.status === 'published')
                .map((product: any) => ({
                    url: `${baseUrl}/products/${product.slug}`,
                    lastModified: new Date(product.updatedAt || product.createdAt || new Date()),
                    changeFrequency: 'monthly',
                    priority: 0.8,
                }));
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }

    // Combine all
    const allPages = [...staticPages, ...blogPosts, ...productsPages];

    // Log summary
    console.log(`📊 Sitemap summary:`);
    console.log(`   - Static pages: ${staticPages.length}`);
    console.log(`   - Blog posts: ${blogPosts.length}`);
    console.log(`   - Products: ${productsPages.length}`);
    console.log(`   - Total URLs: ${allPages.length}`);

    return allPages;
}