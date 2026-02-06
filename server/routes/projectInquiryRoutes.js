import express from 'express';
import {
    createProjectInquiry,
    getProjectInquiries,
    getProjectInquiryById,
    updateProjectInquiryStatus,
    deleteProjectInquiry,
    getProjectInquiryStats,
} from '../controllers/projectInquiryController.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/', createProjectInquiry);

// Protected routes (add authentication middleware as needed)
router.get('/', getProjectInquiries);
router.get('/stats', getProjectInquiryStats);
router.get('/:id', getProjectInquiryById);
router.patch('/:id/status', updateProjectInquiryStatus);
router.delete('/:id', deleteProjectInquiry);

export default router;