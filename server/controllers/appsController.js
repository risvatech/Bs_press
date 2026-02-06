import { db } from "../db/sql.js";
import { apps } from "../db/schema.js";
import { eq, count, ilike, or, and } from "drizzle-orm";

export async function createApp(req, res) {
    const {
        title,
        description,
        shortDescription,
        seoSlug,
        thumbnailUrl,
        category,
        appType = "Web App",
        features = [],
        screenshots = [],
        demoUrl,
        downloadUrl,
        metaTitle,
        metaDescription,
        metaKeywords,
    } = req.body;

    // Validate required fields
    if (!title || !description || !shortDescription || !seoSlug || !thumbnailUrl || !category) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: title, description, shortDescription, seoSlug, thumbnailUrl, category"
        });
    }

    try {
        // Check if seoSlug already exists
        const existingSlug = await db
            .select()
            .from(apps)
            .where(eq(apps.seoSlug, seoSlug));

        if (existingSlug.length > 0) {
            return res.status(409).json({
                success: false,
                message: "SEO slug already exists, please choose another",
            });
        }

        // Validate arrays
        const validatedFeatures = Array.isArray(features) ? features : [];
        const validatedScreenshots = Array.isArray(screenshots) ? screenshots : [];

        // Insert into apps table
        const inserted = await db
            .insert(apps)
            .values({
                title,
                description,
                shortDescription,
                seoSlug,
                thumbnailUrl,
                category,
                appType,
                features: validatedFeatures,
                screenshots: validatedScreenshots,
                demoUrl,
                downloadUrl,
                metaTitle,
                metaDescription,
                metaKeywords,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        const newApp = inserted[0];

        return res.status(201).json({
            success: true,
            message: "App created successfully",
            data: newApp
        });
    } catch (error) {
        console.error("Create App Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function editApp(req, res) {
    const {
        appId, // required
        title,
        description,
        shortDescription,
        seoSlug,
        thumbnailUrl,
        category,
        appType,
        features,
        screenshots,
        demoUrl,
        downloadUrl,
        metaTitle,
        metaDescription,
        metaKeywords,
        isActive,
    } = req.body;

    if (!appId) {
        return res.status(400).json({
            success: false,
            message: "Missing appId"
        });
    }

    try {
        // Check if app exists
        const existingApp = await db
            .select()
            .from(apps)
            .where(eq(apps.id, appId))
            .limit(1);

        if (!existingApp.length) {
            return res.status(404).json({
                success: false,
                message: "App not found"
            });
        }

        // Build update payload
        const updatePayload = {
            updatedAt: new Date()
        };

        if (title !== undefined) updatePayload.title = title;
        if (description !== undefined) updatePayload.description = description;
        if (shortDescription !== undefined) updatePayload.shortDescription = shortDescription;
        if (thumbnailUrl !== undefined) updatePayload.thumbnailUrl = thumbnailUrl;
        if (category !== undefined) updatePayload.category = category;
        if (appType !== undefined) updatePayload.appType = appType;

        // Handle array fields
        if (features !== undefined) {
            updatePayload.features = Array.isArray(features) ? features : [];
        }
        if (screenshots !== undefined) {
            updatePayload.screenshots = Array.isArray(screenshots) ? screenshots : [];
        }

        if (demoUrl !== undefined) updatePayload.demoUrl = demoUrl;
        if (downloadUrl !== undefined) updatePayload.downloadUrl = downloadUrl;
        if (metaTitle !== undefined) updatePayload.metaTitle = metaTitle;
        if (metaDescription !== undefined) updatePayload.metaDescription = metaDescription;
        if (metaKeywords !== undefined) updatePayload.metaKeywords = metaKeywords;
        if (isActive !== undefined) updatePayload.isActive = isActive;

        // Check if new slug conflicts with existing apps (excluding current app)
        if (seoSlug !== undefined && seoSlug !== existingApp[0].seoSlug) {
            const existingSlug = await db
                .select()
                .from(apps)
                .where(eq(apps.seoSlug, seoSlug))
                .where(eq(apps.id, appId));

            if (existingSlug.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "SEO slug already exists, please choose another",
                });
            }
            updatePayload.seoSlug = seoSlug;
        }

        // Update the app
        const updated = await db
            .update(apps)
            .set(updatePayload)
            .where(eq(apps.id, appId))
            .returning();

        return res.status(200).json({
            success: true,
            message: "App updated successfully",
            data: updated[0]
        });
    } catch (error) {
        console.error("Edit App Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function deleteApp(req, res) {
    const appId = Number(req.params.id);

    if (!appId || isNaN(appId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid app ID"
        });
    }

    try {
        // Check if app exists
        const existingApp = await db
            .select()
            .from(apps)
            .where(eq(apps.id, appId))
            .limit(1);

        if (!existingApp.length) {
            return res.status(404).json({
                success: false,
                message: "App not found"
            });
        }

        const result = await db
            .delete(apps)
            .where(eq(apps.id, appId))
            .returning();

        return res.status(200).json({
            success: true,
            message: "App deleted successfully",
            data: result[0]
        });
    } catch (error) {
        console.error("Error deleting app:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function getAllApps(req, res) {
    try {
        const {
            category,
            appType,
            isActive = 'true',
            search,
            limit = 50,
            offset = 0
        } = req.query;

        // Build query
        let query = db.select().from(apps);

        // Apply filters
        const conditions = [];

        if (category) {
            conditions.push(eq(apps.category, category));
        }
        if (appType) {
            conditions.push(eq(apps.appType, appType));
        }
        if (isActive !== undefined) {
            conditions.push(eq(apps.isActive, isActive === 'true'));
        }
        if (search) {
            conditions.push(
                or(
                    ilike(apps.title, `%${search}%`),
                    ilike(apps.description, `%${search}%`),
                    ilike(apps.shortDescription, `%${search}%`),
                    ilike(apps.category, `%${search}%`)
                )
            );
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        // Apply pagination
        query = query
            .limit(Number(limit))
            .offset(Number(offset))
            .orderBy(apps.createdAt);

        const allApps = await query;

        // Get total count for pagination metadata
        const totalQuery = db.select({ count: count() }).from(apps);
        if (conditions.length > 0) {
            totalQuery.where(and(...conditions));
        }
        const totalResult = await totalQuery;
        const total = totalResult[0]?.count || 0;

        return res.status(200).json({
            success: true,
            data: allApps,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset),
                pageCount: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error("Error fetching apps:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function getAppBySlug(req, res) {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Slug is required"
            });
        }

        const result = await db
            .select()
            .from(apps)
            .where(eq(apps.seoSlug, slug))
            .limit(1);

        const app = result[0];

        if (!app) {
            return res.status(404).json({
                success: false,
                message: "App not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: app
        });
    } catch (error) {
        console.error("Error fetching app by slug:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function getAppById(req, res) {
    try {
        const { id } = req.params;
        const appId = Number(id);

        if (!appId || isNaN(appId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid app ID"
            });
        }

        const result = await db
            .select()
            .from(apps)
            .where(eq(apps.id, appId))
            .limit(1);

        const app = result[0];

        if (!app) {
            return res.status(404).json({
                success: false,
                message: "App not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: app
        });
    } catch (error) {
        console.error("Error fetching app by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function getFeaturedApps(req, res) {
    try {
        const featuredApps = await db
            .select()
            .from(apps)
            .where(eq(apps.isActive, true))
            .orderBy(apps.createdAt)
            .limit(6);

        return res.status(200).json({
            success: true,
            data: featuredApps
        });
    } catch (error) {
        console.error("Error fetching featured apps:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function getCategories(req, res) {
    try {
        const categories = await db
            .select({
                category: apps.category,
                count: count()
            })
            .from(apps)
            .where(eq(apps.isActive, true))
            .groupBy(apps.category)
            .orderBy(apps.category);

        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function getAppTypes(req, res) {
    try {
        const appTypes = await db
            .select({
                appType: apps.appType,
                count: count()
            })
            .from(apps)
            .where(eq(apps.isActive, true))
            .groupBy(apps.appType)
            .orderBy(apps.appType);

        return res.status(200).json({
            success: true,
            data: appTypes
        });
    } catch (error) {
        console.error("Error fetching app types:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export async function bulkUpdateApps(req, res) {
    try {
        const { appIds, updates } = req.body;

        if (!Array.isArray(appIds) || appIds.length === 0 || !updates) {
            return res.status(400).json({
                success: false,
                message: "appIds array and updates object are required"
            });
        }

        const updatePayload = {
            updatedAt: new Date(),
            ...updates
        };

        // Remove id from updates if present
        delete updatePayload.id;
        delete updatePayload.seoSlug; // Prevent bulk slug updates

        const updatedApps = await Promise.all(
            appIds.map(async (appId) => {
                const updated = await db
                    .update(apps)
                    .set(updatePayload)
                    .where(eq(apps.id, appId))
                    .returning();
                return updated[0];
            })
        );

        return res.status(200).json({
            success: true,
            message: `Updated ${updatedApps.filter(Boolean).length} apps`,
            data: updatedApps.filter(Boolean)
        });
    } catch (error) {
        console.error("Error bulk updating apps:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}