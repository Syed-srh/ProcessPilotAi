import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { WorkflowService } from '../services/workflowService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { WorkflowStatus } from '@prisma/client';

const createWorkflowSchema = z.object({
  name: z.string().min(2, 'Workflow name must be at least 2 characters'),
  description: z.string().optional(),
  sourceSopText: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  variables: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

const updateWorkflowSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(WorkflowStatus).optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  variables: z.record(z.any()).optional(),
  approvalRules: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

export class WorkflowController {
  public static async listWorkflows(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const workflows = await WorkflowService.listWorkflows(req.user!.userId);
      res.status(200).json({
        success: true,
        data: { workflows },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const workflow = await WorkflowService.getWorkflowById(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        data: { workflow },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createWorkflowSchema.parse(req.body);
      const workflow = await WorkflowService.createWorkflow({
        ...validated,
        ownerId: req.user!.userId,
      });
      res.status(201).json({
        success: true,
        data: { workflow },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateWorkflowSchema.parse(req.body);
      const workflow = await WorkflowService.updateWorkflow(req.params.id, req.user!.userId, validated);
      res.status(200).json({
        success: true,
        data: { workflow },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WorkflowService.deleteWorkflow(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async duplicateWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const workflow = await WorkflowService.duplicateWorkflow(req.params.id, req.user!.userId);
      res.status(201).json({
        success: true,
        data: { workflow },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async executeWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const inputs = req.body.inputs || {};
      const result = await WorkflowService.executeWorkflow(req.params.id, req.user!.userId, inputs);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getVersions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const versions = await WorkflowService.getVersions(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        data: { versions },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async generateWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sopText } = req.body;
      const { SOPCompiler } = await import('../workflow/sopCompiler');
      const result = await SOPCompiler.compile(sopText);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async simulateWorkflow(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const inputs = req.body.inputs || {};
      const { SimulationService } = await import('../services/simulationService');
      const result = await SimulationService.simulateWorkflow(req.params.id, req.user!.userId, inputs);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
