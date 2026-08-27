import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', NotificationController.list);
router.post('/:id/read', NotificationController.markRead);
router.post('/read-all', NotificationController.markAllRead);

export default router;
