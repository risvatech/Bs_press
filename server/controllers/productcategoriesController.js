import { db } from "../db/sql.js";
import { productcategories, products } from "../db/schema.js"; // Import both at the top
import { eq } from "drizzle-orm";

// GET all product categories
export const getAllProductCategories = async (req, res) => {
    try {
        const allCategories = await db.select().from(productcategories);
        res.json({ success: true, categories: allCategories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch product categories" });
    }
};

// GET product category by ID
export const getProductCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const [category] = await db.select().from(productcategories).where(eq(productcategories.id, Number(id)));
        if (!category) return res.status(404).json({ success: false, message: "Product category not found" });
        res.json({ success: true, category });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// CREATE product category
export const createProductCategory = async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    try {
        // Check if category with same name already exists
        const existing = await db
            .select()
            .from(productcategories)
            .where(eq(productcategories.name, name.trim()));

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Category with this name already exists" });
        }

        const [newCategory] = await db
            .insert(productcategories)
            .values({
                name: name.trim(),
            })
            .returning();

        res.status(201).json({ success: true, category: newCategory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// UPDATE product category
export const updateProductCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    try {
        // Check if category exists
        const [existingCategory] = await db
            .select()
            .from(productcategories)
            .where(eq(productcategories.id, Number(id)));

        if (!existingCategory) {
            return res.status(404).json({ success: false, message: "Product category not found" });
        }

        // Check if another category with same name already exists
        const duplicateName = await db
            .select()
            .from(productcategories)
            .where(eq(productcategories.name, name.trim()));

        // If there's a duplicate that's NOT the current category being updated
        if (duplicateName.length > 0 && duplicateName[0].id !== Number(id)) {
            return res.status(400).json({ success: false, message: "Category with this name already exists" });
        }

        const [updatedCategory] = await db
            .update(productcategories)
            .set({
                name: name.trim(),
            })
            .where(eq(productcategories.id, Number(id)))
            .returning();

        res.json({ success: true, category: updatedCategory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE product category
export const deleteProductCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if category exists
        const [existingCategory] = await db
            .select()
            .from(productcategories)
            .where(eq(productcategories.id, Number(id)));

        if (!existingCategory) {
            return res.status(404).json({ success: false, message: "Product category not found" });
        }

        // Check if any products are using this category
        // Products is already imported at the top
        const productsUsingCategory = await db
            .select()
            .from(products)
            .where(eq(products.categoryId, Number(id)));

        if (productsUsingCategory.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category. There are products assigned to this category."
            });
        }

        await db.delete(productcategories).where(eq(productcategories.id, Number(id)));
        res.json({ success: true, message: "Product category deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};