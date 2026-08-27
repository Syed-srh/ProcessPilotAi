import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApprovalService } from '../services/approvalService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ApprovalStatus } from '@prisma/client';

const approveRejectSchema = z.object({
  reason: z.string().optional(),
});

const editApproveSchema = z.object({
  reason: z.string().optional(),
  editedVariables: z.record(z.any()),
});

export class ApprovalController {
  public static async listApprovals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const statusParam = req.query.status as ApprovalStatus | undefined;
      const approvals = await ApprovalService.listApprovals(statusParam);
      res.status(200).json({
        success: true,
        data: { approvals },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getApproval(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const approval = await ApprovalService.getApprovalById(req.params.id);
      res.status(200).json({
        success: true,
        data: { approval },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async approve(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = approveRejectSchema.parse(req.body || {});
      const approval = await ApprovalService.approveRequest(req.params.id, req.user!.userId, reason);
      res.status(200).json({
        success: true,
        data: { approval },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async reject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = approveRejectSchema.parse(req.body || {});
      const approval = await ApprovalService.rejectRequest(req.params.id, req.user!.userId, reason);
      res.status(200).json({
        success: true,
        data: { approval },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async editAndApprove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason, editedVariables } = editApproveSchema.parse(req.body);
      const approval = await ApprovalService.editAndApproveRequest(
        req.params.id,
        req.user!.userId,
        editedVariables,
        reason
      );
      res.status(200).json({
        success: true,
        data: { approval },
      });
    } catch (error) {
      next(error);
    }
  }
}
