// app/products/[slug]/ProductDetailClient.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import {
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Loader2,
    Calendar,
    Tag,
    FileText,
    ExternalLink,
    Star,
    Grid,
    Maximize2,
    X,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from 'lucide-react';
import productapi from '../service/productapi';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface ProductImage {
    url: string;
    filename: string;
    alt?: string;
    isCover?: boolean;
    order?: number;
}

interface Product {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    description?: string;
    coverImage?: string;
    images?: ProductImage[];
    tags?: string;
    categoryId?: number;
    createdAt: string;
    updatedAt: string;
    status: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
}

interface Category {
    id: number;
    name: string;
}

interface RelatedProduct {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    description?: string;
    coverImage?: string;
    images?: ProductImage[];
    categoryId?: number;
}

// Updated ApiResponse interface to handle different response structures
interface ApiResponse {
    success: boolean;
    data?: any; // Add this to handle API response structure
    product?: Product;
    products?: Product[];
    categories?: Category[];
    message?: string;
}

interface ProductDetailClientProps {
    slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const imagesPerPage = 6;

    // Helper function to get category name by ID
    const getCategoryNameById = (categoryId?: number): string => {
        if (!categoryId) return 'Uncategorized';
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Uncategorized';
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    const fetchCategories = async () => {
        try {
            const response = await productapi.get('/productcategories') as ApiResponse;
            console.log('📊 Categories API Response:', response);

            if (response.success) {
                // Handle different response structures
                if (response.categories) {
                    setCategories(response.categories);
                } else if (response.data) {
                    if (Array.isArray(response.data)) {
                        setCategories(response.data);
                    } else if (response.data.categories && Array.isArray(response.data.categories)) {
                        setCategories(response.data.categories);
                    }
                }
            } else {
                console.warn('Categories API not successful:', response.message);
                setCategories([]);
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching product for slug:', slug);
            const response = await productapi.get(`/products/slug/${slug}`) as ApiResponse;
            console.log('📊 Product API Response:', response);

            // Handle different API response structures
            let productData: Product | undefined;

            if (response.success) {
                // Structure 1: response has product property
                if (response.product) {
                    productData = response.product;
                }
                // Structure 2: response has data containing product
                else if (response.data) {
                    if (response.data.product) {
                        productData = response.data.product;
                    } else if (typeof response.data === 'object' && response.data.id) {
                        productData = response.data as Product;
                    }
                }
            }

            if (productData) {
                setProduct(productData);

                if (productData.categoryId) {
                    fetchRelatedProducts(productData.categoryId);
                }

                // Set initial selected image to cover image or first image
                if (productData.images && productData.images.length > 0) {
                    const coverIndex = productData.images.findIndex(img => img.isCover);
                    setSelectedImageIndex(coverIndex >= 0 ? coverIndex : 0);
                }
            } else {
                setError(response.message || 'Product not found');
                console.error('❌ Product not found in response:', response);
            }
        } catch (error: any) {
            console.error('Error fetching product:', error);
            setError(error.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (categoryId: number) => {
        try {
            console.log('🔄 Fetching related products for category:', categoryId);
            const response = await productapi.get(`/products/category/${categoryId}`) as ApiResponse;
            console.log('📊 Related Products Response:', response);

            if (response.success) {
                let products: RelatedProduct[] = [];

                // Handle different response structures
                if (response.products && Array.isArray(response.products)) {
                    products = response.products;
                } else if (response.data) {
                    if (Array.isArray(response.data)) {
                        products = response.data;
                    } else if (response.data.products && Array.isArray(response.data.products)) {
                        products = response.data.products;
                    }
                }

                const filtered = products
                    .filter((p: RelatedProduct) => p.slug !== slug)
                    .slice(0, 4);

                console.log('✅ Filtered related products:', filtered);
                setRelatedProducts(filtered);
            }
        } catch (error) {
            console.error('Error fetching related products:', error);
        }
    };

    // Helper function to parse tags
    const parseTags = (tags: string | undefined): string[] => {
        if (!tags) return [];

        try {
            const cleaned = tags.replace(/[{}"\\]/g, '').split(',');
            return cleaned.filter(tag => tag.trim().length > 0);
        } catch (error) {
            console.error('Error parsing tags:', error);
            return [];
        }
    };

    // Get all product images including cover
    const getAllProductImages = (): ProductImage[] => {
        if (!product) return [];

        const images: ProductImage[] = [];

        // Add cover image if it exists and not in images array
        if (product.coverImage && !product.images?.some(img => img.url === product.coverImage)) {
            images.push({
                url: product.coverImage,
                filename: 'cover.jpg',
                alt: `${product.title} - Cover Image`,
                isCover: true,
                order: 0
            });
        }

        // Add all images from images array
        if (product.images && product.images.length > 0) {
            images.push(...product.images);
        }

        // Sort by order if available
        return images.sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    // Function to clean HTML content for mobile with proper list styling
    const cleanHTMLContent = (html: string): string => {
        if (!html) return '';

        // First, sanitize the HTML
        const sanitized = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
                'p', 'br', 'b', 'i', 'u', 'em', 'strong',
                'a', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'blockquote', 'code', 'pre', 'hr', 'div', 'span',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'img', 'figure', 'figcaption',
                'sub', 'sup', 'mark', 'small', 'del', 'ins', 's', 'strike'
            ],
            ALLOWED_ATTR: [
                'href', 'target', 'rel', 'title', 'alt',
                'src', 'width', 'height', 'style', 'class',
                'colspan', 'rowspan', 'border', 'cellpadding', 'cellspacing',
                'frameborder', 'allowfullscreen', 'scrolling'
            ]
        });

        // Make tables and other elements responsive
        let cleaned = sanitized
            .replace(/style="[^"]*"/g, (match) => {
                // Keep only safe styles for mobile
                return match
                    .replace(/width:\s*\d+px;?/g, 'width: 100%;')
                    .replace(/max-width:\s*\d+px;?/g, 'max-width: 100%;')
                    .replace(/margin-left:\s*-?\d+px;?/g, 'margin-left: 0;')
                    .replace(/float:\s*\w+;?/g, '')
                    .replace(/min-height:\s*\d+px;?/g, '');
            })
            .replace(/class="table table-bordered"/g, 'class="w-full border-collapse border border-gray-300 text-sm"')
            .replace(/<table/g, '<div class="overflow-x-auto"><table')
            .replace(/<\/table>/g, '</table></div>');

        return cleaned;
    };

    // Navigation functions for image gallery
    const nextImage = () => {
        const images = getAllProductImages();
        if (images.length === 0) return;
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        const images = getAllProductImages();
        if (images.length === 0) return;
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    // Get paginated thumbnails
    const getPaginatedThumbnails = () => {
        const images = getAllProductImages();
        const startIndex = (currentPage - 1) * imagesPerPage;
        const endIndex = startIndex + imagesPerPage;
        return images.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(getAllProductImages().length / imagesPerPage);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading product details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Show error state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Products
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const parsedTags = parseTags(product.tags);
    const categoryName = getCategoryNameById(product.categoryId);
    const cleanedContent = cleanHTMLContent(product.content || '');
    const allImages = getAllProductImages();
    const mainImage = allImages[selectedImageIndex] || allImages[0];
    const thumbnails = getPaginatedThumbnails();

    return (
        <>
            <div className="min-h-screen bg-gray-50 mt-10">
                <Navbar />

                {/* Add structured data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Product",
                            "name": product.title,
                            "description": product.metaDescription || product.excerpt || product.description || '',
                            "image": allImages.map(img => img.url),
                            "sku": product.id.toString(),
                            "url": typeof window !== 'undefined' ? `${window.location.origin}/products/${product.slug}` : '',
                            "brand": {
                                "@type": "Brand",
                                "name": "FutureIndias"
                            },
                            "offers": {
                                "@type": "Offer",
                                "availability": "https://schema.org/InStock",
                                "priceCurrency": "INR",
                                "price": "0.00"
                            }
                        })
                    }}
                />

                <div className="container mx-auto px-2 sm:px-4 py-4 md:py-6">
                    {/* Main Product Layout */}
                    <div className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md overflow-hidden">
                        {/* Product Header */}
                        <div className="p-4 md:p-6 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        {product.title}
                                    </h1>
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium mb-2">
                                        {categoryName}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={`/products`}
                                        className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
                                    >
                                        <ArrowRight className="w-3 h-3 rotate-180" />
                                        More in {categoryName}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex flex-col lg:flex-row">
                            {/* Left Column - Image Gallery */}
                            <div className="lg:w-2/5 p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                                {/* Main Product Image */}
                                <div className="mb-4">
                                    <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                                        {mainImage ? (
                                            <>
                                                <Image
                                                    src={mainImage.url}
                                                    alt={mainImage.alt || `${product.title} - Image ${selectedImageIndex + 1}`}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 40vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    priority
                                                    onClick={() => openLightbox(selectedImageIndex)}
                                                />
                                                {/* Cover badge */}
                                                {mainImage.isCover && (
                                                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                                        <Star className="w-3 h-3" />
                                                        <span>Cover</span>
                                                    </div>
                                                )}

                                                {/* Image counter */}
                                                <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                                                    {selectedImageIndex + 1} / {allImages.length}
                                                </div>
                                                {/* Navigation arrows */}
                                                {allImages.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                prevImage();
                                                            }}
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            aria-label="Previous image"
                                                        >
                                                            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                nextImage();
                                                            }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            aria-label="Next image"
                                                        >
                                                            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <div className="text-gray-400 mb-2">
                                                        <FileText className="w-12 h-12 mx-auto" />
                                                    </div>
                                                    <span className="text-gray-500 text-sm">No images available</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Click/tap image to view full size
                                    </p>
                                </div>

                                {/* Thumbnail Gallery */}
                                {allImages.length > 1 && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium text-gray-900">Gallery</h3>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <span>Page {currentPage} of {totalPages}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                            {thumbnails.map((image, index) => {
                                                const globalIndex = (currentPage - 1) * imagesPerPage + index;
                                                return (
                                                    <button
                                                        key={`${image.filename}-${globalIndex}`}
                                                        onClick={() => setSelectedImageIndex(globalIndex)}
                                                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                                                            selectedImageIndex === globalIndex
                                                                ? 'border-blue-500 ring-2 ring-blue-200'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                        aria-label={`View image ${globalIndex + 1}`}
                                                    >
                                                        <Image
                                                            src={image.url}
                                                            alt={image.alt || `Thumbnail ${globalIndex + 1}`}
                                                            fill
                                                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                                                            className="object-cover"
                                                        />
                                                        {image.isCover && (
                                                            <div className="absolute top-1 left-1">
                                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                            </div>
                                                        )}
                                                        {selectedImageIndex === globalIndex && (
                                                            <div className="absolute inset-0 bg-blue-500/20"></div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination controls */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 mt-3">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label="Previous page"
                                                >
                                                    <ChevronLeftIcon className="w-4 h-4" />
                                                </button>
                                                <span className="text-xs text-gray-600">
                                                    {currentPage} / {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    aria-label="Next page"
                                                >
                                                    <ChevronRightIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Product Content */}
                            <div className="lg:w-3/5 p-4 md:p-6">
                                <div className="sticky top-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Product Details</h2>
                                    </div>
                                    {product.excerpt || product.description ? (
                                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                            <p className="text-gray-600 text-sm">
                                                {product.excerpt || product.description}
                                            </p>
                                        </div>
                                    ) : null}

                                    {/* Product Content with proper HTML formatting */}
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-6">
                                        {cleanedContent ? (
                                            <div className="product-detail-content text-gray-700">
                                                <div
                                                    dangerouslySetInnerHTML={{ __html: cleanedContent }}
                                                />
                                            </div>
                                        ) : product.content ? (
                                            <div
                                                className="product-detail-content text-gray-700 overflow-x-auto"
                                                dangerouslySetInnerHTML={{ __html: product.content }}
                                            />
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>No detailed content available for this product.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-8 md:mt-12">
                            <div className="bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md overflow-hidden">
                                <div className="p-4 md:p-6 border-b border-gray-100">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                            Related Products
                                        </h2>
                                        {product.categoryId && (
                                            <Link
                                                href={`/products?category=${product.categoryId}`}
                                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                View all in {categoryName}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 md:p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                        {relatedProducts.map((related) => {
                                            const relatedImages = related.images || [];
                                            const relatedCover = relatedImages.find(img => img.isCover) || relatedImages[0] ||
                                                (related.coverImage ? {
                                                    url: related.coverImage,
                                                    alt: related.title
                                                } : null);

                                            return (
                                                <Link
                                                    key={related.id}
                                                    href={`/products/${related.slug}`}
                                                    className="group bg-gray-50 hover:bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                                >
                                                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                                        {relatedCover ? (
                                                            <Image
                                                                src={relatedCover.url}
                                                                alt={relatedCover.alt || related.title}
                                                                fill
                                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <span className="text-gray-400 text-sm">No image</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-3 sm:p-4">
                                                        <h3 className="font-medium text-gray-900 mb-1.5 line-clamp-1 text-sm sm:text-base">
                                                            {related.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2">
                                                            {related.excerpt || related.description || 'No description available'}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">
                                                                {getCategoryNameById(related.categoryId)}
                                                            </span>
                                                            <span className="text-blue-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
                                                                View →
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <Footer />
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && mainImage && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close lightbox"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Navigation buttons */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                                aria-label="Previous image"
                            >
                                <ChevronLeftIcon className="w-8 h-8" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                                aria-label="Next image"
                            >
                                <ChevronRightIcon className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    {/* Main image */}
                    <div className="relative w-full max-w-6xl h-full max-h-[80vh]">
                        <Image
                            src={mainImage.url}
                            alt={mainImage.alt || `${product.title} - Full size view`}
                            fill
                            sizes="100vw"
                            className="object-contain"
                            priority
                        />
                        {/* Image info */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
                            <div className="flex items-center gap-4">
                                <span>
                                    {selectedImageIndex + 1} / {allImages.length}
                                </span>
                                {mainImage.isCover && (
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        Cover Image
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail strip */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw]">
                            {allImages.map((image, index) => (
                                <button
                                    key={`lightbox-thumb-${index}`}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 ${
                                        selectedImageIndex === index
                                            ? 'border-white'
                                            : 'border-transparent hover:border-gray-400'
                                    }`}
                                >
                                    <Image
                                        src={image.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                    {image.isCover && (
                                        <div className="absolute top-1 left-1">
                                            <Star className="w-2 h-2 text-yellow-400" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}