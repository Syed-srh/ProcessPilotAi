import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';
import { broadcastNotification } from '../config/socket';

export interface CreateNotificationInput {
  ownerId: string;
  workflowId?: string;
  executionId?: string;
  type: string;
  title: string;
  message: string;
}

export class NotificationService {
  /**
   * List notifications for a user
   */
  public static async listNotifications(ownerId: string) {
    return prisma.notification.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Create notification and broadcast real-time socket event
   */
  public static async createNotification(input: CreateNotificationInput) {
    try {
      const notification = await prisma.notification.create({
        data: {
          ownerId: input.ownerId,
          workflowId: input.workflowId,
          executionId: input.executionId,
          type: input.type,
          title: input.title,
          message: input.message,
        },
      });

      broadcastNotification(notification);
      return notification;
    } catch (err) {
      return { id: `notif-${Date.now()}`, ...input, isRead: false, createdAt: new Date() };
    }
  }

  /**
   * Mark notification as read
   */
  public static async markAsRead(id: string, ownerId: string) {
    return prisma.notification.updateMany({
      where: { id, ownerId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all user notifications as read
   */
  public static async markAllAsRead(ownerId: string) {
    return prisma.notification.updateMany({
      where: { ownerId, isRead: false },
      data: { isRead: true },
    });
  }
}
