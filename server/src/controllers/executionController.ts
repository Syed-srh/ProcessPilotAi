import { Response, NextFunction } from 'express';
import { ExecutionService } from '../services/executionService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class ExecutionController {
  public static async listExecutions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const executions = await ExecutionService.listExecutions(req.user!.userId);
      res.status(200).json({
        success: true,
        data: { executions },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getExecution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const execution = await ExecutionService.getExecutionById(req.params.id);
      res.status(200).json({
        success: true,
        data: { execution },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const timeline = await ExecutionService.getTimeline(req.params.id);
      res.status(200).json({
        success: true,
        data: { timeline },
      });
    } catch (error) {
      next(error);
    }
  }
}
