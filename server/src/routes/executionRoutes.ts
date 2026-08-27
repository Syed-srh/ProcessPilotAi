import { Router } from 'express';
import { ExecutionController } from '../controllers/executionController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', ExecutionController.listExecutions);
router.get('/:id', ExecutionController.getExecution);
router.get('/:id/timeline', ExecutionController.getTimeline);

export default router;
