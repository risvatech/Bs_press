import { db } from '../db/sql.js';
import { projectInquiries } from '../db/schema.js';
import { eq, desc, sql, and, or, like } from 'drizzle-orm';

// Create new project inquiry
export const createProjectInquiry = async (req, res) => {
    try {
        const {
            name,
            email,
            company,
            phone,
            description,
            projectType,
            selectedFeatures,
            budgetRange,
            timeline,
        } = req.body;

        // Basic validation
        const errors = [];

        if (!name || name.trim().length < 2) {
            errors.push("Name must be at least 2 characters");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push("Invalid email format");
        }

        if (!description || description.trim().length < 10) {
            errors.push("Description must be at least 10 characters");
        }

        if (!projectType) errors.push("Project type is required");
        if (!budgetRange) errors.push("Budget range is required");
        if (!timeline) errors.push("Timeline is required");

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors,
            });
        }

        // Create the inquiry
        const [newInquiry] = await db
            .insert(projectInquiries)
            .values({
                name: name.trim(),
                email: email.trim(),
                company: company ? company.trim() : null,
                phone: phone ? phone.trim() : null,
                description: description.trim(),
                projectType,
                selectedFeatures: Array.isArray(selectedFeatures) ? selectedFeatures : [],
                budgetRange,
                timeline,
                status: 'new'
            })
            .returning();

        res.status(201).json({
            success: true,
            message: "Project inquiry submitted successfully!",
            data: newInquiry,
        });

    } catch (error) {
        console.error("Error creating project inquiry:", error);

        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({
                success: false,
                message: "Duplicate entry",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create project inquiry",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Get all project inquiries (with pagination and filters)
export const getProjectInquiries = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            projectType,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where conditions
        const conditions = [];

        if (status && status !== 'all') {
            conditions.push(eq(projectInquiries.status, status));
        }

        if (projectType && projectType !== 'all') {
            conditions.push(eq(projectInquiries.projectType, projectType));
        }

        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push(
                or(
                    like(projectInquiries.name, searchTerm),
                    like(projectInquiries.email, searchTerm),
                    like(projectInquiries.company, searchTerm)
                )
            );
        }

        // Get total count
        const [countResult] = await db
            .select({ count: sql`count(*)` })
            .from(projectInquiries)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = parseInt(countResult.count);

        // Get paginated results
        const results = await db
            .select()
            .from(projectInquiries)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(
                sortOrder === 'desc'
                    ? desc(projectInquiries[sortBy])
                    : projectInquiries[sortBy]
            )
            .limit(parseInt(limit))
            .offset(offset);

        res.status(200).json({
            success: true,
            data: results,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });

    } catch (error) {
        console.error("Error fetching project inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch project inquiries",
        });
    }
};

// Get single project inquiry by ID
export const getProjectInquiryById = async (req, res) => {
    try {
        const { id } = req.params;

        const [inquiry] = await db
            .select()
            .from(projectInquiries)
            .where(eq(projectInquiries.id, parseInt(id)));

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Project inquiry not found",
            });
        }

        res.status(200).json({
            success: true,
            data: inquiry,
        });

    } catch (error) {
        console.error("Error fetching project inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch project inquiry",
        });
    }
};

// Update project inquiry status
export const updateProjectInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['new', 'contacted', 'in_progress', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const [updatedInquiry] = await db
            .update(projectInquiries)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(projectInquiries.id, parseInt(id)))
            .returning();

        if (!updatedInquiry) {
            return res.status(404).json({
                success: false,
                message: "Project inquiry not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: updatedInquiry,
        });

    } catch (error) {
        console.error("Error updating project inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update project inquiry",
        });
    }
};

// Delete project inquiry
export const deleteProjectInquiry = async (req, res) => {
    try {
        const { id } = req.params;

        const [deletedInquiry] = await db
            .delete(projectInquiries)
            .where(eq(projectInquiries.id, parseInt(id)))
            .returning();

        if (!deletedInquiry) {
            return res.status(404).json({
                success: false,
                message: "Project inquiry not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Project inquiry deleted successfully",
            data: deletedInquiry,
        });

    } catch (error) {
        console.error("Error deleting project inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete project inquiry",
        });
    }
};

// Get project inquiry statistics
export const getProjectInquiryStats = async (req, res) => {
    try {
        // Get total count
        const [totalResult] = await db
            .select({ count: sql`count(*)` })
            .from(projectInquiries);

        // Get count by status
        const statusStats = await db
            .select({
                status: projectInquiries.status,
                count: sql`count(*)`,
            })
            .from(projectInquiries)
            .groupBy(projectInquiries.status);

        // Get count by project type
        const typeStats = await db
            .select({
                projectType: projectInquiries.projectType,
                count: sql`count(*)`,
            })
            .from(projectInquiries)
            .groupBy(projectInquiries.projectType);

        // Get count by budget range
        const budgetStats = await db
            .select({
                budgetRange: projectInquiries.budgetRange,
                count: sql`count(*)`,
            })
            .from(projectInquiries)
            .groupBy(projectInquiries.budgetRange);

        // Get recent inquiries (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentInquiries = await db
            .select({
                id: projectInquiries.id,
                name: projectInquiries.name,
                email: projectInquiries.email,
                projectType: projectInquiries.projectType,
                status: projectInquiries.status,
                createdAt: projectInquiries.createdAt,
            })
            .from(projectInquiries)
            .where(sql`${projectInquiries.createdAt} > ${weekAgo}`)
            .orderBy(desc(projectInquiries.createdAt))
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                total: parseInt(totalResult.count),
                statusStats,
                typeStats,
                budgetStats,
                recentInquiries,
            },
        });

    } catch (error) {
        console.error("Error getting project inquiry stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get project inquiry statistics",
        });
    }
};