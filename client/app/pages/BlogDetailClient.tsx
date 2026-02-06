'use client'

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { ScrollArea } from "../components/ui/scroll-area"
import {
    Calendar,
    Clock,
    ArrowLeft,
    Tag,
    Twitter,
    Linkedin,
    Facebook,
    Check,
    ChevronRight,
    Sparkles,
    ArrowRight,
    Loader2,
    Eye,
    Share2,
    Layers,
    Menu,
    X,
    Hash,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import api from "../service/api"
import Navigation from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import about from "@/public/about-factory.jpg";

// Define interfaces based on your data
interface BlogPost {
    id: string | number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    description?: string;
    tags?: string;
    categoryId?: number;
    createdAt?: string;
    updatedAt?: string;
    status: string;
    metaExcerpt?: string;
    metaDescription?: string;
    metaTitle?: string;
    metaKeywords?: string;
}

interface Category {
    id: number;
    name: string;
    count?: number;
}

interface RelatedPost {
    id: string | number;
    slug: string;
    title: string;
    excerpt: string;
    category?: string;
}

// Helper function to parse tags from the malformed JSON string
const parseTags = (tags: any): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.filter((tag: any) => typeof tag === 'string');

    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) {
                return parsed.filter((tag: any) => typeof tag === 'string');
            }
        } catch {
            let cleanString = tags
                .replace(/[{}[\]\\"]/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (cleanString.includes(',')) {
                return cleanString.split(',')
                    .map((tag: string) => tag.trim())
                    .filter((tag: string) => tag.length > 0);
            }
            return cleanString ? [cleanString] : [];
        }
    }
    return [];
};

// Function to safely extract text from HTML content
const extractTextFromHTML = (html: string): string => {
    if (!html) return '';
    // Check if we're in browser environment
    if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, '');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
};

// Function to safely render HTML content with proper styling
const renderHTMLContent = (html: string) => {
    if (!html) return null;

    // Create a component with proper HTML styling
    const StyledHTMLContent = () => (
        <div
            className="html-content"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );

    return <StyledHTMLContent />;
};

export default function BlogDetailClient({ slug }: { slug: string }) {
    const [post, setPost] = useState<BlogPost | null>(null)
    const [category, setCategory] = useState<Category | null>(null)
    const [categories, setCategories] = useState<Category[]>([
        { id: 0, name: "All Posts" }
    ])
    const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [liked, setLiked] = useState(false)
    const [bookmarked, setBookmarked] = useState(false)
    const [copied, setCopied] = useState(false)
    const [viewCount, setViewCount] = useState(1428)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobile && sidebarOpen) {
                const sidebar = document.getElementById('category-sidebar')
                const toggleButton = document.getElementById('sidebar-toggle')

                if (sidebar &&
                    !sidebar.contains(event.target as Node) &&
                    toggleButton &&
                    !toggleButton.contains(event.target as Node)) {
                    setSidebarOpen(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isMobile, sidebarOpen])

    // Fetch all posts to calculate category counts
    const fetchAllPosts = useCallback(async () => {
        try {
            const { data } = await api.get("/posts")
            // Laravel APIs often return nested data
            const postsData = Array.isArray(data) ? data : data.posts || data.data || []
            return postsData
        } catch (err) {
            console.error("Error fetching all posts:", err)
            return []
        }
    }, [])

    // Fetch all categories with counts
    const fetchCategories = useCallback(async () => {
        try {
            const { data } = await api.get("/categories")
            // Laravel APIs often return nested data
            const categoriesData = Array.isArray(data) ? data : data.categories || data.data || []

            // Fetch all posts to calculate counts
            const allPostsData = await fetchAllPosts()

            const mappedCategories = categoriesData.map((cat: any) => {
                // Calculate count for each category
                const count = allPostsData.filter((post: any) =>
                    post.categoryId === cat.id && post.status === "published"
                ).length

                return {
                    id: cat.id,
                    name: cat.name,
                    count
                }
            })

            // Calculate total count for "All Posts"
            const totalCount = allPostsData.filter((post: any) =>
                post.status === "published"
            ).length

            const categoriesWithCounts = [
                { id: 0, name: "All Posts", count: totalCount },
                ...mappedCategories
            ]

            setCategories(categoriesWithCounts)
            return categoriesWithCounts

        } catch (err) {
            console.error("Error fetching categories:", err)
            return []
        }
    }, [fetchAllPosts])

    // Fetch category by ID - FIXED: Handle Laravel API response format
    const fetchCategoryById = useCallback(async (categoryId: number) => {
        try {
            // Laravel APIs might require different endpoints or return nested data
            const { data } = await api.get("/categories")
            const categoriesData = Array.isArray(data) ? data : data.categories || data.data || []

            const foundCategory = categoriesData.find((cat: any) => cat.id === categoryId)

            if (foundCategory) {
                return {
                    id: foundCategory.id,
                    name: foundCategory.name
                }
            }

            return null;
        } catch (err) {
            console.error("Error fetching category by ID:", err)
            return null;
        }
    }, [])

    // Fetch post data
    useEffect(() => {
        const fetchPostData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch categories with counts first
                const categoriesData = await fetchCategories()

                // Fetch the specific post by slug
                const { data } = await api.get(`/posts/slug/${slug}`)

                if (!data) {
                    throw new Error("Post not found")
                }

                // Laravel APIs often return nested data
                const postData = data.post || data.data || data

                if (!postData) {
                    throw new Error("Post data not found")
                }

                setPost(postData)

                // Fetch category using categoryId
                if (postData.categoryId) {
                    const categoryData = await fetchCategoryById(postData.categoryId)

                    if (categoryData) {
                        setCategory(categoryData)
                    } else {
                        // Try to get category from our categories list
                        const foundCategory = categoriesData.find(cat => cat.id === postData.categoryId)
                        if (foundCategory && foundCategory.id !== 0) {
                            setCategory(foundCategory)
                        }
                    }
                }

                // Fetch related posts (posts from same category)
                if (postData.categoryId) {
                    try {
                        // Fetch all posts and filter by category
                        const allPostsData = await fetchAllPosts()

                        const formattedRelated = allPostsData
                            .filter((p: any) =>
                                p.categoryId === postData.categoryId &&
                                p.id !== postData.id &&
                                p.status === "published"
                            )
                            .slice(0, 3)
                            .map((p: any) => {
                                // Get category name
                                const postCategory = categoriesData.find(cat => cat.id === p.categoryId)
                                return {
                                    id: p.id,
                                    slug: p.slug,
                                    title: p.title,
                                    excerpt: p.excerpt || p.description || "",
                                    category: postCategory?.name || "Uncategorized"
                                }
                            })

                        setRelatedPosts(formattedRelated)
                    } catch (relatedErr) {
                        console.error("Error fetching related posts:", relatedErr)
                    }
                }

            } catch (err: any) {
                console.error("Error fetching post:", err)
                setError(err.message || "Failed to load the blog post. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchPostData()
        }
    }, [slug, fetchCategories, fetchCategoryById, fetchAllPosts])

    const handleShare = async (platform: string) => {
        if (!post) return;
        const url = window.location.href
        const text = `Check out this article: ${post.title}`

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                break
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
                break
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                break
            case 'copy':
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
                break
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Recent"
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return "Yesterday"
        if (diffDays <= 7) return `${diffDays} days ago`

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const calculateReadTime = (content: string) => {
        const textContent = extractTextFromHTML(content)
        const wordsPerMinute = 200
        const words = textContent.split(/\s+/).length
        const minutes = Math.ceil(words / wordsPerMinute)
        return `${minutes} min read`
    }

    const getPostTags = () => {
        return post ? parseTags(post.tags) : []
    }

    if (loading) {
        return (
            <>
                <Navigation/>
                <div className="min-h-screen flex items-center justify-center mt-10">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                        <p className="mt-4 text-lg">Loading blog post...</p>
                    </div>
                </div>
                <Footer/>
            </>
        )
    }

    if (error || !post) {
        return (
            <>
                <Navigation/>
                <div className="min-h-screen flex items-center justify-center mt-10">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-4">{error || "Post not found"}</div>
                        <Link href="/pallet-packaging">
                            <Button>Back to Pallets</Button>
                        </Link>
                    </div>
                </div>
                <Footer/>
            </>
        )
    }

    const postTags = getPostTags();
    const displayExcerpt = post.excerpt || post.description || post.metaExcerpt || "";

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": post.metaTitle || post.title,
                        "description": post.metaDescription || post.description || post.excerpt,
                        "image": post.coverImage || "",
                        "datePublished": post.createdAt,
                        "dateModified": post.updatedAt,
                        "author": {
                            "@type": "Person",
                            "name": "Admin"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Your Site Name",
                            "logo": {
                                "@type": "ImageObject",
                                "url": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : ''
                            }
                        },
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": typeof window !== 'undefined' ? window.location.href : ''
                        }
                    })
                }}
            />

            <Navigation/>
            <div className="min-h-screen">
                {/* Hero Section */}
                {/*<section className="pt-20 pb-20 px-4 gradient-hero relative overflow-hidden">*/}
                {/*    <div className="absolute inset-0 z-0">*/}
                {/*        <div className="absolute inset-0">*/}
                {/*            <Image*/}
                {/*                src={about}*/}
                {/*                alt="Background"*/}
                {/*                fill*/}
                {/*                className="object-cover object-center"*/}
                {/*                priority*/}
                {/*            />*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*    <div className="container mx-auto max-w-6xl text-center relative z-10">*/}
                {/*        <div className="inline-flex p-3 rounded-2xl bg-primary-light mb-6 animate-fade-in">*/}
                {/*            <Layers className="w-12 h-12 text-white icon-float" />*/}
                {/*        </div>*/}
                {/*        <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-6 animate-fade-in">*/}
                {/*            {post.metaTitle || post.title}*/}
                {/*        </h1>*/}
                {/*        <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-8 animate-fade-in">*/}
                {/*            {post.metaDescription || post.description || post.excerpt}*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*</section>*/}

                <div className="py-6 px-4 sm:px-6 lg:px-8">

                    <div className="max-w-7xl mx-auto">
                        {/* Mobile Sidebar Toggle Button - Compact */}
                        <div className="md:hidden  flex items-center justify-between">
                            <Link href="/pallet-packaging">
                                <Button variant="ghost" className="gap-2 hover:bg-purple-500/10">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Pallets
                                </Button>
                            </Link>


                        </div>
                        <div className="w-24 h-1.5 bg-[hsl(21_90%_48%)] mb-6" /> {/* accent */}
                        <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-primary mb-6 animate-fade-in">
                            {post.metaTitle || post.title}
                        </h1>

                        {/* Main Content Area with Sidebar */}
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Blog Post Content - Takes more space now */}
                            <div className="flex-1 md:pl-4">
                                {/* Desktop Back Button */}
                                <div className="hidden md:block mb-4">
                                    <Link href="/pallet-packaging">
                                        <Button variant="ghost" className="gap-2 hover:bg-purple-500/10 hover:text-black">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Pallets
                                        </Button>
                                    </Link>
                                </div>

                                <div className="max-w-4xl mx-auto">
                                    {/* Article Header */}
                                    <div className="mb-5">
                                        {/* Stats Bar */}
                                        <div className="flex flex-wrap items-center gap-4 p-4 bg-secondary/50 backdrop-blur-sm rounded-xl border mb-6">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-primary" /> <span className="text-sm font-medium">{category?.name || "Uncategorized"}</span>
                                            </div>
                                            <Separator orientation="vertical" className="h-4" />
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-medium">{calculateReadTime(post.content)}</span>
                                            </div>
                                            <Separator orientation="vertical" className="h-4" />
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-medium">{formatDate(post.createdAt)}</span>
                                            </div>
                                            <Separator orientation="vertical" className="h-4" />
                                            <div className="flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-medium">{viewCount.toLocaleString()} views</span>
                                            </div>
                                            <Separator orientation="vertical" className="h-4" />
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1.5 h-8 px-3"
                                                    onClick={() => handleShare('copy')}
                                                >
                                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                                                    <span className="text-sm">{copied ? 'Copied!' : 'Share'}</span>
                                                </Button>
                                            </div>
                                        </div>                                    </div>

                                    {/* Article Content */}
                                    <article className="prose prose-lg dark:prose-invert max-w-none mb-16">
                                        {/* Add custom styles for HTML content */}
                                        <style jsx global>{`
                                            /* Blog Detail Content Styling */
                                            .html-content {
                                                font-size: 1rem;
                                                line-height: 1;
                                                color: var(--foreground);
                                            }

                                            /* Paragraphs */
                                            .html-content p {
                                                margin-bottom: 0.4rem;
                                            }

                                            /* Headings */
                                            .html-content h1,
                                            .html-content h2,
                                            .html-content h3,
                                            .html-content h4,
                                            .html-content h5,
                                            .html-content h6 {
                                                font-weight: bold;
                                                line-height: 1.2;
                                                margin-top: 1.2rem;
                                                margin-bottom: 1rem;
                                                color: var(--foreground);
                                                scroll-margin-top: 2rem;
                                            }

                                            /* Individual heading sizes */
                                            .html-content h1 {
                                                font-size: 2.5rem;
                                                margin-top: 3rem;
                                                margin-bottom: 1.5rem;
                                            }

                                            .html-content h2 {
                                                font-size: 1.5rem;
                                                margin-top: 1rem;
                                                margin-bottom: 0.5rem;
                                                padding-bottom: 0.5rem;
                                                border-bottom: 2px solid var(--primary);
                                                position: relative;
                                            }

                                            .html-content h2::after {
                                                content: '';
                                                position: absolute;
                                                bottom: -2px;
                                                left: 0;
                                                width: 60px;
                                                height: 2px;
                                                background: linear-gradient(90deg, var(--primary), var(--secondary));
                                            }

                                            .html-content h3 {
                                                font-size: 1.5rem;
                                            }

                                            .html-content h4 {
                                                font-size: 1.2rem;
                                            }

                                            .html-content h5 {
                                                font-size: 1rem;
                                            }

                                            .html-content h6 {
                                                font-size: 1rem;
                                            }

                                            /* Links */
                                            .html-content a {
                                                color: var(--primary);
                                                text-decoration: none;
                                                border-bottom: 1px solid transparent;
                                                transition: all 0.2s ease;
                                            }

                                            .html-content a:hover {
                                                border-bottom-color: var(--primary);
                                                opacity: 0.9;
                                            }

                                            /* Lists */
                                            .html-content ol,
                                            .html-content ul {
                                                margin-left: 1.5rem;
                                                margin-bottom: 0.5rem;
                                                padding-left: 0.5rem;
                                            }

                                            .html-content li {
                                                margin-bottom: 0.5rem;
                                                position: relative;
                                                padding-left: 0.5rem;
                                                color: var(--foreground);
                                            }

                                            /* Ordered Lists */
                                            .html-content ol {
                                                list-style-type: decimal;
                                            }

                                            .html-content ol li::marker {
                                                font-weight: 600;
                                                color: var(--primary);
                                            }

                                            /* Unordered Lists */
                                            .html-content ul {
                                                list-style-type: disc;
                                            }

                                            .html-content ul li::marker {
                                                color: var(--primary);
                                            }

                                            /* Nested lists */
                                            .html-content ul ul,
                                            .html-content ol ol {
                                                margin-top: 0.5rem;
                                                margin-bottom: 0.5rem;
                                            }

                                            .html-content ul ul {
                                                list-style-type: circle;
                                            }

                                            .html-content ul ul ul {
                                                list-style-type: square;
                                            }

                                            .html-content ol ol {
                                                list-style-type: lower-alpha;
                                            }

                                            .html-content ol ol ol {
                                                list-style-type: lower-roman;
                                            }

                                            /* List item styling */
                                            .html-content li strong {
                                                color: var(--primary);
                                                font-weight: 600;
                                            }

                                            /* Spacing between list items */
                                            .html-content li + li {
                                                margin-top: 0.25rem;
                                            }

                                            /* Code blocks */
                                            .html-content pre {
                                                background: var(--secondary);
                                                border-radius: 0.75rem;
                                                padding: 1.5rem;
                                                margin: 1.5rem 0;
                                                overflow-x: auto;
                                                border: 1px solid var(--border);
                                            }

                                            .html-content code {
                                                background: var(--secondary);
                                                padding: 0.2rem 0.4rem;
                                                border-radius: 0.375rem;
                                                font-family: 'Monaco', 'Consolas', monospace;
                                                font-size: 0.9em;
                                                border: 1px solid var(--border);
                                            }

                                            .html-content pre code {
                                                background: transparent;
                                                padding: 0;
                                                border: none;
                                            }

                                            /* Blockquotes */
                                            .html-content blockquote {
                                                border-left: 4px solid var(--primary);
                                                padding-left: 1.5rem;
                                                margin: 2rem 0;
                                                font-style: italic;
                                                background: linear-gradient(90deg, rgba(var(--primary-rgb, 147, 51, 234), 0.1), transparent);
                                                border-radius: 0 0.75rem 0.75rem 0;
                                            }

                                            .html-content blockquote p {
                                                margin: 0;
                                                color: var(--foreground);
                                                opacity: 0.9;
                                            }

                                            /* Images */
                                            .html-content img {
                                                max-width: 100%;
                                                height: auto;
                                                border-radius: 0.75rem;
                                                margin: 2rem 0;
                                                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                                                border: 1px solid var(--border);
                                            }

                                            /* Tables */
                                            .html-content table {
                                                width: 100%;
                                                border-collapse: collapse;
                                                margin: 1.5rem 0;
                                                background: var(--secondary);
                                                border-radius: 0.75rem;
                                                overflow: hidden;
                                                border: 1px solid var(--border);
                                            }

                                            .html-content th,
                                            .html-content td {
                                                padding: 0.5rem;
                                                text-align: left;
                                                border-bottom: 1px solid var(--border);
                                            }

                                            .html-content th {
                                                background: var(--primary);
                                                color: white;
                                                font-weight: 600;
                                            }

                                            .html-content tr:last-child td {
                                                border-bottom: none;
                                            }

                                            .html-content tr:hover {
                                                background: rgba(var(--primary-rgb, 147, 51, 234), 0.05);
                                            }

                                            /* Horizontal rule */
                                            .html-content hr {
                                                border: none;
                                                height: 2px;
                                                background: linear-gradient(90deg, transparent, var(--primary), transparent);
                                                margin: 3rem 0;
                                            }

                                            /* Strong and emphasis */
                                            .html-content strong {
                                                color: var(--primary);
                                                font-weight: 700;
                                            }

                                            .html-content em {
                                                color: var(--foreground);
                                                opacity: 0.9;
                                            }

                                            /* Responsive adjustments */
                                            @media (max-width: 768px) {
                                                .html-content {
                                                    font-size: 1rem;
                                                    line-height: 1.7;
                                                }

                                                .html-content h1 {
                                                    font-size: 1.75rem;
                                                }

                                                .html-content h2 {
                                                    font-size: 1.5rem;
                                                }

                                                .html-content h3 {
                                                    font-size: 1.25rem;
                                                }

                                                .html-content h4 {
                                                    font-size: 1rem;
                                                }

                                                .html-content ol,
                                                .html-content ul {
                                                    margin-left: 1rem;
                                                }

                                                .html-content pre {
                                                    padding: 1rem;
                                                }

                                                .html-content table {
                                                    font-size: 0.9rem;
                                                }
                                            }

                                            /* Smooth scrolling for anchor links */
                                            .html-content :target {
                                                scroll-margin-top: 5rem;
                                            }

                                            /* Improve readability on larger screens */
                                            @media (min-width: 1200px) {
                                                .html-content {
                                                    font-size: 1.15rem;
                                                    line-height: 1.9;
                                                }
                                            }
                                        `}</style>

                                        {/* Cover Image */}
                                        {post.coverImage && (
                                            <div className="relative aspect-video w-full mb-12 rounded-2xl overflow-hidden border">
                                                <Image
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    unoptimized={post.coverImage?.startsWith('http://localhost:5002')}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                            </div>
                                        )}

                                        {/* Excerpt */}
                                        {displayExcerpt && (
                                            <div className="p-4 bg-primary/20 rounded-2xl border border-primary mb-12">
                                                <p className="text-xl font-medium text-foreground leading-relaxed">
                                                    {displayExcerpt}
                                                </p>
                                            </div>
                                        )}

                                        {/* Main Content - FIXED: Render HTML properly with styling */}
                                        <div className="html-content">
                                            {renderHTMLContent(post.content)}
                                        </div>

                                        {/* Tags */}
                                        {postTags.length > 0 && (
                                            <div className="flex flex-wrap gap-3 mt-12 pt-8 border-t border-secondary">
                                                <div className="flex items-center gap-2 w-full mb-4">
                                                    <Tag className="w-5 h-5 text-muted-foreground" />
                                                    <span className="font-medium">Tags:</span>
                                                </div>
                                                {postTags.map((tag: string, index: number) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                        className="gap-2 px-4 py-2 hover:bg-purple-500/20 cursor-pointer transition-colors"
                                                    >
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </article>

                                    {/* Share Section */}
                                    <Card className="mb-16 border border-secondary">
                                        <CardContent className="p-8">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-2">Share this article</h3>
                                                    <p className="text-muted-foreground">
                                                        Help others discover this insightful content
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleShare('twitter')}
                                                        className="gap-2 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500"
                                                    >
                                                        <Twitter className="w-5 h-5" />
                                                        Twitter
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleShare('linkedin')}
                                                        className="gap-2 rounded-xl hover:bg-blue-700/10 hover:text-blue-700 hover:border-blue-700"
                                                    >
                                                        <Linkedin className="w-5 h-5" />
                                                        LinkedIn
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleShare('facebook')}
                                                        className="gap-2 rounded-xl hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600"
                                                    >
                                                        <Facebook className="w-5 h-5" />
                                                        Facebook
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Related Articles */}
                                    {relatedPosts.length > 0 && (
                                        <div className="mb-16">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary">
                                                        <Sparkles className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h2 className="text-3xl font-bold">Related Articles</h2>
                                                </div>
                                                <Link href="/pallet-packaging">
                                                    <Button variant="ghost" className="gap-2 hover:bg-purple-500/10">
                                                        View All
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {relatedPosts.map((related) => (
                                                    <Link href={`/pallet-packaging/${related.slug}`} key={related.id}>
                                                        <Card className="group hover:shadow-2xl transition-all duration-300 h-full border hover:border-purple-500/50">
                                                            <CardContent className="p-6">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                                                                >
                                                                    {related.category}
                                                                </Badge>
                                                                <h4 className="font-bold mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                                                                    {related.title}
                                                                </h4>
                                                                <p className="text-muted-foreground mb-4 line-clamp-3">
                                                                    {related.excerpt}
                                                                </p>
                                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="w-3 h-3" />
                                                                        {calculateReadTime(related.excerpt)}
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        className="gap-2 hover:text-primary"
                                                                    >
                                                                        Read
                                                                        <ArrowRight className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Back to Top Button */}
                                    <div className="text-center mt-12">
                                        <Link href="/pallet-packaging">
                                            <Button
                                                variant="outline"
                                                className="gap-3 px-8 py-6 rounded-xl bg-primary  text-white transition-all duration-300"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                                Back to All Articles
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}