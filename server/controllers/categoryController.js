import { eq } from "drizzle-orm";
import { db } from "../db/sql.js";
import { categories } from "../db/schema.js";

/** ✅ Get all categories */
export const getCategories = async (req, res) => {
    try {
        const result = await db.select().from(categories);
        res.json(result);
    } catch (err) {
        console.error("❌ Error fetching categories:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/** ✅ Create a new category */
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const [newCat] = await db.insert(categories).values({ name }).returning();
        res.status(201).json(newCat);
    } catch (err) {
        console.error("❌ Error creating category:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/** ✅ Update category */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const [updated] = await db
            .update(categories)
            .set({ name })
            .where(eq(categories.id, Number(id)))
            .returning();

        if (!updated) return res.status(404).json({ message: "Category not found" });
        res.json(updated);
    } catch (err) {
        console.error("❌ Error updating category:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/** ✅ Delete category */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const [deleted] = await db
            .delete(categories)
            .where(eq(categories.id, Number(id)))
            .returning();

        if (!deleted) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category deleted" });
    } catch (err) {
        console.error("❌ Error deleting category:", err);
        res.status(500).json({ message: "Server error" });
    }
};
