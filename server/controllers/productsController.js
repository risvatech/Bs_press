import { db } from "../db/sql.js";
import { products, productcategories } from "../db/schema.js";
import { eq, desc, and, not, sql } from "drizzle-orm";
import { deleteFile, deleteMultipleFiles } from "../middlewares/CoverImg.js";


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


// Helper function to process images with host
const processProductImages = (product, req) => {
    const processed = { ...product };

    if (processed.coverImage?.startsWith("/uploads/products/")) {
        processed.coverImage = `${req.protocol}://${req.get("host")}${processed.coverImage}`;
    }

    // Process multiple images
    if (Array.isArray(processed.images)) {
        processed.images = processed.images.map(img => {
            if (img.url && img.url.startsWith("/uploads/products/")) {
                return {
                    ...img,
                    url: `${req.protocol}://${req.get("host")}${img.url}`
                };
            }
            return img;
        });

        // If coverImage is not set but we have images, use the cover one
        if (!processed.coverImage && processed.images.length > 0) {
            const coverImageObj = processed.images.find(img => img.isCover);
            if (coverImageObj) {
                processed.coverImage = coverImageObj.url;
            } else {
                processed.coverImage = processed.images[0]?.url || null;
            }
        }
    }

    return processed;
};

// GET all products (with optional category filter)
export const getAllProducts = async (req, res) => {
    try {
        const { categoryId } = req.query;

        let query = db.select().from(products).orderBy(desc(products.createdAt));

        // Filter by category if provided
        if (categoryId) {
            query = query.where(eq(products.categoryId, Number(categoryId)));
        }

        const allProducts = await query;

        // Process images for each product
        const processedProducts = allProducts.map(product =>
            processProductImages(product, req)
        );

        res.json({ success: true, products: processedProducts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

// GET product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [product] = await db.select().from(products).where(eq(products.id, Number(id)));
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const processedProduct = processProductImages(product, req);

        res.json({ success: true, product: processedProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// CHECK slug availability
export const checkSlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const existing = await db.select().from(products).where(eq(products.slug, slug));
        res.json({ success: false, available: existing.length === 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// CREATE product
export const createProduct = async (req, res) => {
    const {
        title,
        slug,
        excerpt,
        content,
        status,
        coverImage,
        images,
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
        const existing = await db.select().from(products).where(eq(products.slug, slug));
        if (existing.length) {
            return res.status(400).json({ success: false, message: "Slug already exists" });
        }

        let coverImageUrl = coverImage || null;
        let processedImages = [];

        // Process multiple images
        if (images) {
            try {
                const imagesArray = Array.isArray(images) ? images : JSON.parse(images);

                // Mark first image with isCover as cover if not specified
                let hasCoverInImages = false;
                processedImages = imagesArray.map(img => {
                    const processedImg = {
                        url: img.url,
                        filename: img.filename || path.basename(img.url),
                        alt: img.alt || "",
                        isCover: img.isCover || false,
                        order: img.order || 0
                    };

                    // If this image is marked as cover, use it as coverImage
                    if (processedImg.isCover && !coverImageUrl) {
                        coverImageUrl = processedImg.url;
                        hasCoverInImages = true;
                    }

                    return processedImg;
                });

                // If no cover was specified but we have images, use the first one
                if (!coverImageUrl && processedImages.length > 0) {
                    coverImageUrl = processedImages[0].url;
                    processedImages[0].isCover = true;
                }

                // If coverImage is provided separately, find and mark it
                if (coverImageUrl && !hasCoverInImages) {
                    const coverImgIndex = processedImages.findIndex(img => img.url === coverImageUrl);
                    if (coverImgIndex !== -1) {
                        processedImages[coverImgIndex].isCover = true;
                    }
                }

                // Add host to URLs if needed
                processedImages = processedImages.map(img => {
                    if (img.url && img.url.startsWith("/uploads/products/")) {
                        return {
                            ...img,
                            url: `${req.protocol}://${req.get("host")}${img.url}`
                        };
                    }
                    return img;
                });


            } catch (err) {
                console.error("Error parsing images:", err);
                processedImages = [];
            }
        }

        // If coverImage is provided separately and not in images array
        if (coverImageUrl && coverImageUrl.startsWith("/uploads/products/")) {
            coverImageUrl = `${req.protocol}://${req.get("host")}${coverImageUrl}`;

            // If cover image is not in images array, add it
            if (!processedImages.find(img => img.url === coverImageUrl)) {
                processedImages.unshift({
                    url: coverImageUrl,
                    filename: path.basename(coverImageUrl),
                    alt: "Cover image",
                    isCover: true,
                    order: 0
                });
            }
        }

        // Process tags - convert to array if string
        let processedTags = tags;
        if (typeof tags === 'string') {
            processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        const [newProduct] = await db.insert(products).values({
            title,
            slug,
            excerpt: excerpt || "",
            content,
            status: status || "draft",
            coverImage: coverImageUrl,
            images: processedImages,
            description: description || "",
            tags: processedTags || [],
            metaTitle: metaTitle || "",
            metaKeywords: metaKeywords || "",
            metaDescription: metaDescription || "",
            categoryId: categoryId ? Number(categoryId) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        const processedProduct = processProductImages(newProduct, req);

        // ✅ ADD THIS LINE: Trigger sitemap update after post creation
        await triggerSitemapUpdate();

        res.status(201).json({
            success: true,
            product: processedProduct
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// UPDATE product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        slug,
        excerpt,
        content,
        status,
        description,
        tags,
        images,
        metaTitle,
        metaKeywords,
        metaDescription,
        categoryId
    } = req.body;

    if (!title || !slug || !content) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        // Check if product exists
        const [existingProduct] = await db.select().from(products).where(eq(products.id, Number(id)));
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check slug uniqueness
        const existingSlug = await db
            .select()
            .from(products)
            .where(and(eq(products.slug, slug), not(eq(products.id, Number(id)))));
        if (existingSlug.length) {
            return res.status(400).json({ success: false, message: "Slug already exists" });
        }

        let coverImageUrl = existingProduct.coverImage;
        let processedImages = existingProduct.images || [];

        // Handle new file upload
        if (req.file) {
            // Delete old file if exists
            if (existingProduct.coverImage) {
                deleteFile(existingProduct.coverImage);
            }

            // Construct full URL for new file
            const newCoverUrl = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;
            coverImageUrl = newCoverUrl;

            // Add to images array
            const newImage = {
                url: newCoverUrl,
                filename: req.file.filename,
                alt: "Cover image",
                isCover: true,
                order: 0
            };

            // Mark other images as not cover
            processedImages = processedImages.map(img => ({
                ...img,
                isCover: false
            }));

            processedImages.unshift(newImage);
        }

        // Process multiple images from request
        if (images !== undefined) {
            try {
                const imagesArray = Array.isArray(images) ? images : JSON.parse(images);

                // Find which image is marked as cover
                const coverImageObj = imagesArray.find(img => img.isCover);
                if (coverImageObj && coverImageObj.url) {
                    coverImageUrl = coverImageObj.url;

                    // Add host if needed
                    if (coverImageUrl.startsWith("/uploads/products/")) {
                        coverImageUrl = `${req.protocol}://${req.get("host")}${coverImageUrl}`;
                    }
                }

                // Process all images
                processedImages = imagesArray.map(img => {
                    let imageUrl = img.url;

                    // Add host if needed
                    if (imageUrl && imageUrl.startsWith("/uploads/products/")) {
                        imageUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;
                    }

                    return {
                        url: imageUrl,
                        filename: img.filename || path.basename(img.url),
                        alt: img.alt || "",
                        isCover: img.isCover || false,
                        order: img.order || 0
                    };
                });


            } catch (err) {
                console.error("Error parsing images:", err);
                // Keep existing images if parsing fails
            }
        }

        // Process tags - convert to array if string
        let processedTags = tags;
        if (typeof tags === 'string') {
            processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Update product
        const [updatedProduct] = await db
            .update(products)
            .set({
                title,
                slug,
                excerpt: excerpt || "",
                content,
                status: status || "draft",
                coverImage: coverImageUrl,
                images: processedImages,
                description: description || existingProduct.description || "",
                tags: processedTags !== undefined ? processedTags : existingProduct.tags,
                metaTitle: metaTitle || existingProduct.metaTitle || "",
                metaKeywords: metaKeywords || existingProduct.metaKeywords || "",
                metaDescription: metaDescription || existingProduct.metaDescription || "",
                categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : existingProduct.categoryId,
                updatedAt: new Date(),
            })
            .where(eq(products.id, Number(id)))
            .returning();

        const processedProduct = processProductImages(updatedProduct, req);

        // ✅ ADD THIS LINE: Trigger sitemap update after post creation
        await triggerSitemapUpdate();

        res.status(200).json({ success: true, product: processedProduct });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// DELETE product
export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const [deleted] = await db.delete(products).where(eq(products.id, Number(id))).returning();
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Delete associated cover image file
        if (deleted.coverImage) {
            deleteFile(deleted.coverImage);
        }

        // Delete all associated images
        if (Array.isArray(deleted.images) && deleted.images.length > 0) {
            const imageUrls = deleted.images.map(img => img.url).filter(url => url);
            if (imageUrls.length > 0) {
                deleteMultipleFiles(imageUrls);
            }
        }
        // ✅ ADD THIS LINE: Trigger sitemap update after post creation
        await triggerSitemapUpdate();

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /products/slug/:slug
export const getProductBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        const [product] = await db.select().from(products).where(eq(products.slug, slug));
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const processedProduct = processProductImages(product, req);

        res.json({ success: true, product: processedProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// SEARCH products by title or content
export const searchProducts = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ success: false, message: "Search query is required" });
    }

    try {
        const searchResults = await db
            .select()
            .from(products)
            .where(
                sql`${products.title} ILIKE ${'%' + q + '%'} OR ${products.content} ILIKE ${'%' + q + '%'}`
            )
            .orderBy(desc(products.createdAt));

        // Process images for each product
        const processedResults = searchResults.map(product =>
            processProductImages(product, req)
        );

        res.json({ success: true, products: processedResults });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET products by tag
export const getProductsByTag = async (req, res) => {
    const { tag } = req.params;

    try {
        const taggedProducts = await db
            .select()
            .from(products)
            .where(sql`${products.tags}::text ILIKE ${'%' + tag + '%'}`)
            .orderBy(desc(products.createdAt));

        // Process images for each product
        const processedResults = taggedProducts.map(product =>
            processProductImages(product, req)
        );

        res.json({ success: true, products: processedResults });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET products by category
export const getProductsByCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const categoryProducts = await db
            .select()
            .from(products)
            .where(eq(products.categoryId, Number(categoryId)))
            .orderBy(desc(products.createdAt));

        // Process images for each product
        const processedResults = categoryProducts.map(product =>
            processProductImages(product, req)
        );

        res.json({ success: true, products: processedResults });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};