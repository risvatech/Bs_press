import express from "express";
import {
    getAllMessages,
    getMessageById,
    createMessage,
    updateMessageStatus,
    deleteMessage,
    getMessageStats, // Add this
} from "../controllers/contactController.js";

const router = express.Router();

// Public route to create message
router.post("/", createMessage);

// Admin routes
router.get("/", getAllMessages);
router.get("/stats", getMessageStats); // Add stats route
router.get("/:id", getMessageById);
router.patch("/:id/status", updateMessageStatus);
router.delete("/:id", deleteMessage);

export default router;