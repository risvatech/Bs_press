"use client";
import React, { useState, useEffect } from "react";
import { Calendar, Folder, Tag, Eye, Edit, Trash2 } from "lucide-react";
import api from "../../service/api";

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

const formatTagsForDisplay = (tags: any): string => {
    if (!tags) return "";

    if (Array.isArray(tags)) {
        return tags.filter(tag => typeof tag === 'string').join(", ");
    }

    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) {
                return parsed.filter((tag: any) => typeof tag === 'string').join(", ");
            }
            return tags;
        } catch {
            return tags;
        }
    }

    return "";
};

interface BlogListProps {
    onEditPost: (post: Post) => void;
    refreshTrigger?: boolean;
}

export default function BlogList({ onEditPost, refreshTrigger }: BlogListProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        draft: 0
    });

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/posts");
            const postsData = Array.isArray(data) ? data : data.posts || [];
            const normalizedPosts = postsData.map((post: any) => ({
                ...post,
                cover_image: post.cover_image || post.coverImage,
                meta_title: post.meta_title || post.metaTitle,
                meta_keywords: post.meta_keywords || post.metaKeywords,
                meta_description: post.meta_description || post.metaDescription,
                created_at: post.created_at || post.createdAt,
                updated_at: post.updated_at || post.updatedAt,
                category_id: post.category_id || post.categoryId,
            }));
            setPosts(normalizedPosts);

            // Calculate stats
            const total = normalizedPosts.length;
            const published = normalizedPosts.filter((p: Post) => p.status === "published").length;
            const draft = normalizedPosts.filter((p: Post) => p.status === "draft").length;
            setStats({ total, published, draft });
        } catch (err) {
            console.error("Error fetching posts", err);
            alert("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm("Delete this post permanently?")) return;
        try {
            const res = await api.delete(`/posts/${id}`);
            if (res.status === 200) {
                setPosts((p) => p.filter((post) => post.id !== id));
                setStats(prev => ({
                    total: prev.total - 1,
                    published: posts.find(p => p.id === id)?.status === "published" ? prev.published - 1 : prev.published,
                    draft: posts.find(p => p.id === id)?.status === "draft" ? prev.draft - 1 : prev.draft
                }));
                alert("Post deleted successfully");
            } else {
                alert("Failed to delete");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete post");
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-center text-gray-600 mt-4">Loading posts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total Posts</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                            <div className="text-sm text-green-600">Published</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
                            <div className="text-sm text-yellow-600">Drafts</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Your Pallet Posts</h2>
                    <p className="text-gray-600">Manage your existing posts</p>
                </div>
                <div className="p-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No posts yet. Create your first Pallet post!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        post.status === "published"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}>
                                                        {post.status}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            window.open(`/pallet-packaging/${post.slug}`, '_blank');
                                                        }}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                        title="Preview"
                                                    >
                                                        <Eye size={16} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>

                                            {post.excerpt && (
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                                            )}

                                            <div className="flex flex-wrap gap-4 text-gray-500 text-xs mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    <span>
                                                        Created: {new Date(
                                                        post.created_at || post.createdAt
                                                    ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {post.category && (
                                                    <div className="flex items-center gap-1">
                                                        <Folder size={14} />
                                                        <span>{post.category.name}</span>
                                                    </div>
                                                )}
                                                {post.tags && (
                                                    <div className="flex items-center gap-1">
                                                        <Tag size={14} />
                                                        <span>{formatTagsForDisplay(post.tags)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-400 font-mono">/pallet-packaging/{post.slug}</div>
                                        </div>

                                        <div className="flex gap-2 lg:flex-col">
                                            <button
                                                onClick={() => onEditPost(post)}
                                                className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                <Edit size={16} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
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
        </div>
    );
}