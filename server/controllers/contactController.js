import { db } from "../db/sql.js";
import { contactMessages } from "../db/schema.js";
import {eq, desc, and, or, like, sql} from "drizzle-orm";

// ✅ Get all messages with filters (Admin)
export const getAllMessages = async (req, res) => {
    try {
        const {
            status,
            search,
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build conditions
        let conditions = [];

        if (status && status !== "all") {
            conditions.push(eq(contactMessages.status, status));
        }

        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push(
                or(
                    like(contactMessages.name, searchTerm),
                    like(contactMessages.email, searchTerm),
                    like(contactMessages.company_name, searchTerm), // Add this line
                    like(contactMessages.message, searchTerm)
                )
            );
        }

        // Get total count
        let countQuery = db.select({ count: sql`count(*)` }).from(contactMessages);
        if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions));
        }
        const countResult = await countQuery;
        const total = parseInt(countResult[0]?.count || 0);

        // Get paginated results
        let query = db.select().from(contactMessages);

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        // Apply sorting
        const orderByColumn = contactMessages[sortBy] || contactMessages.createdAt;
        const orderBy = sortOrder === "desc" ? desc(orderByColumn) : orderByColumn;

        const messages = await query
            .orderBy(orderBy)
            .limit(parseInt(limit))
            .offset(offset);

        res.json({
            success: true,
            data: messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch messages"
        });
    }
};

// ✅ Get single message by ID
export const getMessageById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid message ID"
            });
        }

        const [message] = await db
            .select()
            .from(contactMessages)
            .where(eq(contactMessages.id, id));

        if (!message) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        res.json({
            success: true,
            data: message,
        });

    } catch (error) {
        console.error("Error fetching message:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch message"
        });
    }
};

// ✅ Create a new message (Public)
export const createMessage = async (req, res) => {
    try {
        const { name, email, phone, message, company_name } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                error: "Name is required"
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                error: "Email is required"
            });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }

        const [newMsg] = await db
            .insert(contactMessages)
            .values({
                name: name.trim(),
                email: email.trim(),
                company_name: company_name ? company_name.trim() : null, // Add this line
                phone: phone ? phone.trim() : null,
                message: message.trim(),
                status: "unread",
            })
            .returning();

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMsg,
        });

    } catch (error) {
        console.error("Error creating message:", error);

        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                error: "Duplicate entry"
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to send message"
        });
    }
};

// ✅ Update message status (Admin)
export const updateMessageStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid message ID"
            });
        }

        // Validate status
        const validStatuses = ["unread", "read", "replied", "archived", "spam"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        const [updatedMessage] = await db
            .update(contactMessages)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(contactMessages.id, id))
            .returning();

        if (!updatedMessage) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        res.json({
            success: true,
            message: "Status updated successfully",
            data: updatedMessage,
        });

    } catch (error) {
        console.error("Error updating message status:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update message status"
        });
    }
};

// ✅ Delete a message (Admin)
export const deleteMessage = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid message ID"
            });
        }

        const [deleted] = await db
            .delete(contactMessages)
            .where(eq(contactMessages.id, id))
            .returning();

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        res.json({
            success: true,
            message: "Message deleted successfully",
            data: deleted,
        });

    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete message"
        });
    }
};

// ✅ Get message statistics
export const getMessageStats = async (req, res) => {
    try {
        // Get total count
        const [totalResult] = await db
            .select({ count: sql`count(*)` })
            .from(contactMessages);

        // Get count by status
        const statusStats = await db
            .select({
                status: contactMessages.status,
                count: sql`count(*)`,
            })
            .from(contactMessages)
            .groupBy(contactMessages.status);

        // Get recent messages (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentMessages = await db
            .select({
                id: contactMessages.id,
                name: contactMessages.name,
                email: contactMessages.email,
                status: contactMessages.status,
                createdAt: contactMessages.createdAt,
            })
            .from(contactMessages)
            .where(sql`${contactMessages.createdAt} > ${weekAgo}`)
            .orderBy(desc(contactMessages.createdAt))
            .limit(10);

        // Get today's messages
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [todayResult] = await db
            .select({ count: sql`count(*)` })
            .from(contactMessages)
            .where(sql`${contactMessages.createdAt} >= ${today}`);

        res.json({
            success: true,
            data: {
                total: parseInt(totalResult?.count || 0),
                today: parseInt(todayResult?.count || 0),
                statusStats,
                recentMessages,
            },
        });

    } catch (error) {
        console.error("Error getting message stats:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get message statistics"
        });
    }
};