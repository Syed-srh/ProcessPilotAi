import { Router } from 'express';
import { WorkflowController } from '../controllers/workflowController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get('/', WorkflowController.listWorkflows);
router.post('/', requireRole(Role.ADMIN, Role.OPERATOR), WorkflowController.createWorkflow);
router.post('/generate', requireRole(Role.ADMIN, Role.OPERATOR), WorkflowController.generateWorkflow);

router.get('/:id', WorkflowController.getWorkflow);
router.put('/:id', requireRole(Role.ADMIN, Role.OPERATOR), WorkflowController.updateWorkflow);
router.delete('/:id', requireRole(Role.ADMIN, Role.OPERATOR), WorkflowController.deleteWorkflow);

router.post('/:id/duplicate', requireRole(Role.ADMIN, Role.OPERATOR), WorkflowController.duplicateWorkflow);
router.post('/:id/execute', requireRole(Role.ADMIN, Role.OPERATOR), WorkflowController.executeWorkflow);
router.post('/:id/simulate', WorkflowController.simulateWorkflow);
router.get('/:id/versions', WorkflowController.getVersions);

export default router;
