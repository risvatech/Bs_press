// controllers/postsController.js
import { db } from "../db/sql.js";
import { posts } from "../db/schema.js";
import { eq, desc, and, not, sql } from "drizzle-orm";
import { deleteFile } from "../middlewares/CoverImg.js";

// ✅ ADD THIS HELPER FUNCTION AT THE TOP
const triggerSitemapUpdate = async () => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const secret = process.env.REVALIDATION_SECRET || 'fd9e864ffc391c7a0cc417357918d811a61eeee04afb3300081d4da1ce652b46';

        console.log(`🔄 Triggering sitemap update to: ${frontendUrl}/revalidate?tag=sitemap`);

        // Note: Changed from /api/revalidate to /revalidate
        const response = await fetch(`${frontendUrl}/revalidate?tag=sitemap`, {
            method: 'POST',
            headers: {
                'x-revalidate-secret': secret,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('✅ Sitemap update triggered successfully');
        } else {
            const errorText = await response.text();
            console.log('⚠️ Sitemap update failed with status:', response.status, errorText);
        }
    } catch (error) {
        console.log('⚠️ Sitemap update webhook failed:', error.message);
    }
};

// GET all posts (with optional category filter)
export const getAllPosts = async (req, res) => {
    try {
        const { categoryId } = req.query;

        let query = db.select().from(posts).orderBy(desc(posts.createdAt));

        // Filter by category if provided
        if (categoryId) {
            query = query.where(eq(posts.categoryId, Number(categoryId)));
        }

        const allPosts = await query;
        res.json({ success: true, posts: allPosts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch posts" });
    }
};

// GET post by ID
export const getPostById = async (req, res) => {
    const { id } = req.params;
    try {
        const [post] = await db.select().from(posts).where(eq(posts.id, Number(id)));
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });
        res.json({ success: true, post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// CHECK slug availability
export const checkSlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const existing = await db.select().from(posts).where(eq(posts.slug, slug));
        res.json({ success: true, available: existing.length === 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// CREATE post
export const createPost = async (req, res) => {
    const {
        title,
        slug,
        excerpt,
        content,
        status,
        coverImage,
        description,
        tags,
        metaTitle,
        metaKeywords,
        metaDescription,

        categoryId
    } = req.body;

    if (!title || !slug || !content) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const existing = await db.select().from(posts).where(eq(posts.slug, slug));
        if (existing.length) {
            return res.status(400).json({ success: false, message: "Slug already exists" });
        }

        let coverImageUrl = coverImage || null;

        // ✅ If coverImage is a relative path, prepend host
        if (coverImageUrl && coverImageUrl.startsWith("/api/uploads/posts/")) {
            coverImageUrl = `${req.protocol}://${req.get("host")}${coverImageUrl}`;
        }

        // Process tags - convert to array if string
        let processedTags = tags;
        if (typeof tags === 'string') {
            processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        const [newPost] = await db.insert(posts).values({
            title,
            slug,
            excerpt: excerpt || "",
            content,
            status: status || "draft",
            coverImage: coverImageUrl,
            description: description || "",
            tags: processedTags || [],
            metaTitle: metaTitle || "",
            metaKeywords: metaKeywords || "",
            metaDescription: metaDescription || "",
            categoryId: categoryId ? Number(categoryId) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // ✅ ADD THIS LINE: Trigger sitemap update after post creation
        await triggerSitemapUpdate();

        res.status(201).json({ success: true, post: newPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// UPDATE post
export const updatePost = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        slug,
        excerpt,
        content,
        status,
        description,
        tags,
        metaTitle,
        metaKeywords,
        metaDescription,
        categoryId
    } = req.body;

    if (!title || !slug || !content) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        // Check if post exists
        const [existingPost] = await db.select().from(posts).where(eq(posts.id, Number(id)));
        if (!existingPost) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Check slug uniqueness
        const existingSlug = await db
            .select()
            .from(posts)
            .where(and(eq(posts.slug, slug), not(eq(posts.id, Number(id)))));
        if (existingSlug.length) {
            return res.status(400).json({ success: false, message: "Slug already exists" });
        }

        let coverImageUrl = existingPost.coverImage;

        // Handle new file upload
        if (req.file) {
            // Delete old file if exists
            if (existingPost.coverImage) {
                deleteFile(existingPost.coverImage);
            }

            // Construct full URL for new file
            coverImageUrl = `${req.protocol}://${req.get("host")}/api/coveruploads/${req.file.filename}`;
        } else if (req.body.coverImage) {
            // If body has coverImage (relative path), prepend host if needed
            coverImageUrl = req.body.coverImage.startsWith("http")
                ? req.body.coverImage
                : `${req.protocol}://${req.get("host")}${req.body.coverImage}`;
        }

        // Process tags - convert to array if string
        let processedTags = tags;
        if (typeof tags === 'string') {
            processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Update post
        const [updatedPost] = await db
            .update(posts)
            .set({
                title,
                slug,
                excerpt: excerpt || "",
                content,
                status: status || "draft",
                coverImage: coverImageUrl,
                description: description || existingPost.description || "",
                tags: processedTags !== undefined ? processedTags : existingPost.tags,
                metaTitle: metaTitle || existingPost.metaTitle || "",
                metaKeywords: metaKeywords || existingPost.metaKeywords || "",
                metaDescription: metaDescription || existingPost.metaDescription || "",
                categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : existingPost.categoryId,
                updatedAt: new Date(),
            })
            .where(eq(posts.id, Number(id)))
            .returning();

        // ✅ ADD THIS LINE: Trigger sitemap update after post update
        await triggerSitemapUpdate();

        res.status(200).json({ success: true, post: updatedPost });
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE post
export const deletePost = async (req, res) => {
    const { id } = req.params;

    try {
        const [deleted] = await db.delete(posts).where(eq(posts.id, Number(id))).returning();
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Delete associated cover image file
        if (deleted.coverImage) {
            deleteFile(deleted.coverImage);
        }

        // ✅ ADD THIS LINE: Trigger sitemap update after post deletion (optional)
        await triggerSitemapUpdate();

        res.json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /posts/slug/:slug
export const getPostBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        // prepend host to coverImage if needed
        if (post.coverImage?.startsWith("/api/uploads/posts/")) {
            post.coverImage = `${req.protocol}://${req.get("host")}${post.coverImage}`;
        }

        res.json({ success: true, post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// SEARCH posts by title or content
export const searchPosts = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ success: false, message: "Search query is required" });
    }

    try {
        const searchResults = await db
            .select()
            .from(posts)
            .where(
                sql`${posts.title} ILIKE ${'%' + q + '%'} OR ${posts.content} ILIKE ${'%' + q + '%'}`
            )
            .orderBy(desc(posts.createdAt));

        res.json({ success: true, posts: searchResults });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET posts by tag
export const getPostsByTag = async (req, res) => {
    const { tag } = req.params;

    try {
        const taggedPosts = await db
            .select()
            .from(posts)
            .where(sql`${posts.tags}::text ILIKE ${'%' + tag + '%'}`)
            .orderBy(desc(posts.createdAt));

        res.json({ success: true, posts: taggedPosts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET posts by category
export const getPostsByCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const categoryPosts = await db
            .select()
            .from(posts)
            .where(eq(posts.categoryId, Number(categoryId)))
            .orderBy(desc(posts.createdAt));

        res.json({ success: true, posts: categoryPosts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};