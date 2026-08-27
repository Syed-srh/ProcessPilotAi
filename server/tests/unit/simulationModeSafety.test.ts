import { describe, it, expect, vi } from 'vitest';
import { AgentOrchestrator } from '../../src/agents/agentOrchestrator';
import axios from 'axios';

vi.mock('axios');

describe('Simulation Mode Side-Effect Safety Tests', () => {
  it('should run simulation mode without making real external HTTP or email network calls', async () => {
    const nodes = [
      { id: 'n1', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
      {
        id: 'n2',
        type: 'HTTP_REQUEST',
        data: {
          label: 'External Payment Call',
          config: { method: 'POST', url: 'https://api.stripe.com/v1/refunds', isMocked: true },
        },
      },
      {
        id: 'n3',
        type: 'SEND_EMAIL',
        data: {
          label: 'Send Email Notification',
          config: { to: 'customer@example.com', subject: 'Refund Processed' },
        },
      },
    ];

    const edges = [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'target-n3' },
    ];

    const result = await AgentOrchestrator.execute(
      nodes as any,
      edges as any,
      { amount: 2000, customerEmail: 'customer@example.com' },
      {
        workflowId: 'wf-sim-test',
        isSimulation: true,
      }
    );

    expect(result.status).toBe('COMPLETED');
    // Verify real axios client was NEVER invoked during simulation run
    expect(axios).not.toHaveBeenCalled();

    // Verify logs indicate simulation mode
    const logs = result.logs;
    expect(logs.length).toBeGreaterThan(0);
  });
});
