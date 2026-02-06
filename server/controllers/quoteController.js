import { db } from '../db/sql.js'; // Adjust path to your db connection
import { quotes } from '../db/schema.js'; // Adjust to your schema file
import { eq, desc, like, and, or, between, count } from 'drizzle-orm';

export const quoteController = {
    // Create a new quote
    async createQuote(req, res) {
        try {
            console.log('📥 Received quote request:', req.body);

            // Validate required fields
            const requiredFields = ['name', 'email', 'phone', 'projectType', 'budget'];
            const missingFields = requiredFields.filter(field => !req.body[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(req.body.email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Prepare quote data
            const quoteData = {
                name: req.body.name.trim(),
                company: req.body.company?.trim() || '',
                email: req.body.email.trim().toLowerCase(),
                phone: req.body.phone.trim(),
                country: req.body.country?.trim() || 'India',
                state: req.body.state?.trim() || '',
                city: req.body.city?.trim() || '',
                projectType: req.body.projectType.trim(),
                productType: req.body.productType?.trim() || null,
                quantity: req.body.quantity?.trim() || null,
                deliveryDate: req.body.deliveryDate?.trim() || null,
                budget: req.body.budget.trim(),
                additionalRequirements: req.body.additionalRequirements?.trim() || null,
                quoteReference: req.body.quoteReference?.trim() || `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                source: req.body.source?.trim() || 'website',
                status: 'pending'
            };

            // Insert into database
            const [newQuote] = await db.insert(quotes)
                .values(quoteData)
                .returning();

            console.log('✅ Quote created with ID:', newQuote.id);

            res.status(201).json({
                success: true,
                message: 'Quote request submitted successfully! We will contact you soon.',
                data: {
                    id: newQuote.id,
                    quoteReference: newQuote.quoteReference,
                    name: newQuote.name,
                    email: newQuote.email,
                    status: newQuote.status,
                    createdAt: newQuote.createdAt
                }
            });

        } catch (error) {
            console.error('❌ Create quote error:', error);

            // Handle duplicate email/quote reference
            if (error.code === '23505') { // PostgreSQL unique violation
                return res.status(400).json({
                    success: false,
                    message: 'A quote with this email or reference already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to submit quote request. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get all quotes (Admin)
    async getAllQuotes(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                search,
                startDate,
                endDate,
                projectType,
                country,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            // Parse pagination
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100
            const offset = (pageNum - 1) * limitNum;

            // Build filters
            const conditions = [];

            if (status && ['pending', 'contacted', 'quoted', 'closed'].includes(status)) {
                conditions.push(eq(quotes.status, status));
            }

            if (projectType) {
                conditions.push(eq(quotes.projectType, projectType));
            }

            if (country) {
                conditions.push(eq(quotes.country, country));
            }

            if (search) {
                const searchTerm = `%${search}%`;
                conditions.push(
                    or(
                        like(quotes.name, searchTerm),
                        like(quotes.email, searchTerm),
                        like(quotes.company, searchTerm),
                        like(quotes.phone, searchTerm),
                        like(quotes.quoteReference, searchTerm)
                    )
                );
            }

            if (startDate && endDate) {
                conditions.push(
                    between(quotes.createdAt, new Date(startDate), new Date(endDate))
                );
            }

            // Get total count
            const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
            const [{ total }] = await db.select({ total: count() }).from(quotes).where(whereClause);

            // Get quotes with pagination
            let query = db.select().from(quotes);

            if (whereClause) {
                query = query.where(whereClause);
            }

            // Apply sorting
            const orderField = quotes[sortBy] || quotes.createdAt;
            const sortedQuery = sortOrder === 'asc'
                ? query.orderBy(orderField)
                : query.orderBy(desc(orderField));

            const quotesList = await sortedQuery.limit(limitNum).offset(offset);

            res.json({
                success: true,
                data: quotesList,
                pagination: {
                    total: Number(total),
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum)
                }
            });

        } catch (error) {
            console.error('❌ Get all quotes error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch quotes',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get single quote by ID
    async getQuoteById(req, res) {
        try {
            const { id } = req.params;

            const [quote] = await db.select()
                .from(quotes)
                .where(eq(quotes.id, parseInt(id)));

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    message: 'Quote not found'
                });
            }

            res.json({
                success: true,
                data: quote
            });

        } catch (error) {
            console.error('❌ Get quote error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch quote',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Update quote status
    async updateQuoteStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate status
            const validStatuses = ['pending', 'contacted', 'quoted', 'closed'];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }

            const [updatedQuote] = await db.update(quotes)
                .set({
                    status,
                    updatedAt: new Date()
                })
                .where(eq(quotes.id, parseInt(id)))
                .returning();

            if (!updatedQuote) {
                return res.status(404).json({
                    success: false,
                    message: 'Quote not found'
                });
            }

            res.json({
                success: true,
                message: `Quote status updated to ${status}`,
                data: updatedQuote
            });

        } catch (error) {
            console.error('❌ Update status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update quote status',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Update quote details
    async updateQuote(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Remove fields that shouldn't be updated
            delete updateData.id;
            delete updateData.createdAt;

            // Always update timestamp
            updateData.updatedAt = new Date();

            const [updatedQuote] = await db.update(quotes)
                .set(updateData)
                .where(eq(quotes.id, parseInt(id)))
                .returning();

            if (!updatedQuote) {
                return res.status(404).json({
                    success: false,
                    message: 'Quote not found'
                });
            }

            res.json({
                success: true,
                message: 'Quote updated successfully',
                data: updatedQuote
            });

        } catch (error) {
            console.error('❌ Update quote error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update quote',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Delete quote
    async deleteQuote(req, res) {
        try {
            const { id } = req.params;

            const [deletedQuote] = await db.delete(quotes)
                .where(eq(quotes.id, parseInt(id)))
                .returning();

            if (!deletedQuote) {
                return res.status(404).json({
                    success: false,
                    message: 'Quote not found'
                });
            }

            res.json({
                success: true,
                message: 'Quote deleted successfully',
                data: deletedQuote
            });

        } catch (error) {
            console.error('❌ Delete quote error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete quote',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get statistics
    async getStatistics(req, res) {
        try {
            // Get count by status
            const statusStats = await db.select({
                status: quotes.status,
                count: count()
            })
                .from(quotes)
                .groupBy(quotes.status);

            // Get count by project type
            const projectStats = await db.select({
                projectType: quotes.projectType,
                count: count()
            })
                .from(quotes)
                .groupBy(quotes.projectType)
                .orderBy(desc(count()));

            // Get total count
            const [{ total }] = await db.select({ total: count() }).from(quotes);

            // Get today's quotes
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const [{ todayCount }] = await db.select({ todayCount: count() })
                .from(quotes)
                .where(between(quotes.createdAt, today, tomorrow));

            // Get this month's quotes
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const [{ monthCount }] = await db.select({ monthCount: count() })
                .from(quotes)
                .where(between(quotes.createdAt, startOfMonth, tomorrow));

            res.json({
                success: true,
                data: {
                    total: Number(total),
                    today: Number(todayCount),
                    thisMonth: Number(monthCount),
                    byStatus: statusStats.map(s => ({
                        status: s.status,
                        count: Number(s.count)
                    })),
                    byProjectType: projectStats.map(p => ({
                        projectType: p.projectType,
                        count: Number(p.count)
                    }))
                }
            });

        } catch (error) {
            console.error('❌ Get statistics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Search quotes
    async searchQuotes(req, res) {
        try {
            const { q, field = 'all' } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters'
                });
            }

            const searchTerm = `%${q.trim()}%`;
            let conditions;

            switch (field) {
                case 'email':
                    conditions = like(quotes.email, searchTerm);
                    break;
                case 'phone':
                    conditions = like(quotes.phone, searchTerm);
                    break;
                case 'name':
                    conditions = like(quotes.name, searchTerm);
                    break;
                case 'company':
                    conditions = like(quotes.company, searchTerm);
                    break;
                case 'reference':
                    conditions = like(quotes.quoteReference, searchTerm);
                    break;
                default: // 'all'
                    conditions = or(
                        like(quotes.name, searchTerm),
                        like(quotes.email, searchTerm),
                        like(quotes.company, searchTerm),
                        like(quotes.phone, searchTerm),
                        like(quotes.quoteReference, searchTerm)
                    );
            }

            const results = await db.select()
                .from(quotes)
                .where(conditions)
                .orderBy(desc(quotes.createdAt))
                .limit(50);

            res.json({
                success: true,
                data: results,
                count: results.length
            });

        } catch (error) {
            console.error('❌ Search quotes error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search quotes',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};