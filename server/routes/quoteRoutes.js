import express from 'express';
import { quoteController } from '../controllers/quoteController.js';

const router = express.Router();

// Public routes (no authentication needed)
router.post('/submit', quoteController.createQuote);

// Admin routes (add authentication middleware if needed)
// Example: router.use(authMiddleware); // Uncomment to protect all routes below

// CRUD operations
router.get('/', quoteController.getAllQuotes);
router.get('/stats', quoteController.getStatistics);
router.get('/search', quoteController.searchQuotes);
router.get('/:id', quoteController.getQuoteById);
router.patch('/:id/status', quoteController.updateQuoteStatus);
router.put('/:id', quoteController.updateQuote);
router.delete('/:id', quoteController.deleteQuote);

// Test endpoint (for debugging)
router.post('/', (req, res) => {
    console.log('Test endpoint called with body:', req.body);
    res.json({
        success: true,
        message: 'Test successful',
        body: req.body,
        timestamp: new Date().toISOString()
    });
});

export default router;