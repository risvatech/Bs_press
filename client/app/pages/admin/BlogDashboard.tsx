"use client";
import React, { useState, useEffect } from "react";
import BlogList from "../../pages/admin/BlogList";
import AddEditBlog from "../../pages/admin/AddEditBlog";
import api from "../../service/api";

interface Category {
    id: number;
    name: string;
}

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

export default function BlogDashboard() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get("/categories");
            setCategories(Array.isArray(data) ? data : data.categories || []);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEditPost = (post: Post) => {
        setEditingPost(post);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSuccess = () => {
        setRefreshTrigger(!refreshTrigger);
        setShowAddForm(false);
        setEditingPost(null);
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingPost(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-3 md:p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pallet Management</h1>
                        <p className="text-gray-600">Create, edit, and manage your Pallet posts</p>
                    </div>
                    {!showAddForm && !editingPost && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Create New Post
                        </button>
                    )}
                </div>

                {/* Add/Edit Form */}
                {(showAddForm || editingPost) && (
                    <div className="mb-8">
                        <AddEditBlog
                            postToEdit={editingPost}
                            categories={categories}
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    </div>
                )}

                {/* Blog List */}
                {(!showAddForm && !editingPost) || editingPost ? (
                    <BlogList
                        onEditPost={handleEditPost}
                        refreshTrigger={refreshTrigger}
                    />
                ) : null}
            </div>
        </div>
    );
}