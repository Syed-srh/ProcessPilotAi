import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentOrchestrator } from '../../src/agents/agentOrchestrator';
import axios from 'axios';

vi.mock('axios');

describe('AI-Call Budget Enforcement & Breach Escalation', () => {
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

  it('should track aiCallCount and force-escalate with AI_BUDGET_EXCEEDED when cap is breached', async () => {
    // 3 consecutive AI decision nodes
    const nodes = [
      { id: 'node-trigger', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
      { id: 'node-ai-1', type: 'AI_DECISION', data: { label: 'AI Check 1', config: { prompt: 'Prompt 1' } } },
      { id: 'node-ai-2', type: 'AI_DECISION', data: { label: 'AI Check 2', config: { prompt: 'Prompt 2' } } },
      { id: 'node-ai-3', type: 'AI_DECISION', data: { label: 'AI Check 3', config: { prompt: 'Prompt 3' } } },
    ];

    const edges = [
      { id: 'e1', source: 'node-trigger', target: 'node-ai-1' },
      { id: 'e2', source: 'node-ai-1', target: 'node-ai-2' },
      { id: 'e3', source: 'node-ai-2', target: 'node-ai-3' },
    ];

    // Set maxAiCalls = 2
    const result = await AgentOrchestrator.execute(
      nodes as any,
      edges as any,
      { amount: 1000 },
      {
        workflowId: 'wf-budget-test',
        maxAiCalls: 2,
      }
    );

    // Verify execution halts immediately on 3rd AI call breach
    expect(result.status).toBe('FAILED');
    expect(result.aiCallCount).toBe(2);
    expect(result.error).toContain('AI_BUDGET_EXCEEDED');

    const recoveryLog = result.logs.find((log: any) => log.agent === 'RECOVERY' && log.level === 'ERROR');
    expect(recoveryLog).toBeDefined();
    expect(recoveryLog.message).toContain('AI_BUDGET_EXCEEDED');
  });
});
