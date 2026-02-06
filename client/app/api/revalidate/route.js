// app/revalidate/route.js
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const secret = request.headers.get('x-revalidate-secret');
    const expectedSecret = process.env.REVALIDATION_SECRET;

    console.log('🔐 Revalidation request received');

    // Check for secret
    if (!secret || secret !== expectedSecret) {
        console.log('❌ Invalid secret');
        return NextResponse.json(
            { message: 'Invalid token' },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const tag = searchParams.get('tag') || 'sitemap';

        console.log(`🔄 Revalidating tag: ${tag}`);

        // Revalidate based on tag
        revalidateTag(tag);

        console.log('✅ Revalidation successful');

        return NextResponse.json({
            revalidated: true,
            now: Date.now(),
            tag: tag
        });
    } catch (err) {
        console.error('❌ Revalidation error:', err);
        return NextResponse.json(
            { message: 'Error revalidating' },
            { status: 500 }
        );
    }
}