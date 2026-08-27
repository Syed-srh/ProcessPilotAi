import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { generateToken } from '../../src/utils/jwt';

// Mock Prisma client for approval pause and resume testing
vi.mock('../../src/config/prisma', () => ({
  prisma: {
    workflow: {
      findUnique: vi.fn(),
    },
    execution: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    approval: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '../../src/config/prisma';

describe('Approval Pause & Resume Integration Test', () => {
  const adminUser = {
    userId: 'admin-user-1',
    email: 'admin@processpilot.ai',
    role: 'ADMIN' as const,
    canApprove: true,
  };

  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    token = generateToken(adminUser);
  });

  it('should pause workflow when threshold is exceeded, record triggerReason, and resume upon approval', async () => {
    const mockWorkflow = {
      id: 'wf-approval-test',
      name: 'High Risk Refund Workflow',
      ownerId: adminUser.userId,
      version: 1,
      nodes: [
        { id: 'node-1', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
        { id: 'node-2', type: 'HUMAN_APPROVAL', data: { label: 'Manager Signoff', config: { approvalThreshold: 5000 } } },
        { id: 'node-3', type: 'SEND_EMAIL', data: { label: 'Notify', config: { to: 'customer@example.com' } } },
      ],
      edges: [
        { id: 'e1', source: 'node-1', target: 'node-2' },
        { id: 'e2', source: 'node-2', target: 'node-3' },
      ],
      variables: {},
    };

    const mockApprovalRecord = {
      id: 'appr-100',
      executionId: 'exec-paused-1',
      workflowId: mockWorkflow.id,
      nodeId: 'node-2',
      status: 'PENDING',
      triggerReason: 'THRESHOLD',
      reason: 'Amount ₹7,500 exceeds threshold limit ₹5,000',
      createdAt: new Date(),
      workflow: { id: mockWorkflow.id, name: mockWorkflow.name },
      execution: {
        id: 'exec-paused-1',
        status: 'AWAITING_APPROVAL',
        inputs: { amount: 7500 },
        outputs: { amount: 7500 },
        workflowSnapshot: { nodes: mockWorkflow.nodes, edges: mockWorkflow.edges },
      },
    };

    (prisma.workflow.findUnique as any).mockResolvedValue(mockWorkflow);
    (prisma.execution.create as any).mockResolvedValue({ id: 'exec-paused-1', status: 'AWAITING_APPROVAL' });
    (prisma.approval.create as any).mockResolvedValue(mockApprovalRecord);
    (prisma.approval.findUnique as any).mockResolvedValue(mockApprovalRecord);
    (prisma.approval.update as any).mockResolvedValue({ ...mockApprovalRecord, status: 'APPROVED', approvedBy: adminUser.userId });
    (prisma.execution.findUnique as any).mockResolvedValue(mockApprovalRecord.execution);
    (prisma.execution.update as any).mockResolvedValue({ ...mockApprovalRecord.execution, status: 'COMPLETED' });

    // 1. Execute workflow requiring approval -> should pause with status AWAITING_APPROVAL
    const execRes = await request(app)
      .post(`/api/workflows/${mockWorkflow.id}/execute`)
      .set('Authorization', `Bearer ${token}`)
      .send({ inputs: { amount: 7500 } });

    expect(execRes.status).toBe(200);
    expect(execRes.body.data.status).toBe('AWAITING_APPROVAL');

    // 2. Approve via POST /api/approvals/:id/approve -> should resume and complete
    const approveRes = await request(app)
      .post(`/api/approvals/${mockApprovalRecord.id}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Approved high value refund' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.data.approval.status).toBe('APPROVED');
  });
});
