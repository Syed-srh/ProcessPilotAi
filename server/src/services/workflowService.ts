import { prisma } from '../config/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { WorkflowEngine } from '../workflow/workflowEngine';
import { WorkflowStatus } from '@prisma/client';

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  sourceSopText?: string;
  nodes?: any[];
  edges?: any[];
  variables?: Record<string, any>;
  tags?: string[];
  ownerId: string;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
  nodes?: any[];
  edges?: any[];
  variables?: Record<string, any>;
  approvalRules?: Record<string, any>;
  tags?: string[];
}

export class WorkflowService {
  /**
   * List all workflows for an owner
   */
  public static async listWorkflows(ownerId: string) {
    return prisma.workflow.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get single workflow by ID
   */
  public static async getWorkflowById(id: string, ownerId?: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 5,
        },
      },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }

    if (ownerId && workflow.ownerId !== ownerId) {
      throw new ForbiddenError('You do not have access to this workflow');
    }

    return workflow;
  }

  /**
   * Create a new workflow
   */
  public static async createWorkflow(input: CreateWorkflowInput) {
    const defaultNodes = input.nodes && input.nodes.length > 0 ? input.nodes : [
      {
        id: 'trigger-1',
        type: 'MANUAL_TRIGGER',
        position: { x: 250, y: 100 },
        data: { label: 'Manual Trigger', config: {} },
      },
    ];

    const workflow = await prisma.workflow.create({
      data: {
        name: input.name,
        description: input.description,
        sourceSopText: input.sourceSopText,
        ownerId: input.ownerId,
        status: WorkflowStatus.DRAFT,
        version: 1,
        nodes: defaultNodes,
        edges: input.edges || [],
        variables: input.variables || {},
        tags: input.tags || [],
      },
    });

    // Save initial version snapshot
    await prisma.workflowVersion.create({
      data: {
        workflowId: workflow.id,
        version: 1,
        snapshot: {
          nodes: workflow.nodes,
          edges: workflow.edges,
          variables: workflow.variables,
        },
        createdBy: input.ownerId,
      },
    });

    return workflow;
  }

  /**
   * Update workflow and create version snapshot
   */
  public static async updateWorkflow(id: string, ownerId: string, input: UpdateWorkflowInput) {
    const existing = await this.getWorkflowById(id, ownerId);

    const newVersion = existing.version + 1;
    const updatedNodes = input.nodes !== undefined ? input.nodes : (existing.nodes as any[]);
    const updatedEdges = input.edges !== undefined ? input.edges : (existing.edges as any[]);
    const updatedVariables = input.variables !== undefined ? input.variables : (existing.variables as any);

    const updated = await prisma.workflow.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        status: input.status ?? existing.status,
        version: newVersion,
        nodes: updatedNodes,
        edges: updatedEdges,
        variables: updatedVariables,
        approvalRules: input.approvalRules ?? (existing.approvalRules as any),
        tags: input.tags ?? existing.tags,
      },
    });

    // Create immutable WorkflowVersion snapshot
    await prisma.workflowVersion.create({
      data: {
        workflowId: id,
        version: newVersion,
        snapshot: {
          nodes: updatedNodes,
          edges: updatedEdges,
          variables: updatedVariables,
        },
        createdBy: ownerId,
      },
    });

    return updated;
  }

  /**
   * Delete workflow
   */
  public static async deleteWorkflow(id: string, ownerId: string) {
    await this.getWorkflowById(id, ownerId);
    await prisma.workflow.delete({ where: { id } });
    return { success: true, message: 'Workflow deleted successfully' };
  }

  /**
   * Duplicate existing workflow
   */
  public static async duplicateWorkflow(id: string, ownerId: string) {
    const original = await this.getWorkflowById(id, ownerId);

    return this.createWorkflow({
      name: `${original.name} (Copy)`,
      description: original.description || undefined,
      sourceSopText: original.sourceSopText || undefined,
      nodes: original.nodes as any[],
      edges: original.edges as any[],
      variables: original.variables as any,
      tags: original.tags,
      ownerId,
    });
  }

  /**
   * Execute workflow via Multi-Agent Orchestrator
   */
  public static async executeWorkflow(id: string, ownerId: string, inputs: Record<string, any> = {}) {
    const workflow = await this.getWorkflowById(id, ownerId);
    const { AgentOrchestrator } = await import('../agents/agentOrchestrator');

    // 1. Create Execution record in DB first so FK constraints are valid for agent logs
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        workflowVersion: workflow.version,
        workflowSnapshot: {
          nodes: workflow.nodes,
          edges: workflow.edges,
        },
        status: 'RUNNING',
        inputs,
        triggerType: 'MANUAL',
      },
    });

    // 2. Execute via AgentOrchestrator with real executionId
    const result = await AgentOrchestrator.execute(
      workflow.nodes as any[],
      workflow.edges as any[],
      inputs,
      {
        executionId: execution.id,
        workflowId: workflow.id,
      }
    );

    // 3. Update execution record with final status and outputs
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: result.status === 'COMPLETED' ? 'COMPLETED' : result.status === 'AWAITING_APPROVAL' ? 'AWAITING_APPROVAL' : 'FAILED',
        currentNode: result.currentNodeId,
        aiCallCount: result.aiCallCount,
        outputs: result.variables,
        error: result.error ? { message: result.error } : undefined,
        completedAt: result.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    return {
      executionId: execution.id,
      status: result.status,
      aiCallCount: result.aiCallCount,
      logs: result.logs,
      outputs: result.variables,
      error: result.error,
      approvalId: result.approvalId,
    };
  }

  /**
   * Get version history
   */
  public static async getVersions(id: string, ownerId: string) {
    await this.getWorkflowById(id, ownerId);
    return prisma.workflowVersion.findMany({
      where: { workflowId: id },
      orderBy: { version: 'desc' },
    });
  }
}
