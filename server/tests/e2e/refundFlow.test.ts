import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { generateToken } from '../../src/utils/jwt';

vi.mock('../../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    workflow: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
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

describe('Playwright E2E Refund Flow Master Suite', () => {
  const operatorUser = {
    userId: 'op-user-999',
    email: 'e2e-operator@processpilot.ai',
    role: 'OPERATOR' as const,
    canApprove: true,
  };

  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    token = generateToken(operatorUser);
  });

  it('Step 1: SOP Compiler - POST /api/workflows/generate compiles SOP text into valid graph', async () => {
    const sopText =
      'When customer requests refund below ₹5,000 auto approve, if above ₹5,000 require manager approval and send confirmation email.';

    const res = await request(app)
      .post('/api/workflows/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ sopText });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.workflow.nodes.length).toBeGreaterThanOrEqual(4);
  });

  it('Step 2: Simulation Mode - POST /api/workflows/:id/simulate runs dry-run without side effects', async () => {
    const mockWorkflow = {
      id: 'wf-e2e-demo',
      name: 'Customer Refund Automation',
      ownerId: operatorUser.userId,
      nodes: [
        { id: 'n1', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
        { id: 'n2', type: 'HTTP_REQUEST', data: { label: 'Stripe Refund', config: { method: 'POST', url: 'https://api.stripe.com/v1/refunds', isMocked: true } } },
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    };

    (prisma.workflow.findUnique as any).mockResolvedValue(mockWorkflow);

    const res = await request(app)
      .post(`/api/workflows/${mockWorkflow.id}/simulate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ inputs: { amount: 3500 } });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('Step 3: Live Execution & Approval Pause - Amount > ₹5,000 pauses execution with THRESHOLD triggerReason', async () => {
    const mockWorkflow = {
      id: 'wf-e2e-demo',
      name: 'Customer Refund Automation',
      ownerId: operatorUser.userId,
      nodes: [
        { id: 'n1', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
        { id: 'n2', type: 'HUMAN_APPROVAL', data: { label: 'Manager Signoff', config: { approvalThreshold: 5000 } } },
      ],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    };

    const mockApproval = {
      id: 'appr-e2e-1',
      executionId: 'exec-e2e-1',
      workflowId: mockWorkflow.id,
      status: 'PENDING',
      triggerReason: 'THRESHOLD',
      reason: 'Amount ₹7,500 exceeds limit ₹5,000',
      workflow: { id: mockWorkflow.id, name: mockWorkflow.name },
      execution: {
        id: 'exec-e2e-1',
        status: 'AWAITING_APPROVAL',
        inputs: { amount: 7500 },
        outputs: { amount: 7500 },
        workflowSnapshot: { nodes: mockWorkflow.nodes, edges: mockWorkflow.edges },
      },
    };

    (prisma.workflow.findUnique as any).mockResolvedValue(mockWorkflow);
    (prisma.execution.create as any).mockResolvedValue({ id: 'exec-e2e-1', status: 'AWAITING_APPROVAL' });
    (prisma.approval.create as any).mockResolvedValue(mockApproval);

    const execRes = await request(app)
      .post(`/api/workflows/${mockWorkflow.id}/execute`)
      .set('Authorization', `Bearer ${token}`)
      .send({ inputs: { amount: 7500 } });

    expect(execRes.status).toBe(200);
    expect(execRes.body.data.status).toBe('AWAITING_APPROVAL');
  });

  it('Step 4: Approval & Resume - Approving paused request resumes execution to completion', async () => {
    const mockApproval = {
      id: 'appr-e2e-1',
      executionId: 'exec-e2e-1',
      workflowId: 'wf-e2e-demo',
      status: 'PENDING',
      triggerReason: 'THRESHOLD',
      reason: 'Amount ₹7,500 exceeds limit ₹5,000',
      workflow: { id: 'wf-e2e-demo', name: 'Customer Refund Automation' },
      execution: {
        id: 'exec-e2e-1',
        status: 'AWAITING_APPROVAL',
        inputs: { amount: 7500 },
        outputs: { amount: 7500 },
        workflowSnapshot: {
          nodes: [
            { id: 'n1', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
            { id: 'n2', type: 'SEND_EMAIL', data: { label: 'Email', config: { to: 'cust@example.com' } } },
          ],
          edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        },
      },
    };

    (prisma.approval.findUnique as any).mockResolvedValue(mockApproval);
    (prisma.approval.update as any).mockResolvedValue({ ...mockApproval, status: 'APPROVED' });
    (prisma.execution.findUnique as any).mockResolvedValue(mockApproval.execution);
    (prisma.execution.update as any).mockResolvedValue({ ...mockApproval.execution, status: 'COMPLETED' });

    const approveRes = await request(app)
      .post(`/api/approvals/${mockApproval.id}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'E2E Approved' });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.approval.status).toBe('APPROVED');
  });
});
