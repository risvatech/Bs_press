"use client";
import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import {
    Save,
    Eye,
    EyeOff,
    Type,
    Bold,
    Italic,
    List,
    ListOrdered,
    Link,
    Image as ImageIcon,
    Tag,
    Hash,
    FileText,
    Folder,
    X,
    Calendar,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Quote,
    Code,
    Eraser,
    Minus,
    Paintbrush,
    Package,
    ShoppingBag,
    TrendingUp,
    Star as StarIcon,
    Upload,
    Grid,
    Trash2,
    Star,
    CheckCircle,
    ImagePlus
} from 'lucide-react';

import api from "../../service/api";
import DOMPurify from "dompurify";

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

interface FormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: "draft" | "published";
    images: ProductImage[];
    newImages: File[];
    description: string;
    tags: string[];
    tagInput: string;
    metaTitle: string;
    metaKeywords: string;
    metaDescription: string;
    categoryId: string;
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

const formatTagsForDisplay = (tags: any): string => {
    const parsed = parseTags(tags);
    return parsed.join(", ");
};

export default function ProductWYSIWYGEditor() {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        status: "draft",
        images: [],
        newImages: [],
        description: "",
        tags: [],
        tagInput: "",
        metaTitle: "",
        metaKeywords: "",
        metaDescription: "",
        categoryId: "",
    });
    const [galleryPreviews, setGalleryPreviews] = useState<GalleryPreview[]>([]);
    const [slugError, setSlugError] = useState("");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [savedProducts, setSavedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [textColor, setTextColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("transparent");
    const editorRef = useRef<HTMLDivElement>(null);
    const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch functions
    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products");
            const products = Array.isArray(data) ? data : data.products || [];
            const normalizedProducts = products.map((product: any) => ({
                ...product,
                cover_image: product.cover_image || product.coverImage,
                images: parseImages(product.images || []),
                meta_title: product.meta_title || product.metaTitle,
                meta_keywords: product.meta_keywords || product.metaKeywords,
                meta_description: product.meta_description || product.metaDescription,
                created_at: product.created_at || product.createdAt,
                updated_at: product.updated_at || product.updatedAt,
                category_id: product.category_id || product.categoryId,
            }));
            setSavedProducts(normalizedProducts);
        } catch (err) {
            console.error("Error fetching products", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get("/productcategories");
            setCategories(Array.isArray(data) ? data : data.categories || []);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        return () => {
            if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current);
        };
    }, []);

    const totalProducts = savedProducts.length;
    const publishedProducts = savedProducts.filter((p) => p.status === "published").length;
    const draftProducts = savedProducts.filter((p) => p.status === "draft").length;

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
            if (data.available === false) setSlugError("This URL is already in use.");
            else setSlugError("");
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

    const updateContent = () => {
        if (editorRef.current) {
            setFormData((p) => ({ ...p, content: editorRef.current!.innerHTML }));
        }
    };

    // Formatting functions
    const getCurrentSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        return selection;
    };

    const formatText = (format: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();

        try {
            switch (format) {
                case 'bold':
                    document.execCommand('bold', false);
                    break;
                case 'italic':
                    document.execCommand('italic', false);
                    break;
                case 'underline':
                    document.execCommand('underline', false);
                    break;
                case 'strikethrough':
                    document.execCommand('strikeThrough', false);
                    break;
            }
            updateContent();
        } catch (err) {
            console.error('Formatting error:', err);
        }
    };

    const applyHeading = (tagName: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        const selection = window.getSelection();

        try {
            if (document.queryCommandSupported('formatBlock')) {
                document.execCommand('formatBlock', false, `<${tagName}>`);
            } else {
                const range = selection && selection.rangeCount > 0
                    ? selection.getRangeAt(0)
                    : document.createRange();

                if (!selection || !selection.toString()) {
                    const heading = document.createElement(tagName);
                    heading.innerHTML = '<br>';

                    if (selection && selection.rangeCount > 0) {
                        range.insertNode(heading);
                        range.setStart(heading, 0);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        editor.appendChild(heading);
                        heading.focus();
                    }
                } else {
                    const heading = document.createElement(tagName);
                    heading.textContent = selection.toString();
                    range.deleteContents();
                    range.insertNode(heading);
                }
            }
            updateContent();
        } catch (err) {
            console.error('Heading error:', err);
            const heading = document.createElement(tagName);
            heading.textContent = 'Heading';
            editor.appendChild(heading);
            updateContent();
        }
    };

    const insertList = (type: 'bullet' | 'number') => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();

        try {
            if (type === 'bullet') {
                document.execCommand('insertUnorderedList', false);
            } else {
                document.execCommand('insertOrderedList', false);
            }
            updateContent();
        } catch (err) {
            console.error('List error:', err);
            const selection = window.getSelection();
            const list = document.createElement(type === 'bullet' ? 'ul' : 'ol');
            const listItem = document.createElement('li');

            if (selection && selection.toString()) {
                listItem.textContent = selection.toString();
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(listItem);
            } else {
                listItem.innerHTML = '&nbsp;';
            }

            list.appendChild(listItem);

            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.insertNode(list);
            } else {
                editor.appendChild(list);
            }

            updateContent();
        }
    };

    const insertLink = () => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        const selection = getCurrentSelection();
        if (!selection) {
            alert("Select text first to link");
            return;
        }

        const selectedText = selection.toString().trim();
        if (!selectedText) {
            alert("Select text first to link");
            return;
        }

        const url = prompt("Enter URL:", "https://");
        if (!url || url === "https://") return;

        let finalUrl = url.trim();
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        const range = selection.getRangeAt(0);
        const link = document.createElement("a");
        link.href = finalUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = selectedText;
        link.style.color = "#3b82f6";
        link.style.textDecoration = "underline";

        range.deleteContents();
        range.insertNode(link);

        range.setStartAfter(link);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        updateContent();
    };

    const insertImage = async () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const fd = new FormData();
            fd.append("images", file);

            try {
                const res = await api.post("/products/upload", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                if (res.data.success && res.data.files && res.data.files.length > 0) {
                    const uploadedUrl = res.data.files[0].url;

                    const editor = editorRef.current;
                    if (!editor) return;

                    const img = document.createElement("img");
                    img.src = uploadedUrl;
                    img.alt = "Uploaded image";
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.className = "rounded-lg";

                    const selection = getCurrentSelection();
                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.insertNode(img);
                        range.setStartAfter(img);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        editor.appendChild(img);
                    }

                    updateContent();
                }
            } catch (err) {
                console.error(err);
                alert("Image upload failed");
            }
        };
        fileInput.click();
    };

    const insertBlockquote = () => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();

        try {
            document.execCommand('formatBlock', false, '<blockquote>');
            updateContent();
        } catch (err) {
            console.error('Blockquote execCommand error:', err);
            const selection = window.getSelection();
            const blockquote = document.createElement('blockquote');

            if (selection && selection.toString()) {
                blockquote.textContent = selection.toString();
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(blockquote);
            } else {
                const paragraph = document.createElement('p');
                paragraph.innerHTML = 'Quote text here';
                blockquote.appendChild(paragraph);

                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(blockquote);
                } else {
                    editor.appendChild(blockquote);
                }
            }

            updateContent();
        }
    };

    const insertHorizontalRule = () => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        try {
            if (document.queryCommandSupported('insertHorizontalRule')) {
                document.execCommand('insertHorizontalRule', false);
            } else {
                const hr = document.createElement('hr');
                const selection = getCurrentSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(hr);
                } else {
                    editor.appendChild(hr);
                }
            }
            updateContent();
        } catch (err) {
            console.error('HR insertion error:', err);
        }
    };

    const insertCode = () => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();

        try {
            const codeElement = document.createElement('code');
            const selection = window.getSelection();

            if (selection && selection.toString()) {
                codeElement.textContent = selection.toString();
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(codeElement);
            } else {
                codeElement.textContent = 'code here';

                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(codeElement);
                } else {
                    editor.appendChild(codeElement);
                }
            }

            const range = document.createRange();
            range.selectNodeContents(codeElement);
            range.collapse(false);
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }

            updateContent();
        } catch (err) {
            console.error('Code block error:', err);
        }
    };

    const changeTextColor = (color: string) => {
        setTextColor(color);
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        try {
            document.execCommand('foreColor', false, color);
            updateContent();
        } catch (err) {
            console.error('Text color error:', err);
        }
    };

    const changeBackgroundColor = (color: string) => {
        setBgColor(color);
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        try {
            document.execCommand('backColor', false, color);
            updateContent();
        } catch (err) {
            console.error('Background color error:', err);
        }
    };

    const clearFormatting = () => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        try {
            document.execCommand('removeFormat', false);
            document.execCommand('unlink', false);
            setTextColor("#000000");
            setBgColor("transparent");
            updateContent();
        } catch (err) {
            console.error('Clear formatting error:', err);
        }
    };

    const alignText = (alignment: 'left' | 'center' | 'right') => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        try {
            if (alignment === 'center') {
                document.execCommand('justifyCenter', false);
            } else if (alignment === 'right') {
                document.execCommand('justifyRight', false);
            } else {
                document.execCommand('justifyLeft', false);
            }
            updateContent();
        } catch (err) {
            console.error('Text alignment error:', err);
        }
    };

    const handleEditorInput = () => {
        updateContent();
    };

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            status: "draft",
            images: [],
            newImages: [],
            description: "",
            tags: [],
            tagInput: "",
            metaTitle: "",
            metaKeywords: "",
            metaDescription: "",
            categoryId: "",
        });
        setGalleryPreviews([]);
        setEditingId(null);
        setSlugError("");
        setIsSlugManuallyEdited(false);
        setTextColor("#000000");
        setBgColor("transparent");
        if (editorRef.current) editorRef.current.innerHTML = "";
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
            if (editingId) {
                res = await api.put(`/products/${editingId}`, productData);
            } else {
                res = await api.post("/products", productData);
            }

            if (res.status === 200 || res.status === 201) {
                fetchProducts();
                alert(editingId ? "Product updated" : status === "published" ? "Published!" : "Saved");
                resetForm();
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

    const handleEditProduct = (product: Product) => {
        setEditingId(product.id);
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
            categoryId: product.category_id?.toString() || "none",
        });

        setGalleryPreviews([]); // Clear new image previews for edit

        // Set editor content
        setTimeout(() => {
            if (editorRef.current) editorRef.current.innerHTML = product.content || "";
        }, 0);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Delete this product permanently?")) return;
        try {
            const res = await api.delete(`/products/${id}`);
            if (res.status === 200) {
                setSavedProducts((p) => p.filter((product) => product.id !== id));
            } else {
                alert("Failed to delete");
            }
        } catch (err) {
            console.error(err);
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

    // Fix the gallery images array creation
    const allGalleryImages = [
        ...formData.images,
        ...galleryPreviews.map((preview, index) => ({
            url: preview.url,
            alt: `Gallery image ${index + 1}`,
            isCover: preview.isCover
        }))
    ];

    const coverImageUrl = getCoverImage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-3 md:p-4">
            <div className="max-w-6xl mx-auto">
                {/* Stats */}
                <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Package size={20} className="text-gray-600" />
                                    <div className="text-2xl font-bold text-gray-800">{totalProducts}</div>
                                </div>
                                <div className="text-sm text-gray-600">Total Products</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <ShoppingBag size={20} className="text-green-600" />
                                    <div className="text-2xl font-bold text-green-600">{publishedProducts}</div>
                                </div>
                                <div className="text-sm text-green-600">Published</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <TrendingUp size={20} className="text-yellow-600" />
                                    <div className="text-2xl font-bold text-yellow-600">{draftProducts}</div>
                                </div>
                                <div className="text-sm text-yellow-600">Drafts</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingId ? "Edit Product" : "Create New Product"}
                                </h2>
                                <p className="text-gray-600">Write and manage your product content</p>
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
                                        Product Name *
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        placeholder="Enter product name..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData(p => ({
                                            ...p,
                                            categoryId: e.target.value === "none" ? "" : e.target.value
                                        }))}
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
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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

                                {/* Product Gallery Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Images *
                                    </label>
                                    <div className="space-y-3">
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

                                {/* Excerpt */}
                                <div>
                                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                                        Short Description
                                    </label>
                                    <textarea
                                        id="excerpt"
                                        value={formData.excerpt}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                                        placeholder="Brief description of your product..."
                                        rows={2}
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
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                        placeholder="Detailed description of your product..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
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
                                        />
                                    </div>
                                </div>

                                {/* Content Editor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Details *
                                    </label>
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        {/* Toolbar */}
                                        <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
                                            <button
                                                onClick={() => formatText('bold')}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Bold (Ctrl+B)"
                                                type="button"
                                            >
                                                <Bold size={16} />
                                            </button>
                                            <button
                                                onClick={() => formatText('italic')}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Italic (Ctrl+I)"
                                                type="button"
                                            >
                                                <Italic size={16} />
                                            </button>
                                            <button
                                                onClick={() => formatText('underline')}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Underline (Ctrl+U)"
                                                type="button"
                                            >
                                                <Underline size={16} />
                                            </button>

                                            {/* Headings */}
                                            <div className="flex items-center gap-1 ml-2 border-l pl-2">
                                                <button
                                                    onClick={() => applyHeading('h1')}
                                                    className="px-2 py-1 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100"
                                                    title="Heading 1"
                                                    type="button"
                                                >
                                                    H1
                                                </button>
                                                <button
                                                    onClick={() => applyHeading('h2')}
                                                    className="px-2 py-1 text-xs font-semibold border border-gray-300 rounded hover:bg-gray-100"
                                                    title="Heading 2"
                                                    type="button"
                                                >
                                                    H2
                                                </button>
                                                <button
                                                    onClick={() => applyHeading('h3')}
                                                    className="px-2 py-1 text-xs font-medium border border-gray-300 rounded hover:bg-gray-100"
                                                    title="Heading 3"
                                                    type="button"
                                                >
                                                    H3
                                                </button>
                                                <button
                                                    onClick={() => applyHeading('p')}
                                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                                                    title="Paragraph"
                                                    type="button"
                                                >
                                                    P
                                                </button>
                                            </div>

                                            {/* Lists */}
                                            <button
                                                onClick={() => insertList('bullet')}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Bullet List"
                                                type="button"
                                            >
                                                <List size={16} />
                                            </button>
                                            <button
                                                onClick={() => insertList('number')}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Numbered List"
                                                type="button"
                                            >
                                                <ListOrdered size={16} />
                                            </button>

                                            {/* Text Alignment */}
                                            <div className="flex items-center gap-1 ml-2 border-l pl-2">
                                                <button
                                                    onClick={() => alignText('left')}
                                                    className="p-2 hover:bg-gray-200 rounded"
                                                    title="Align Left"
                                                    type="button"
                                                >
                                                    <AlignLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() => alignText('center')}
                                                    className="p-2 hover:bg-gray-200 rounded"
                                                    title="Align Center"
                                                    type="button"
                                                >
                                                    <AlignCenter size={16} />
                                                </button>
                                                <button
                                                    onClick={() => alignText('right')}
                                                    className="p-2 hover:bg-gray-200 rounded"
                                                    title="Align Right"
                                                    type="button"
                                                >
                                                    <AlignRight size={16} />
                                                </button>
                                            </div>

                                            {/* Custom Text Color Picker */}
                                            <div className="relative">
                                                <button
                                                    className="p-2 hover:bg-gray-200 rounded flex items-center gap-2"
                                                    title="Text Color"
                                                    type="button"
                                                    onClick={() => {
                                                        const colorPicker = document.getElementById("textColorPicker");
                                                        if (colorPicker) colorPicker.click();
                                                    }}
                                                >
                                                    <Type size={16} />
                                                    <div
                                                        className="w-5 h-5 rounded border border-gray-300"
                                                        style={{ backgroundColor: textColor }}
                                                    />
                                                </button>
                                                <input
                                                    id="textColorPicker"
                                                    type="color"
                                                    value={textColor}
                                                    onChange={(e) => changeTextColor(e.target.value)}
                                                    className="absolute opacity-0 w-0 h-0"
                                                />
                                            </div>

                                            {/* Custom Background Color Picker */}
                                            <div className="relative">
                                                <button
                                                    className="p-2 hover:bg-gray-200 rounded flex items-center gap-2"
                                                    title="Background Color"
                                                    type="button"
                                                    onClick={() => {
                                                        const colorPicker = document.getElementById("bgColorPicker");
                                                        if (colorPicker) colorPicker.click();
                                                    }}
                                                >
                                                    <Paintbrush size={16} />
                                                    <div
                                                        className="w-5 h-5 rounded border border-gray-300"
                                                        style={{
                                                            backgroundColor: bgColor,
                                                            backgroundImage: bgColor === 'transparent'
                                                                ? 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)'
                                                                : 'none'
                                                        }}
                                                    />
                                                </button>
                                                <input
                                                    id="bgColorPicker"
                                                    type="color"
                                                    value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                                                    onChange={(e) => changeBackgroundColor(e.target.value)}
                                                    className="absolute opacity-0 w-0 h-0"
                                                />
                                            </div>

                                            {/* Special Elements */}
                                            <button
                                                onClick={insertBlockquote}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Insert Quote"
                                                type="button"
                                            >
                                                <Quote size={16} />
                                            </button>
                                            <button
                                                onClick={insertCode}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Insert Code Block"
                                                type="button"
                                            >
                                                <Code size={16} />
                                            </button>
                                            <button
                                                onClick={insertHorizontalRule}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Insert Horizontal Line"
                                                type="button"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            {/* Insert Media */}
                                            <button
                                                onClick={insertLink}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Insert Link"
                                                type="button"
                                            >
                                                <Link size={16} />
                                            </button>
                                            <button
                                                onClick={insertImage}
                                                className="p-2 hover:bg-gray-200 rounded"
                                                title="Insert Image"
                                                type="button"
                                            >
                                                <ImageIcon size={16} />
                                            </button>

                                            {/* Clear Formatting */}
                                            <button
                                                onClick={clearFormatting}
                                                className="p-2 hover:bg-gray-200 rounded ml-auto"
                                                title="Clear All Formatting"
                                                type="button"
                                            >
                                                <Eraser size={16} />
                                            </button>
                                        </div>

                                        {/* Editor */}
                                        <div
                                            ref={editorRef}
                                            contentEditable
                                            onInput={handleEditorInput}
                                            className="min-h-[300px] p-4 bg-white focus:outline-none prose max-w-none"
                                            style={{
                                                fontFamily: 'Inter, sans-serif',
                                                lineHeight: '1.6'
                                            }}
                                            suppressContentEditableWarning
                                        />
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Tip: Select text and use toolbar buttons to format. Lists work with bullet (•) and numbered (1., 2.) styles.
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={() => handleSubmit("draft")}
                                        disabled={loading || uploadingImages}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Save size={18} />
                                        {loading ? "Saving..." : editingId ? "Update Draft" : "Save as Draft"}
                                    </button>
                                    <button
                                        onClick={() => handleSubmit("published")}
                                        disabled={loading || uploadingImages || (formData.images.length === 0 && galleryPreviews.length === 0)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        <ShoppingBag size={18} />
                                        {loading ? "Publishing..." : editingId ? "Update & Publish" : "Publish Product"}
                                    </button>
                                    {editingId && (
                                        <button
                                            onClick={resetForm}
                                            disabled={loading || uploadingImages}
                                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Preview section
                            <div className="prose max-w-none">
                                <h1 className="text-3xl mb-4">{formData.title}</h1>

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

                                {/* Cover Image */}
                                {coverImageUrl && (
                                    <div className="mb-6">
                                        <div className="relative">
                                            <img
                                                src={coverImageUrl}  // Now TypeScript knows this is a string
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

                                <div
                                    className="mt-4"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(formData.content, {
                                            ADD_TAGS: ["ul", "ol", "li"],
                                            ADD_ATTR: ["style"],
                                        })
                                    }}
                                />

                                {/* SEO Preview */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold mb-3">SEO Preview</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="text-blue-600 text-sm mb-1">example.com/products/{formData.slug}</div>
                                        <div className="text-lg text-gray-900 font-medium mb-1">
                                            {formData.metaTitle || formData.title}
                                        </div>
                                        <div className="text-gray-600 text-sm">
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
                        )}
                    </div>
                </div>

                {/* Saved Products List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Package size={24} className="text-gray-700" />
                            <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
                        </div>
                        <p className="text-gray-600">Manage your existing products</p>
                    </div>
                    <div className="p-6">
                        {savedProducts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="mb-4">
                                    <Package size={48} className="mx-auto text-gray-300" />
                                </div>
                                <p className="text-gray-500">No products yet. Create your first product!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {savedProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingBag size={18} className="text-gray-500" />
                                                        <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        product.status === "published"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                        {product.status}
                                                    </span>
                                                </div>

                                                {product.excerpt && (
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.excerpt}</p>
                                                )}

                                                <div className="flex flex-wrap gap-4 text-gray-500 text-xs mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        <span>
                                                            Created: {new Date(
                                                            product.created_at || product.createdAt
                                                        ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {product.category && (
                                                        <div className="flex items-center gap-1">
                                                            <Folder size={14} />
                                                            <span>{product.category.name}</span>
                                                        </div>
                                                    )}
                                                    {product.tags && (
                                                        <div className="flex items-center gap-1">
                                                            <Tag size={14} />
                                                            <span>{formatTagsForDisplay(product.tags)}</span>
                                                        </div>
                                                    )}
                                                    {product.images && product.images.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <Grid size={14} />
                                                            <span>{product.images.length} images</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-xs text-gray-400 font-mono">/products/{product.slug}</div>
                                            </div>

                                            <div className="flex gap-2 lg:flex-col">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}