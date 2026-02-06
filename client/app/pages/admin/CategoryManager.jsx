"use client";
import React, { useState, useEffect } from "react";
import api from "../../service/api";

function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [editCategory, setEditCategory] = useState(null);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get("/categories");
            setCategories(res.data);
            setError("");
        } catch (err) {
            setError("Failed to fetch categories");
            console.error("Failed to fetch categories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Reset form
    const resetForm = () => {
        setName("");
        setEditCategory(null);
        setError("");
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Category name is required");
            return;
        }

        try {
            setLoading(true);
            if (editCategory) {
                await api.put(`/categories/${editCategory.id}`, { name: name.trim() });
            } else {
                await api.post("/categories", { name: name.trim() });
            }
            resetForm();
            fetchCategories();
        } catch (err) {
            setError(editCategory ? "Failed to update category" : "Failed to add category");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Delete category
    const deleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) {
            return;
        }

        try {
            await api.delete(`/categories/${id}`);
            setCategories((prev) => prev.filter((cat) => cat.id !== id));
        } catch (err) {
            setError("Failed to delete category");
            console.error("Failed to delete category:", err);
        }
    };

    // Start editing a category
    const startEdit = (category) => {
        setEditCategory(category);
        setName(category.name);
    };

    // Cancel edit
    const cancelEdit = () => {
        resetForm();
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Category Management</h1>
                <p className="text-gray-600">Add, edit, or remove categories from your system.</p>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {editCategory ? "Edit Category" : "Add New Category"}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
                        </label>
                        <input
                            id="categoryName"
                            type="text"
                            placeholder="Enter category name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                loading || !name.trim()
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : editCategory
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : editCategory ? (
                                "Update Category"
                            ) : (
                                "Add Category"
                            )}
                        </button>

                        {editCategory && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Categories List Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Existing Categories</h2>
                </div>

                {loading && categories.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                        </div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <p className="text-gray-500 mb-1">No categories found</p>
                        <p className="text-sm text-gray-400">Add your first category using the form above</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                    <span className="text-gray-800 font-medium">{category.name}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(category)}
                                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(category.id)}
                                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryManager;