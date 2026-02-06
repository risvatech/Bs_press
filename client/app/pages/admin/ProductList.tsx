'use client';

import React, { useState, useEffect } from "react";
import {
    Package,
    ShoppingBag,
    TrendingUp,
    Calendar,
    Folder,
    Tag,
    Grid,
    Trash2,
    Edit,
    Plus,
    Eye,
    EyeOff
} from 'lucide-react';
import api from "../../service/api";
import ProductForm from './ProductForm';

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

export default function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Fetch products and categories
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/products");
            const productsData = Array.isArray(data) ? data : data.products || [];
            const normalizedProducts = productsData.map((product: any) => ({
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
            setProducts(normalizedProducts);
        } catch (err) {
            console.error("Error fetching products", err);
            alert("Failed to fetch products");
        } finally {
            setLoading(false);
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
    }, []);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setViewMode('form');
        setShowPreview(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setViewMode('form');
        setShowPreview(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Delete this product permanently?")) return;
        try {
            const res = await api.delete(`/products/${id}`);
            if (res.status === 200) {
                setProducts((p) => p.filter((product) => product.id !== id));
                alert("Product deleted successfully");
            } else {
                alert("Failed to delete");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting product");
        }
    };

    const handleFormSubmitSuccess = () => {
        fetchProducts(); // Refresh the list
        setViewMode('list');
        setEditingProduct(null);
        setShowPreview(false);
    };

    const handleCancelForm = () => {
        setViewMode('list');
        setEditingProduct(null);
        setShowPreview(false);
    };

    const handleTogglePreview = () => {
        setShowPreview(!showPreview);
    };

    const totalProducts = products.length;
    const publishedProducts = products.filter((p) => p.status === "published").length;
    const draftProducts = products.filter((p) => p.status === "draft").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-3 md:p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                            <p className="text-gray-600 mt-2">Manage your product catalog and inventory</p>
                        </div>

                        {viewMode === 'form' && (
                            <button
                                onClick={handleTogglePreview}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {showPreview ? (
                                    <>
                                        <EyeOff size={18} />
                                        Hide Preview
                                    </>
                                ) : (
                                    <>
                                        <Eye size={18} />
                                        Show Preview
                                    </>
                                )}
                            </button>
                        )}

                        {viewMode === 'list' && (
                            <button
                                onClick={handleAddProduct}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Plus size={20} />
                                Add New Product
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
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
                </div>

                {/* Main Content */}
                {viewMode === 'list' ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package size={24} className="text-gray-700" />
                                    <h2 className="text-xl font-bold text-gray-900">All Products</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        Showing {products.length} product{products.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="mb-4">
                                        <Package size={64} className="mx-auto text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No products yet</h3>
                                    <p className="text-gray-500 mb-6">Start by adding your first product to the catalog.</p>
                                    <button
                                        onClick={handleAddProduct}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus size={20} />
                                        Add Your First Product
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products.map((product) => (
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
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                product.status === "published"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}>
                                                                {product.status}
                                                            </span>
                                                        </div>
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

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
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
                ) : (
                    <div className="space-y-6">
                        {/* Back to List Button */}
                        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
                            <button
                                onClick={handleCancelForm}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                ← Back to Products List
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {editingProduct ? "Editing Product" : "Creating New Product"}
                                </span>
                            </div>
                        </div>

                        {/* Product Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingProduct ? `Editing: ${editingProduct.title}` : "Add New Product"}
                                </h2>
                                <p className="text-gray-600">
                                    {editingProduct ? "Update product details below" : "Fill in the product details below"}
                                </p>
                            </div>
                            <div className="p-6">
                                <ProductForm
                                    product={editingProduct}
                                    categories={categories}
                                    onSuccess={handleFormSubmitSuccess}
                                    onCancel={handleCancelForm}
                                    showPreview={showPreview}
                                    onTogglePreview={handleTogglePreview}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}