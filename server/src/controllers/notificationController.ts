import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class NotificationController {
  public static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationService.listNotifications(req.user!.userId);
      res.status(200).json({
        success: true,
        data: { notifications },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAsRead(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.userId);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}
