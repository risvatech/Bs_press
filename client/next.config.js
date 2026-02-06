// next.config.js
/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    // Always use standalone for server deployment
    output: 'standalone',

    images: {
        // Keep images optimized for standalone
        unoptimized: false,
        domains: ['localhost', '127.0.0.1', 'www.bspressproducts.com', 'bspressproducts.com'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8005',
                pathname: '/api/uploads/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8005',
                pathname: '/api/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'www.bspressproducts',
                pathname: '/api/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'bspressproducts.com',
                pathname: '/api/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
        ],
    },

    compiler: {
        removeConsole: isProd ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Essential for dynamic content
    trailingSlash: false, // Important for dynamic routes

    // Enable ISR for dynamic blog content
    experimental: {
        // Better cache for dynamic routes
        isrMemoryCacheSize: 50,
        // Enable incremental static regeneration
        isrFlushToDisk: true,
        // Optimize serverless functions
        serverComponentsExternalPackages: ['sharp'],
    },

    // Disable static export features
    eslint: {
        ignoreDuringBuilds: false, // Keep ESLint checks
    },

    typescript: {
        ignoreBuildErrors: false, // Keep TypeScript checks
    },

    // Optional: Custom dist directory with timestamp
    distDir: process.env.CUSTOM_BUILD_ID
        ? `.next-${process.env.CUSTOM_BUILD_ID}`
        : '.next',
};

module.exports = nextConfig;