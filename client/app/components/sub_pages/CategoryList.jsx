import React from "react";

function CategoryList({ categories, setEditCategory, deleteCategory }) {
    return (
        <ul className="space-y-2">
            {categories.map((cat) => (
                <li
                    key={cat.id}
                    className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                >
                    <span className="text-gray-700">{cat.name}</span>
                    <div className="space-x-2">
                        <button
                            onClick={() => setEditCategory(cat)}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteCategory(cat.id)}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-blue-200"
                        >
                            Delete
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default CategoryList;
