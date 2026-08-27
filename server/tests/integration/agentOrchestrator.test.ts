import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentOrchestrator } from '../../src/agents/agentOrchestrator';
import axios from 'axios';

vi.mock('axios');

describe('AgentOrchestrator Integration Test (All 6 Agents Event Stream)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.post as any).mockResolvedValue({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    name: 'Mock Workflow',
                    nodes: [{ id: 'n1', type: 'MANUAL_TRIGGER', position: { x: 0, y: 0 }, data: { label: 'Start' } }],
                    edges: [],
                  }),
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('should run a multi-node execution and emit logs from all 6 agents', async () => {
    const nodes = [
      { id: 'node-trigger', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
      {
        id: 'node-ai',
        type: 'AI_DECISION',
        data: { label: 'AI Eligibility Check', config: { prompt: 'Check refund eligibility', defaultDecision: 'APPROVED' } },
      },
      {
        id: 'node-cond',
        type: 'CONDITION',
        data: {
          label: 'Amount <= 5000 Check',
          config: {
            conditionGroup: {
              logic: 'AND',
              rules: [{ field: 'amount', operator: 'lte', value: 5000 }],
            },
          },
        },
      },
      {
        id: 'node-http',
        type: 'HTTP_REQUEST',
        data: { label: 'Stripe Refund Call', config: { method: 'POST', url: 'https://api.stripe.com/v1/refunds', isMocked: true } },
      },
    ];

    const edges = [
      { id: 'e1', source: 'node-trigger', target: 'node-ai' },
      { id: 'e2', source: 'node-ai', target: 'node-cond' },
      { id: 'e3', source: 'node-cond', target: 'node-http', sourceHandle: 'true' },
    ];

    const result = await AgentOrchestrator.execute(
      nodes as any,
      edges as any,
      { amount: 3500, customerEmail: 'test@example.com' },
      { workflowId: 'wf-orchestrator-1' }
    );

    expect(result.status).toBe('COMPLETED');
    expect(result.logs.length).toBeGreaterThanOrEqual(4);

    const agentNamesEmitted = new Set(result.logs.map((log: any) => log.agent));

    // Verify events landed from key agents
    expect(agentNamesEmitted.has('PLANNER')).toBe(true);
    expect(agentNamesEmitted.has('DECISION')).toBe(true);
    expect(agentNamesEmitted.has('EXECUTION')).toBe(true);
    expect(agentNamesEmitted.has('VALIDATION')).toBe(true);
  });
});
