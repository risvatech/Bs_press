import multer from "multer";
import path from "path";
import fs from "fs";

// Create multiple storage folders
const createStorageFolders = () => {
    const folders = [
        "uploads/posts",
        "uploads/products",
        "uploads/temp"
    ];

    folders.forEach(folder => {
        const folderPath = path.resolve(folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
    });
};

// Initialize folders
createStorageFolders();

// Multer storage config
const createStorage = (folder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const destPath = path.resolve(`uploads/${folder}`);
            cb(null, destPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname).toLowerCase();
            const name = path.basename(file.originalname, ext)
                .replace(/\s+/g, "-")
                .replace(/[^a-zA-Z0-9-]/g, "");
            cb(null, `${name}-${uniqueSuffix}${ext}`);
        },
    });
};

// Storage instances
const postStorage = createStorage("posts");
const productStorage = createStorage("products");

// Accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`), false);
    }
};

// Common multer configuration
const multerConfig = {
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
    }
};

// Export different upload configurations
export const upload = multer({
    ...multerConfig,
    storage: postStorage,
});

export const uploadProductImages = multer({
    ...multerConfig,
    storage: productStorage,
});

// Convenience methods
export const uploadSingle = multer({
    ...multerConfig,
    storage: postStorage,
}).single("image");

export const uploadMultiple = multer({
    ...multerConfig,
    storage: postStorage,
}).array("images", 10); // Max 10 files

export const uploadProductMultiple = multer({
    ...multerConfig,
    storage: productStorage,
}).array("images", 10); // Max 10 files for products

export const uploadProductSingle = multer({
    ...multerConfig,
    storage: productStorage,
}).single("image");

// Delete file helper
export const deleteFile = (filePath) => {
    if (!filePath) return false;

    try {
        // Extract filename from URL or path
        let filename;
        if (filePath.includes("/")) {
            filename = path.basename(filePath);
        } else {
            filename = filePath;
        }

        // Try to delete from multiple possible locations
        const possiblePaths = [
            path.resolve("uploads/posts", filename),
            path.resolve("uploads/products", filename),
            path.resolve("uploads/temp", filename),
            path.resolve(filename) // Absolute path
        ];

        for (const fullPath of possiblePaths) {
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("Error deleting file:", error);
        return false;
    }
};

// Delete multiple files helper
export const deleteMultipleFiles = (filePaths) => {
    if (!Array.isArray(filePaths)) return 0;

    let deletedCount = 0;
    filePaths.forEach(filePath => {
        if (deleteFile(filePath)) {
            deletedCount++;
        }
    });

    return deletedCount;
};