'use client';

import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import {
    Save,
    Eye,
    EyeOff,
    Hash,
    FileText,
    Folder,
    X,
    Calendar,
    Upload,
    Trash2,
    Star,
    ShoppingBag,
    Package,
    TrendingUp,
    Star as StarIcon,
    Grid,
    ArrowLeft
} from 'lucide-react';
import DOMPurify from "dompurify";
import dynamic from 'next/dynamic';
import api from "../../service/api";

// Dynamically import RichTextEditor to avoid SSR issues with Quill
const RichTextEditor = dynamic(
    () => import("../../components/sub_pages/RichTextEditor1"),
    {
        ssr: false,
        loading: () => (
            <div className="border border-gray-300 rounded-lg h-64 flex items-center justify-center">
                <div className="text-gray-500">Loading editor...</div>
            </div>
        )
    }
);

// Types
interface ProductImage {
    url: string;
    filename: string;
    alt?: string;
    isCover?: boolean;
    order?: number;
}

interface Product {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: "draft" | "published";
    cover_image?: string;
    images?: ProductImage[];
    description?: string;
    tags?: any;
    meta_title?: string;
    meta_keywords?: string;
    meta_description?: string;
    category_id?: number | null;
    category?: {
        id: number;
        name: string;
    } | null;
    created_at?: string;
    updated_at?: string;
    createdAt: string;
    updatedAt: string;
}

interface Category {
    id: number;
    name: string;
}

interface GalleryPreview {
    url: string;
    file: File;
    isCover: boolean;
}

interface ProductFormProps {
    product?: Product | null;
    categories: Category[];
    onSuccess: () => void;
    onCancel: () => void;
    showPreview?: boolean;
    onTogglePreview?: () => void;
}

const parseTags = (tags: any): string[] => {
    if (!tags) return [];

    if (Array.isArray(tags)) {
        return tags.filter(tag => typeof tag === 'string');
    }

    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) {
                return parsed.filter((tag: any) => typeof tag === 'string');
            }
            return tags.split(',').map((tag: string) => tag.trim()).filter(tag => tag.length > 0);
        } catch {
            return tags.split(',').map((tag: string) => tag.trim()).filter(tag => tag.length > 0);
        }
    }

    return [];
};

const parseImages = (images: any): ProductImage[] => {
    if (!images) return [];

    if (Array.isArray(images)) {
        return images.filter((img): img is ProductImage =>
            img && typeof img === 'object' && img.url
        );
    }

    if (typeof images === 'string') {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) {
                return parsed.filter((img: any): img is ProductImage =>
                    img && typeof img === 'object' && img.url
                );
            }
        } catch {
            return [];
        }
    }

    return [];
};

const ProductForm: React.FC<ProductFormProps> = ({
                                                     product,
                                                     categories,
                                                     onSuccess,
                                                     onCancel,
                                                     showPreview = false,
                                                     onTogglePreview
                                                 }) => {
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        status: "draft" as "draft" | "published",
        images: [] as ProductImage[],
        newImages: [] as File[],
        description: "",
        tags: [] as string[],
        tagInput: "",
        metaTitle: "",
        metaKeywords: "",
        metaDescription: "",
        categoryId: "",
    });
    const [galleryPreviews, setGalleryPreviews] = useState<GalleryPreview[]>([]);
    const [slugError, setSlugError] = useState("");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [localShowPreview, setLocalShowPreview] = useState(showPreview);
    const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);
    const [editorKey, setEditorKey] = useState(Date.now());

    // Initialize form with product data if editing
    useEffect(() => {
        if (product) {
            const tagsArray = parseTags(product.tags);
            const imagesArray = parseImages(product.images);

            setFormData({
                title: product.title || "",
                slug: product.slug || "",
                excerpt: product.excerpt || "",
                content: product.content || "",
                status: product.status || "draft",
                images: imagesArray,
                newImages: [],
                description: product.description || "",
                tags: tagsArray,
                tagInput: "",
                metaTitle: product.meta_title || "",
                metaKeywords: product.meta_keywords || "",
                metaDescription: product.meta_description || "",
                categoryId: product.category_id?.toString() || "",
            });
            setIsSlugManuallyEdited(true);
            // Update editor key to force re-render with new content
            setEditorKey(Date.now());
        }
    }, [product]);

    // Sync local preview state with prop
    useEffect(() => {
        setLocalShowPreview(showPreview);
    }, [showPreview]);

    const generateSlug = (title: string) =>
        title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();

    const debounceCheckSlug = (slug: string) => {
        if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current);
        slugCheckTimeout.current = setTimeout(() => checkSlugUniqueness(slug), 500);
    };

    const checkSlugUniqueness = async (slug: string) => {
        if (!slug) return setSlugError("");
        try {
            const { data } = await api.get(`/products/check-slug/${encodeURIComponent(slug)}`);
            if (data.available === false && (!product || product.slug !== slug)) {
                setSlugError("This URL is already in use.");
            } else {
                setSlugError("");
            }
        } catch {
            setSlugError("Error checking slug");
        }
    };

    // Event handlers
    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData((p) => ({ ...p, title }));
        if (!isSlugManuallyEdited && title) {
            const newSlug = generateSlug(title);
            setFormData((p) => ({ ...p, slug: newSlug }));
            debounceCheckSlug(newSlug);
        }
    };

    const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const slug = generateSlug(raw);
        setFormData((p) => ({ ...p, slug }));
        setIsSlugManuallyEdited(true);
        debounceCheckSlug(slug);
    };

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFormData(p => ({
            ...p,
            categoryId: e.target.value === "none" ? "" : e.target.value
        }));
    };

    const handleTagInput = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData(p => ({ ...p, tagInput: e.target.value }));
    };

    const addTag = () => {
        const tag = formData.tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData((p) => ({
                ...p,
                tags: [...p.tags, tag],
                tagInput: ""
            }));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData((p) => ({
            ...p,
            tags: p.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleTagKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const uploadImages = async (files: File[]): Promise<ProductImage[]> => {
        if (!files || files.length === 0) return [];

        const fd = new FormData();
        files.forEach(file => {
            fd.append("images", file);
        });

        try {
            const res = await api.post("/products/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success && res.data.files) {
                return res.data.files.map((fileData: any, index: number) => ({
                    url: fileData.url,
                    filename: fileData.filename,
                    alt: `Product image ${index + 1}`,
                    isCover: index === 0,
                    order: index
                }));
            }
            return [];
        } catch (err) {
            console.error("Error uploading images:", err);
            alert("Failed to upload images");
            return [];
        }
    };

    const handleMultipleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Create previews
        const newPreviews = files.map(file => ({
            url: URL.createObjectURL(file),
            file,
            isCover: false
        }));

        // Mark first image as cover if no cover exists yet
        if (galleryPreviews.length === 0 && formData.images.length === 0) {
            newPreviews[0].isCover = true;
        }

        setGalleryPreviews(prev => [...prev, ...newPreviews]);
        setFormData(prev => ({
            ...prev,
            newImages: [...prev.newImages, ...files]
        }));
    };

    const removeGalleryImage = (index: number) => {
        setGalleryPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index].url);
            newPreviews.splice(index, 1);
            return newPreviews;
        });

        setFormData(prev => ({
            ...prev,
            newImages: prev.newImages.filter((_, i) => i !== index)
        }));
    };

    const removeExistingImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const setCoverImage = (index: number, isExisting: boolean = false) => {
        if (isExisting) {
            // Set existing image as cover
            const updatedImages = formData.images.map((img, i) => ({
                ...img,
                isCover: i === index
            }));

            setFormData(prev => ({
                ...prev,
                images: updatedImages
            }));
        } else {
            // Set new image as cover
            const updatedPreviews = galleryPreviews.map((preview, i) => ({
                ...preview,
                isCover: i === index
            }));

            setGalleryPreviews(updatedPreviews);
        }
    };

    const handleContentChange = (content: string) => {
        setFormData(p => ({ ...p, content }));
    };

    const handleSubmit = async (status: "draft" | "published") => {
        if (slugError) {
            alert("Fix slug error before submitting");
            return;
        }
        if (!formData.title || !formData.slug || !formData.content) {
            alert("All required fields must be filled");
            return;
        }

        setLoading(true);
        setUploadingImages(true);

        let uploadedImages: ProductImage[] = [...formData.images];

        // Upload new images if any
        if (formData.newImages.length > 0) {
            const uploaded = await uploadImages(formData.newImages);
            uploadedImages = [...uploadedImages, ...uploaded];

            // Update cover status from gallery previews
            const newImagesWithCoverStatus = uploaded.map((img, index) => {
                const preview = galleryPreviews[index];
                return {
                    ...img,
                    isCover: preview?.isCover || false
                };
            });

            // Merge with existing images
            const allImages = [...formData.images, ...newImagesWithCoverStatus];

            // Ensure only one cover image
            const hasCover = allImages.some(img => img.isCover);
            if (!hasCover && allImages.length > 0) {
                allImages[0].isCover = true;
            }

            uploadedImages = allImages;
        }

        // Get cover image URL
        const coverImageObj = uploadedImages.find(img => img.isCover);
        const coverImageUrl = coverImageObj?.url || "";

        const productData = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt || "",
            content: formData.content,
            status,
            coverImage: coverImageUrl,
            images: uploadedImages,
            description: formData.description || "",
            tags: formData.tags,
            metaTitle: formData.metaTitle || "",
            metaKeywords: formData.metaKeywords || "",
            metaDescription: formData.metaDescription || "",
            categoryId: formData.categoryId === "none" ? null : formData.categoryId,
        };

        try {
            let res;
            if (product?.id) {
                res = await api.put(`/products/${product.id}`, productData);
            } else {
                res = await api.post("/products", productData);
            }

            if (res.status === 200 || res.status === 201) {
                alert(product?.id ? "Product updated successfully!" : status === "published" ? "Product published!" : "Product saved as draft!");
                onSuccess();
            } else {
                alert(res.data.message || "Server error");
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
            setUploadingImages(false);
        }
    };

    const handleSaveDraft = () => handleSubmit("draft");
    const handlePublish = () => handleSubmit("published");

    const togglePreview = () => {
        setLocalShowPreview(!localShowPreview);
        if (onTogglePreview) {
            onTogglePreview();
        }
    };

    // Get cover image URL for preview
    const getCoverImage = () => {
        // Check existing images
        const existingCover = formData.images.find(img => img.isCover);
        if (existingCover) return existingCover.url;

        // Check gallery previews
        const previewCover = galleryPreviews.find(preview => preview.isCover);
        if (previewCover) return previewCover.url;

        // Return first image if exists
        if (formData.images.length > 0) return formData.images[0].url;
        if (galleryPreviews.length > 0) return galleryPreviews[0].url;

        return null;
    };

    const allGalleryImages = [
        ...formData.images,
        ...galleryPreviews.map((preview, index) => ({
            url: preview.url,
            alt: `Gallery image ${index + 1}`,
            isCover: preview.isCover
        }))
    ];

    const coverImageUrl = getCoverImage();

    // If in preview mode, show preview
    if (localShowPreview) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg border border-gray-200">
                    <button
                        onClick={togglePreview}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Edit
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Preview Mode</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || "Untitled Product"}</h1>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                        {formData.categoryId && formData.categoryId !== "none" && (
                            <div className="flex items-center gap-1">
                                <Folder size={14} />
                                <span>
                                    {categories.find(c => c.id.toString() === formData.categoryId)?.name || "Uncategorized"}
                                </span>
                            </div>
                        )}
                        {formData.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                                <FileText size={14} />
                                <div className="flex flex-wrap gap-1">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cover Image */}
                    {coverImageUrl && (
                        <div className="mb-6">
                            <div className="relative">
                                <img
                                    src={coverImageUrl}
                                    alt="Cover image"
                                    className="w-full h-64 object-cover rounded-lg border-2 border-blue-500"
                                />
                                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                                    <StarIcon size={12} className="inline mr-1" />
                                    Cover Image
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gallery Images */}
                    {allGalleryImages.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3">Product Gallery</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {allGalleryImages.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={img.url}
                                            alt={img.alt || `Product image ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-lg border border-gray-300"
                                        />
                                        {img.isCover && (
                                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                <StarIcon size={10} className="inline mr-1" />
                                                Cover
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.excerpt && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                            <p className="text-gray-700 italic">{formData.excerpt}</p>
                        </div>
                    )}

                    {formData.description && (
                        <p className="text-gray-600 mb-6">{formData.description}</p>
                    )}

                    {/* Content Preview with proper HTML rendering */}
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Product Details</h3>
                        <div
                            className="product-content-preview"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(formData.content, {
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
                                })
                            }}
                        />

                        {/* Inline CSS for list styling */}
                        <style jsx global>{`
                            .product-content-preview {
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.7;
                                color: #374151;
                            }

                            .product-content-preview h1,
                            .product-content-preview h2,
                            .product-content-preview h3,
                            .product-content-preview h4,
                            .product-content-preview h5,
                            .product-content-preview h6 {
                                font-weight: 600;
                                margin-top: 1.5em;
                                margin-bottom: 0.75em;
                                color: #111827;
                            }

                            .product-content-preview h1 {
                                font-size: 2em;
                                border-bottom: 2px solid #e5e7eb;
                                padding-bottom: 0.5em;
                            }
                            .product-content-preview h2 {
                                font-size: 1.5em;
                                border-bottom: 1px solid #e5e7eb;
                                padding-bottom: 0.3em;
                            }
                            .product-content-preview h3 { font-size: 1.25em; }
                            .product-content-preview h4 { font-size: 1.125em; }

                            .product-content-preview p {
                                margin-bottom: 1em;
                                line-height: 1.8;
                            }

                            .product-content-preview a {
                                color: #3b82f6;
                                text-decoration: underline;
                                text-underline-offset: 2px;
                            }

                            .product-content-preview a:hover {
                                color: #2563eb;
                            }

                            .product-content-preview strong,
                            .product-content-preview b {
                                font-weight: 700;
                                color: #111827;
                            }

                            .product-content-preview em,
                            .product-content-preview i {
                                font-style: italic;
                            }

                            .product-content-preview u {
                                text-decoration: underline;
                            }

                            .product-content-preview s,
                            .product-content-preview del,
                            .product-content-preview strike {
                                text-decoration: line-through;
                                color: #6b7280;
                            }

                            /* Lists */
                            .product-content-preview ul {
                                margin: 1em 0;
                                padding-left: 2em;
                                list-style-type: disc;
                            }

                            .product-content-preview ul li {
                                margin-bottom: 0.5em;
                                padding-left: 0.5em;
                            }

                            .product-content-preview ol {
                                margin: 1em 0;
                                padding-left: 2em;
                                list-style-type: decimal;
                            }

                            .product-content-preview ol li {
                                margin-bottom: 0.5em;
                                padding-left: 0.5em;
                            }

                            .product-content-preview blockquote {
                                border-left: 4px solid #3b82f6;
                                padding: 1em 1.5em;
                                margin: 1.5em 0;
                                background-color: #f8fafc;
                                border-radius: 0 0.5em 0.5em 0;
                                font-style: italic;
                                color: #475569;
                            }

                            .product-content-preview blockquote p {
                                margin: 0;
                            }

                            .product-content-preview code {
                                background-color: #f1f5f9;
                                padding: 0.2em 0.4em;
                                border-radius: 0.25em;
                                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                                font-size: 0.875em;
                                color: #0f172a;
                                border: 1px solid #e2e8f0;
                            }

                            .product-content-preview pre {
                                background-color: #1e293b;
                                color: #f8fafc;
                                padding: 1.25em;
                                border-radius: 0.5em;
                                overflow-x: auto;
                                margin: 1.5em 0;
                                border: 1px solid #334155;
                            }

                            .product-content-preview pre code {
                                background-color: transparent;
                                padding: 0;
                                color: inherit;
                                border: none;
                            }

                            .product-content-preview hr {
                                border: none;
                                border-top: 2px solid #e5e7eb;
                                margin: 2em 0;
                            }

                            .product-content-preview table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 1.5em 0;
                                border: 1px solid #d1d5db;
                                border-radius: 0.5em;
                                overflow: hidden;
                                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                            }

                            .product-content-preview th,
                            .product-content-preview td {
                                border: 1px solid #d1d5db;
                                padding: 0.75em 1em;
                                text-align: left;
                            }

                            .product-content-preview th {
                                background-color: #f9fafb;
                                font-weight: 600;
                                color: #111827;
                            }

                            .product-content-preview tr:nth-child(even) {
                                background-color: #f9fafb;
                            }

                            .product-content-preview tr:hover {
                                background-color: #f3f4f6;
                            }

                            .product-content-preview img {
                                max-width: 100%;
                                height: auto;
                                border-radius: 0.5em;
                                margin: 1em 0;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            }
                        `}</style>
                    </div>

                    {/* SEO Preview */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-3">SEO Preview</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-blue-600 text-sm mb-1">example.com/products/{formData.slug || "product-slug"}</div>
                            <div className="text-lg text-gray-900 font-medium mb-1">
                                {formData.metaTitle || formData.title || "Product Title"}
                            </div>
                            <div className="text-gray-600 text-sm">
                                {formData.metaDescription || formData.excerpt || formData.description || "Product description will appear here."}
                            </div>
                            {formData.metaKeywords && (
                                <div className="text-gray-500 text-xs mt-2">
                                    Keywords: {formData.metaKeywords}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Edit form
    return (
        <div className="space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name *
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="Enter product name..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            required
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                            Product URL *
                        </label>
                        <div className="relative">
                            <input
                                id="slug"
                                type="text"
                                value={formData.slug}
                                onChange={handleSlugChange}
                                placeholder="product-url-slug"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-24 ${
                                    slugError ? "border-red-500" : "border-gray-300"
                                }`}
                                required
                            />
                            {formData.slug && (
                                <span
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${
                                        slugError ? "text-red-500" : "text-green-600"
                                    }`}
                                >
                                    {slugError ? "Not available" : "Available"}
                                </span>
                            )}
                        </div>
                        {slugError && <p className="text-red-500 text-sm mt-1">{slugError}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Category
                        </label>
                        <select
                            id="category"
                            value={formData.categoryId || "none"}
                            onChange={handleCategoryChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        >
                            <option value="none">No category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Tags
                        </label>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        id="tags"
                                        type="text"
                                        value={formData.tagInput}
                                        onChange={handleTagInput}
                                        onKeyDown={handleTagKeyPress}
                                        placeholder="Type tag and press Enter or comma..."
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                                        >
                                            <Hash size={12} />
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 hover:text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Excerpt */}
                    <div>
                        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description
                        </label>
                        <textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                            placeholder="Brief description of your product..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            placeholder="Detailed description of your product..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Product Gallery Images */}
            <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Product Images *
                </label>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => document.getElementById("galleryImagesInput")?.click()}
                            disabled={uploadingImages}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <Upload size={16} />
                            {uploadingImages ? "Uploading..." : "Upload Images"}
                        </button>
                        <input
                            id="galleryImagesInput"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMultipleImagesChange}
                            className="hidden"
                            disabled={uploadingImages}
                        />
                        {(formData.images.length > 0 || galleryPreviews.length > 0) && (
                            <span className="text-sm text-gray-600">
                                {formData.images.length + galleryPreviews.length} image(s) selected
                            </span>
                        )}
                    </div>

                    {/* Gallery Images Display */}
                    {(formData.images.length > 0 || galleryPreviews.length > 0) && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {/* Existing Images */}
                                {formData.images.map((img, index) => (
                                    <div key={`existing-${img.filename}-${index}`} className="relative group">
                                        <div className="relative overflow-hidden rounded-lg border border-gray-300">
                                            <img
                                                src={img.url}
                                                alt={img.alt || `Product image ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                            {img.isCover && (
                                                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                    <StarIcon size={10} className="inline mr-1" />
                                                    Cover
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCoverImage(index, true)}
                                                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                                                        title="Set as cover"
                                                    >
                                                        {img.isCover ? (
                                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                                        ) : (
                                                            <Star size={16} className="text-gray-400" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(index)}
                                                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                                                        title="Remove image"
                                                    >
                                                        <Trash2 size={16} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* New Image Previews */}
                                {galleryPreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative group">
                                        <div className="relative overflow-hidden rounded-lg border border-gray-300">
                                            <img
                                                src={preview.url}
                                                alt={`New image ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                            {preview.isCover && (
                                                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                    <StarIcon size={10} className="inline mr-1" />
                                                    Cover
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCoverImage(index)}
                                                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                                                        title="Set as cover"
                                                    >
                                                        {preview.isCover ? (
                                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                                        ) : (
                                                            <Star size={16} className="text-gray-400" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(index)}
                                                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                                                        title="Remove image"
                                                    >
                                                        <Trash2 size={16} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        <span>Click star to set as cover image</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Trash2 size={14} className="text-red-500" />
                                        <span>Click trash to remove</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs">
                                    First image will be used as cover by default. At least one image is required.
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-500">
                        Upload multiple images to create a product gallery. Click the star icon to set as cover image. Maximum 10 images.
                    </p>
                </div>
            </div>

            {/* Rich Text Editor */}
            <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Product Details *
                </label>
                <RichTextEditor
                    key={editorKey}
                    initialContent={formData.content}
                    onContentChange={handleContentChange}
                />
                <div className="mt-2 text-sm text-gray-500">
                    Use the toolbar above to format your product details.
                </div>
            </div>

            {/* SEO Meta Fields */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                            <div className="flex items-center gap-2">
                                <FileText size={14} />
                                Meta Title
                            </div>
                        </label>
                        <input
                            id="metaTitle"
                            type="text"
                            value={formData.metaTitle}
                            onChange={(e) => setFormData(p => ({ ...p, metaTitle: e.target.value }))}
                            placeholder="Meta title for SEO (50-60 characters ideal)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            <div className="flex items-center gap-2">
                                <FileText size={14} />
                                Meta Description
                            </div>
                        </label>
                        <textarea
                            id="metaDescription"
                            value={formData.metaDescription}
                            onChange={(e) => setFormData(p => ({ ...p, metaDescription: e.target.value }))}
                            placeholder="Meta description for SEO (155-160 characters ideal)"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                            <div className="flex items-center gap-2">
                                <FileText size={14} />
                                Meta Keywords
                            </div>
                        </label>
                        <textarea
                            id="metaKeywords"
                            value={formData.metaKeywords}
                            onChange={(e) => setFormData(p => ({ ...p, metaKeywords: e.target.value }))}
                            placeholder="Comma-separated keywords for SEO"
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 flex flex-wrap gap-3">
                <button
                    onClick={handleSaveDraft}
                    disabled={loading || uploadingImages}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Save size={18} />
                    {loading ? "Saving..." : product ? "Update Draft" : "Save as Draft"}
                </button>
                <button
                    onClick={handlePublish}
                    disabled={loading || uploadingImages || (formData.images.length === 0 && galleryPreviews.length === 0)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                    <ShoppingBag size={18} />
                    {loading ? "Publishing..." : product ? "Update & Publish" : "Publish Product"}
                </button>
                <button
                    onClick={togglePreview}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    {localShowPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                    {localShowPreview ? "Hide Preview" : "Preview"}
                </button>
                <button
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ProductForm;