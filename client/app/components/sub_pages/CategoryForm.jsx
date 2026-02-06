"use client";
import React, { useState, useEffect } from "react";

function CategoryForm({ addCategory, updateCategory, editCategory }) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (editCategory) {
            setName(editCategory.name);
        }
    }, [editCategory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editCategory) {
            updateCategory(editCategory.id, name);
        } else {
            addCategory(name);
        }
        setName("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex gap-2 mb-6 items-center"
        >
            <input
                type="text"
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
            <button
                type="submit"
                className={`px-4 py-2 text-sm rounded-md text-white font-medium transition-colors ${
                    editCategory
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {editCategory ? "Update" : "Add"}
            </button>
        </form>
    );
}

export default CategoryForm;
