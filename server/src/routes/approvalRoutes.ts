import { Router } from 'express';
import { ApprovalController } from '../controllers/approvalController';
import { authenticateToken, requireApprovalPermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', ApprovalController.listApprovals);
router.get('/:id', ApprovalController.getApproval);

router.post('/:id/approve', requireApprovalPermission, ApprovalController.approve);
router.post('/:id/reject', requireApprovalPermission, ApprovalController.reject);
router.post('/:id/edit-approve', requireApprovalPermission, ApprovalController.editAndApprove);

export default router;
