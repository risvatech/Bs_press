import express from "express";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    // Full image URL with server host
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

export default router;
