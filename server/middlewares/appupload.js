// middlewares/appupload.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), "uploads");

// Create uploads folder structure if not exists
const postsUploadPath = path.join(uploadPath, "posts");
if (!fs.existsSync(postsUploadPath)) {
    fs.mkdirSync(postsUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, postsUploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        // Keep the original filename or use a custom prefix
        const originalName = path.parse(file.originalname).name;
        const safeName = originalName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        cb(null, `${safeName}-${uniqueSuffix}${extension}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    }
});

// Upload route
router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // Get the host dynamically from the request
    const protocol = req.protocol; // http or https
    const host = req.get('host'); // localhost:5002 or yourdomain.com

    // Construct the full URL dynamically
    const baseUrl = `${protocol}://${host}`;
    const fileUrl = `${baseUrl}/api/uploads/posts/${req.file.filename}`;

    console.log("Upload details:", {
        protocol,
        host,
        baseUrl,
        fileUrl,
        filePath: req.file.path,
        filename: req.file.filename
    });

    res.json({
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
    });
});

export default router;