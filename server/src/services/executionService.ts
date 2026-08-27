import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';

export class ExecutionService {
  /**
   * List all execution records
   */
  public static async listExecutions(ownerId?: string) {
    return prisma.execution.findMany({
      include: {
        workflow: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Get single execution details with workflow snapshot and approvals
   */
  public static async getExecutionById(id: string) {
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        workflow: true,
        executionLogs: {
          orderBy: { timestamp: 'asc' },
        },
        approvals: true,
      },
    });

    if (!execution) {
      throw new NotFoundError('Execution record not found');
    }

    return execution;
  }

  /**
   * Get execution timeline logs
   */
  public static async getTimeline(id: string) {
    await this.getExecutionById(id);
    return prisma.executionLog.findMany({
      where: { executionId: id },
      orderBy: { timestamp: 'asc' },
    });
  }
}
