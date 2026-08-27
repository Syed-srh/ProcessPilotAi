import { prisma } from '../config/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { AgentOrchestrator } from '../agents/agentOrchestrator';
import { ApprovalStatus, ExecutionStatus } from '@prisma/client';

export class ApprovalService {
  /**
   * List all approval requests
   */
  public static async listApprovals(status?: ApprovalStatus) {
    const where = status ? { status } : {};
    return prisma.approval.findMany({
      where,
      include: {
        workflow: {
          select: { id: true, name: true },
        },
        execution: {
          select: { id: true, status: true, inputs: true, outputs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single approval detail
   */
  public static async getApprovalById(id: string) {
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: {
        workflow: true,
        execution: true,
      },
    });

    if (!approval) {
      throw new NotFoundError('Approval request not found');
    }

    return approval;
  }

  /**
   * Approve a pending request and resume paused workflow execution
   */
  public static async approveRequest(id: string, approvedBy: string, reason?: string) {
    const approval = await this.getApprovalById(id);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestError(`Approval is already in status '${approval.status}'`);
    }

    // Update approval status
    const updatedApproval = await prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.APPROVED,
        approvedBy,
        reason: reason || 'Approved by operator',
        resolvedAt: new Date(),
      },
    });

    // Resume workflow execution
    const execution = await prisma.execution.findUnique({
      where: { id: approval.executionId },
    });

    if (execution && (execution.workflowSnapshot as any)) {
      const snapshot = execution.workflowSnapshot as any;
      const resumedResult = await AgentOrchestrator.execute(
        snapshot.nodes || [],
        snapshot.edges || [],
        (execution.outputs as any) || (execution.inputs as any) || {},
        {
          executionId: execution.id,
          workflowId: approval.workflowId,
        }
      );

      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.COMPLETED,
          completedAt: new Date(),
          outputs: resumedResult.variables,
        },
      });
    }

    return updatedApproval;
  }

  /**
   * Reject a pending request and cancel workflow execution
   */
  public static async rejectRequest(id: string, approvedBy: string, reason?: string) {
    const approval = await this.getApprovalById(id);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestError(`Approval is already in status '${approval.status}'`);
    }

    const updatedApproval = await prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.REJECTED,
        approvedBy,
        reason: reason || 'Rejected by operator',
        resolvedAt: new Date(),
      },
    });

    await prisma.execution.update({
      where: { id: approval.executionId },
      data: {
        status: ExecutionStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    return updatedApproval;
  }

  /**
   * Edit variables and approve request
   */
  public static async editAndApproveRequest(
    id: string,
    approvedBy: string,
    editedVariables: Record<string, any>,
    reason?: string
  ) {
    const approval = await this.getApprovalById(id);

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestError(`Approval is already in status '${approval.status}'`);
    }

    const updatedApproval = await prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.APPROVED,
        approvedBy,
        reason: reason || 'Approved with edited parameters',
        metadata: {
          ...(approval.metadata as any),
          editedVariables,
        },
        resolvedAt: new Date(),
      },
    });

    // Resume execution with edited variables
    const execution = await prisma.execution.findUnique({
      where: { id: approval.executionId },
    });

    if (execution && (execution.workflowSnapshot as any)) {
      const snapshot = execution.workflowSnapshot as any;
      const mergedVariables = {
        ...((execution.outputs as any) || {}),
        ...editedVariables,
      };

      const resumedResult = await AgentOrchestrator.execute(
        snapshot.nodes || [],
        snapshot.edges || [],
        mergedVariables,
        {
          executionId: execution.id,
          workflowId: approval.workflowId,
        }
      );

      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.COMPLETED,
          completedAt: new Date(),
          outputs: resumedResult.variables,
        },
      });
    }

    return updatedApproval;
  }
}
