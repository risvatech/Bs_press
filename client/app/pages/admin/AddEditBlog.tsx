'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import {
    Save,
    Eye,
    EyeOff,
    Tag,
    Hash,
    FileText,
    Folder,
    X,
    Send,
} from "lucide-react";

import api from "../../service/api";
import DOMPurify from "dompurify";
import dynamic from 'next/dynamic';

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

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: "draft" | "published";
    cover_image?: string;
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

interface FormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: "draft" | "published";
    coverImage: File | string | null;
    description: string;
    tags: string[];
    tagInput: string;
    metaTitle: string;
    metaKeywords: string;
    metaDescription: string;
    categoryId: string;
}

interface AddEditBlogProps {
    postToEdit?: Post | null;
    categories: Category[];
    onSuccess?: () => void;
    onCancel?: () => void;
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

export default function AddEditBlog({ postToEdit, categories, onSuccess, onCancel }: AddEditBlogProps) {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        status: "draft",
        coverImage: null,
        description: "",
        tags: [],
        tagInput: "",
        metaTitle: "",
        metaKeywords: "",
        metaDescription: "",
        categoryId: "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [slugError, setSlugError] = useState("");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);
    const [editorKey, setEditorKey] = useState(Date.now());

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize form when postToEdit changes
    useEffect(() => {
        if (postToEdit) {
            const tagsArray = parseTags(postToEdit.tags);

            setFormData({
                title: postToEdit.title || "",
                slug: postToEdit.slug || "",
                excerpt: postToEdit.excerpt || "",
                content: postToEdit.content || "",
                status: postToEdit.status || "draft",
                coverImage: postToEdit.cover_image || null,
                description: postToEdit.description || "",
                tags: tagsArray,
                tagInput: "",
                metaTitle: postToEdit.meta_title || "",
                metaKeywords: postToEdit.meta_keywords || "",
                metaDescription: postToEdit.meta_description || "",
                categoryId: postToEdit.category_id?.toString() || "none",
            });

            setImagePreview(postToEdit.cover_image || null);
            setEditorKey(Date.now());
        }
    }, [postToEdit]);

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
        if (postToEdit && postToEdit.slug === slug) return setSlugError("");

        try {
            const { data } = await api.get(`/posts/check-slug/${encodeURIComponent(slug)}`);
            if (data.available === false) setSlugError("This URL is already in use.");
            else setSlugError("");
        } catch {
            setSlugError("Error checking slug");
        }
    };

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

    const handleTagInput = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((p) => ({ ...p, tagInput: e.target.value }));
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

    const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const handleImageUpload = async (file: File): Promise<string | undefined> => {
        const fd = new FormData();
        fd.append("coverImage", file);
        try {
            const res = await api.post("/posts/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.url;
        } catch (err) {
            console.error(err);
            alert("Image upload failed");
            return undefined;
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setFormData((p) => ({ ...p, coverImage: file }));
    };

    const handleContentChange = (content: string) => {
        setFormData((p) => ({ ...p, content }));
    };

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            status: "draft",
            coverImage: null,
            description: "",
            tags: [],
            tagInput: "",
            metaTitle: "",
            metaKeywords: "",
            metaDescription: "",
            categoryId: "",
        });
        setImagePreview(null);
        setSlugError("");
        setIsSlugManuallyEdited(false);
        setEditorKey(Date.now());
        if (onCancel) onCancel();
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

        setIsSaving(true);
        setLoading(true);

        let coverImageUrl = formData.coverImage;

        if (formData.coverImage instanceof File) {
            const uploadedUrl = await handleImageUpload(formData.coverImage);
            if (!uploadedUrl) {
                alert("Cover image upload failed");
                setIsSaving(false);
                setLoading(false);
                return;
            }
            coverImageUrl = uploadedUrl;
        }

        const postData = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt || "",
            content: formData.content,
            status,
            coverImage: coverImageUrl || "",
            description: formData.description || "",
            tags: formData.tags,
            metaTitle: formData.metaTitle || "",
            metaKeywords: formData.metaKeywords || "",
            metaDescription: formData.metaDescription || "",
            categoryId: formData.categoryId === "none" ? null : formData.categoryId,
        };

        try {
            let res;
            if (postToEdit) {
                res = await api.put(`/posts/${postToEdit.id}`, postData);
            } else {
                res = await api.post("/posts", postData);
            }

            if (res.status === 200 || res.status === 201) {
                alert(postToEdit ? "Post updated" : status === "published" ? "Published!" : "Saved");
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                alert(res.data.message || "Server error");
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Server error");
        } finally {
            setIsSaving(false);
            setLoading(false);
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(p => ({ ...p, coverImage: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Enhanced sanitization for Quill content
    const sanitizeContent = (content: string) => {
        if (!content) return '';

        return DOMPurify.sanitize(content, {
            ALLOWED_TAGS: [
                'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li',
                'blockquote', 'pre', 'code',
                'a', 'img',
                'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
                'div', 'span'
            ],
            ALLOWED_ATTR: [
                'href', 'target', 'rel', 'title', // for links
                'src', 'alt', 'width', 'height', 'style', 'class', // for images
                'style', 'class', 'id', 'data-*', // for general elements
                'border', 'cellpadding', 'cellspacing', 'colspan', 'rowspan', // for tables
                'align', 'valign' // for table alignment
            ],
            ADD_ATTR: ['target', 'rel', 'style', 'class'],
            ADD_TAGS: ['iframe'], // if you want to allow iframes
        });
    };

    // Add CSS for proper table rendering in preview
    const tableStyles = `
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
            border: 1px solid #e5e7eb;
        }
        table th, table td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
        }
        table th {
            background-color: #f9fafb;
            font-weight: 600;
        }
        table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        table tr:hover {
            background-color: #f3f4f6;
        }
        .prose img {
            max-width: 100%;
            height: auto;
            border-radius: 0.375rem;
        }
        .prose a {
            color: #3b82f6;
            text-decoration: underline;
        }
        .prose a:hover {
            color: #1d4ed8;
        }
        .prose blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1rem;
            font-style: italic;
            color: #4b5563;
        }
        .prose code {
            background-color: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', monospace;
        }
        .prose pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 1rem;
            border-radius: 0.375rem;
            overflow-x: auto;
        }
    `;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {postToEdit ? "Edit Pallet Post" : "Create New Post"}
                        </h2>
                        <p className="text-gray-600">Write and manage your Pallet content</p>
                    </div>
                    <button
                        onClick={() => setShowPreview((s) => !s)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showPreview ? "Edit" : "Preview"}
                    </button>
                </div>
            </div>
            <div className="p-6">
                {!showPreview ? (
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="Enter post title..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                disabled={loading}
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                                Slug *
                            </label>
                            <div className="relative">
                                <input
                                    id="slug"
                                    type="text"
                                    value={formData.slug}
                                    onChange={handleSlugChange}
                                    placeholder="post-url-slug"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-24 ${
                                        slugError ? "border-red-500" : "border-gray-300"
                                    } ${loading ? "bg-gray-50" : ""}`}
                                    disabled={loading}
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
                                Category
                            </label>
                            <select
                                id="category"
                                value={formData.categoryId || "none"}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData(p => ({
                                    ...p,
                                    categoryId: e.target.value === "none" ? "" : e.target.value
                                }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                disabled={loading}
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
                                Tags
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
                                            disabled={loading}
                                        />
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        disabled={loading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                                                    disabled={loading}
                                                    className="ml-1 hover:text-red-500 disabled:opacity-50"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cover Image
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleImageButtonClick}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Choose Image
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        id="coverImageInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                    {formData.coverImage && (
                                        <span className="text-sm text-gray-600 truncate">
                                            {formData.coverImage instanceof File ? formData.coverImage.name : "Image selected"}
                                        </span>
                                    )}
                                </div>
                                {imagePreview && (
                                    <div className="relative w-full max-w-md">
                                        <img
                                            src={imagePreview}
                                            alt="preview"
                                            className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            disabled={loading}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                                Excerpt
                            </label>
                            <textarea
                                id="excerpt"
                                value={formData.excerpt}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                                placeholder="Brief description of your post..."
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Detailed description of your post..."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                disabled={loading}
                            />
                        </div>

                        {/* SEO Meta Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((p) => ({ ...p, metaTitle: e.target.value }))}
                                    placeholder="Meta title for SEO (50-60 characters ideal)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    disabled={loading}
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
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((p) => ({ ...p, metaDescription: e.target.value }))}
                                    placeholder="Meta description for SEO (155-160 characters ideal)"
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                    disabled={loading}
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
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((p) => ({ ...p, metaKeywords: e.target.value }))}
                                    placeholder="Comma-separated keywords for SEO"
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Content *
                            </label>
                            <RichTextEditor
                                key={editorKey}
                                onContentChange={handleContentChange}
                                initialContent={formData.content}
                            />
                            <div className="mt-2 text-sm text-gray-500">
                                Use the toolbar above to format your content. Table support is included.
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                onClick={() => handleSubmit("draft")}
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                {isSaving ? "Saving..." : postToEdit ? "Update Draft" : "Save Draft"}
                            </button>
                            <button
                                onClick={() => handleSubmit("published")}
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                                {isSaving ? "Publishing..." : postToEdit ? "Update & Publish" : "Publish Post"}
                            </button>
                            {(postToEdit || onCancel) && (
                                <button
                                    onClick={resetForm}
                                    disabled={isSaving}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    // Preview section with proper HTML rendering
                    <div className="preview-container">
                        {/* Inject styles for proper table and HTML rendering */}
                        <style dangerouslySetInnerHTML={{ __html: tableStyles }} />

                        <div className="prose max-w-none">
                            <h1 className="text-3xl font-bold mb-4 text-gray-900">{formData.title}</h1>

                            {/* Meta info */}
                            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                                {formData.categoryId && formData.categoryId !== "none" && (
                                    <div className="flex items-center gap-1">
                                        <Folder size={14} />
                                        <span>
                                            {categories.find(c => c.id.toString() === formData.categoryId)?.name}
                                        </span>
                                    </div>
                                )}
                                {formData.tags.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Tag size={14} />
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

                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="cover"
                                    className="w-full h-64 object-cover rounded-lg mb-6 border border-gray-300"
                                />
                            )}

                            {formData.excerpt && (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                                    <p className="text-gray-700 italic text-lg">{formData.excerpt}</p>
                                </div>
                            )}

                            {formData.description && (
                                <p className="text-gray-600 mb-6 text-lg leading-relaxed">{formData.description}</p>
                            )}

                            {/* Content with proper HTML rendering */}
                            <div
                                className="mt-4 preview-content"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeContent(formData.content)
                                }}
                            />

                            {/* SEO Preview */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold mb-3 text-gray-900">SEO Preview</h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="text-blue-600 text-sm mb-1">example.com/Pallet/{formData.slug}</div>
                                    <div className="text-lg text-gray-900 font-medium mb-1 line-clamp-1">
                                        {formData.metaTitle || formData.title}
                                    </div>
                                    <div className="text-gray-600 text-sm line-clamp-2">
                                        {formData.metaDescription || formData.excerpt || formData.description}
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
                )}
            </div>
        </div>
    );
}