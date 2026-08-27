import { describe, it, expect, vi } from 'vitest';
import { PlannerAgent } from '../../src/agents/plannerAgent';
import { DecisionAgent } from '../../src/agents/decisionAgent';
import { ExecutionAgent } from '../../src/agents/executionAgent';
import { ValidationAgent } from '../../src/agents/validationAgent';
import { RecoveryAgent } from '../../src/agents/recoveryAgent';
import { MonitoringAgent } from '../../src/agents/monitoringAgent';

describe('Unit Tests for Individual Agents (Planner, Decision, Execution, Validation, Recovery, Monitoring)', () => {
  describe('PlannerAgent', () => {
    it('should generate a valid topological execution plan and confidence score', () => {
      const nodes = [
        { id: 'n1', type: 'MANUAL_TRIGGER', data: { label: 'Start' } },
        { id: 'n2', type: 'CONDITION', data: { label: 'Check' } },
        { id: 'n3', type: 'SEND_EMAIL', data: { label: 'Email' } },
      ];
      const edges = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ];

      const plan = PlannerAgent.plan(nodes as any, edges as any);
      expect(plan.orderedNodeIds.length).toBe(3);
      expect(plan.orderedNodeIds[0]).toBe('n1');
      expect(plan.confidenceScore).toBeGreaterThanOrEqual(0.9);
      expect(plan.hasCycles).toBe(false);
    });
  });

  describe('DecisionAgent', () => {
    it('should evaluate decision and track AI call count increment', async () => {
      const result = await DecisionAgent.evaluateDecision(
        'Check eligibility for refund',
        { amount: 3500 },
        'APPROVED'
      );

      expect(result.decision).toBeDefined();
      expect(result.confidenceScore).toBeGreaterThan(0.8);
      expect(result.aiCallCountIncrement).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ExecutionAgent', () => {
    it('should delegate node execution to NodeExecutors cleanly', async () => {
      const result = await ExecutionAgent.executeNode(
        'node-http-1',
        'HTTP_REQUEST',
        { method: 'POST', url: 'https://api.stripe.com/v1/refunds', isMocked: true },
        { orderId: 'ORD-1029' }
      );

      expect(result.success).toBe(true);
      expect(result.outputs?.httpStatus).toBe(200);
    });
  });

  describe('ValidationAgent', () => {
    it('should pass validation when amount is under threshold', () => {
      const result = ValidationAgent.validateStep(
        'CONDITION',
        { approvalThreshold: 5000 },
        { amount: 3500 },
        0.95
      );

      expect(result.valid).toBe(true);
      expect(result.requiresApproval).toBe(false);
    });

    it('should trigger approval requirement with THRESHOLD reason when amount exceeds limit', () => {
      const result = ValidationAgent.validateStep(
        'CONDITION',
        { approvalThreshold: 5000 },
        { amount: 7500 },
        0.95
      );

      expect(result.requiresApproval).toBe(true);
      expect(result.triggerReason).toBe('THRESHOLD');
    });

    it('should trigger approval requirement with LOW_CONFIDENCE reason when confidence score is low', () => {
      const result = ValidationAgent.validateStep(
        'AI_DECISION',
        { approvalThreshold: 10000 },
        { amount: 1000 },
        0.65, // Low confidence < 0.85
        0.85
      );

      expect(result.requiresApproval).toBe(true);
      expect(result.triggerReason).toBe('LOW_CONFIDENCE');
    });
  });

  describe('RecoveryAgent', () => {
    it('should classify RATE_LIMIT failure and calculate exponential backoff', () => {
      const plan = RecoveryAgent.handleFailure('HTTP 429 Rate limit exceeded', 1);

      expect(plan.category).toBe('RATE_LIMIT');
      expect(plan.decision).toBe('RETRY_WITH_BACKOFF');
      expect(plan.backoffMs).toBe(2000); // 1000 * 2^1
    });

    it('should classify AI_BUDGET_EXCEEDED failure and mandate human escalation', () => {
      const plan = RecoveryAgent.handleFailure('AI_BUDGET_EXCEEDED');

      expect(plan.category).toBe('AI_BUDGET_EXCEEDED');
      expect(plan.decision).toBe('REQUEST_HUMAN');
      expect(plan.reasoning).toContain('budget breached');
    });
  });

  describe('MonitoringAgent', () => {
    it('should construct structured log events', async () => {
      const log = await MonitoringAgent.logEvent({
        executionId: 'exec-test-1',
        workflowId: 'wf-test-1',
        agent: 'MONITORING',
        message: 'Workflow execution initiated',
      });

      expect(log).toBeDefined();
      expect(log.message).toBe('Workflow execution initiated');
    });
  });
});
