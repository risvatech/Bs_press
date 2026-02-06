import express from "express";
import {
    getAllProductCategories,
    getProductCategoryById,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory
} from "../controllers/productcategoriesController.js";

const router = express.Router();

// GET all product categories
router.get("/", getAllProductCategories);

// GET product category by ID
router.get("/:id", getProductCategoryById);

// CREATE product category
router.post("/", createProductCategory);

// UPDATE product category
router.put("/:id", updateProductCategory);

// DELETE product category
router.delete("/:id", deleteProductCategory);

export default router;