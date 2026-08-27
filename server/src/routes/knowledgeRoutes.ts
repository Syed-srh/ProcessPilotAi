import { Router } from 'express';
import { getCurrentDocument, uploadDocument } from '../controllers/knowledgeController';
import { authenticateToken, requireApprovalPermission } from '../middleware/authMiddleware';

const router = Router();

// Public / Authenticated route to view current policy document
router.get('/documents/current', authenticateToken, getCurrentDocument);

// Admin / Operator route to upload/replace policy document
router.post('/documents', authenticateToken, requireApprovalPermission, uploadDocument);

export default router;
