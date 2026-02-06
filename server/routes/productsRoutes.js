import express from "express";
import {
    uploadProductMultiple,
    uploadProductSingle
} from "../middlewares/CoverImg.js";
import {
    getAllProducts,
    getProductById,
    checkSlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductBySlug,
    searchProducts,
    getProductsByTag,
    getProductsByCategory
} from "../controllers/productsController.js";

const router = express.Router();

// ✅ Multiple image upload endpoint for products
router.post("/upload", uploadProductMultiple, (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No files uploaded"
        });
    }

    // Return array of file URLs with isCover flag
    const fileUrls = req.files.map((file, index) => ({
        url: `${req.protocol}://${req.get("host")}/api/uploads/products/${file.filename}`,
        path: `/uploads/products/${file.filename}`,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        isCover: index === 0, // First image is cover by default
        order: index
    }));

    res.json({
        success: true,
        message: `${req.files.length} file(s) uploaded successfully`,
        files: fileUrls,
        count: fileUrls.length
    });
});

// ✅ Single cover image upload (for backward compatibility)
router.post("/upload-cover", uploadProductSingle, (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    const fileData = {
        url: `${req.protocol}://${req.get("host")}/api/uploads/products/${req.file.filename}`,
        path: `/uploads/products/${req.file.filename}`,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        isCover: true
    };

    res.json({
        success: true,
        message: "Cover image uploaded successfully",
        file: fileData
    });
});

// CRUD routes
router.get("/", getAllProducts);
router.get("/check-slug/:slug", checkSlug);
router.get("/slug/:slug", getProductBySlug);
router.get("/search", searchProducts);
router.get("/tag/:tag", getProductsByTag);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;