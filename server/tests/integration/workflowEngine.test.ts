import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { generateToken } from '../../src/utils/jwt';
import { Role } from '@prisma/client';

// Mock Prisma client for workflow engine integration testing
vi.mock('../../src/config/prisma', () => ({
  prisma: {
    workflow: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    workflowVersion: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    execution: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '../../src/config/prisma';

describe('Workflow Engine & CRUD Integration Tests', () => {
  const testUser = {
    userId: 'operator-123',
    email: 'operator@processpilot.ai',
    role: 'OPERATOR' as const,
    canApprove: false,
  };

  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    token = generateToken(testUser);
  });

  it('should create a new workflow via POST /api/workflows', async () => {
    const mockWorkflow = {
      id: 'wf-999',
      name: 'Customer Refund Workflow',
      description: 'Automated refund checking process',
      ownerId: testUser.userId,
      status: 'DRAFT',
      version: 1,
      nodes: [
        { id: 'trigger-1', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
      ],
      edges: [],
      variables: {},
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.workflow.create as any).mockResolvedValue(mockWorkflow);
    (prisma.workflowVersion.create as any).mockResolvedValue({});

    const res = await request(app)
      .post('/api/workflows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Customer Refund Workflow',
        description: 'Automated refund checking process',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.workflow.id).toBe(mockWorkflow.id);
    expect(res.body.data.workflow.name).toBe('Customer Refund Workflow');
  });

  it('should execute a workflow containing Condition, HTTP Request, and Database Query nodes', async () => {
    const mockWorkflowGraph = {
      id: 'wf-execution-100',
      name: 'Refund Exec Workflow',
      ownerId: testUser.userId,
      status: 'ACTIVE',
      version: 1,
      nodes: [
        {
          id: 'node-1',
          type: 'MANUAL_TRIGGER',
          data: { label: 'Start Run', config: {} },
        },
        {
          id: 'node-2',
          type: 'CONDITION',
          data: {
            label: 'Amount >= 5000 Check',
            config: {
              conditionGroup: {
                logic: 'AND',
                rules: [{ field: 'refundAmount', operator: 'gte', value: 5000 }],
              },
            },
          },
        },
        {
          id: 'node-3',
          type: 'HTTP_REQUEST',
          data: {
            label: 'Trigger Payment Webhook',
            config: {
              method: 'POST',
              url: 'https://api.stripe.com/v1/refunds',
              isMocked: true,
              mockResponse: { status: 200, data: { status: 'REFUNDED', id: 're_123' } },
            },
          },
        },
        {
          id: 'node-4',
          type: 'DATABASE_QUERY',
          data: {
            label: 'Verify Order Record',
            config: {
              model: 'order',
              action: 'findUnique',
              isMocked: true,
              mockResult: { id: 'ORD-1029', status: 'COMPLETED' },
            },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'node-1', target: 'node-2' },
        { id: 'e2', source: 'node-2', target: 'node-3', sourceHandle: 'true' },
        { id: 'e3', source: 'node-3', target: 'node-4' },
      ],
      variables: {},
    };

    (prisma.workflow.findUnique as any).mockResolvedValue(mockWorkflowGraph);
    (prisma.execution.create as any).mockResolvedValue({ id: 'exec-res-1' });

    const res = await request(app)
      .post(`/api/workflows/${mockWorkflowGraph.id}/execute`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        inputs: {
          refundAmount: 7500,
          orderId: 'ORD-1029',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.outputs.conditionPassed).toBe(true);
    expect(res.body.data.outputs.httpData).toEqual({ status: 'REFUNDED', id: 're_123' });
    expect(res.body.data.outputs.dbResult).toEqual({ id: 'ORD-1029', status: 'COMPLETED' });
    expect(res.body.data.logs.length).toBeGreaterThanOrEqual(4);
  });
});
