import { describe, it, expect } from 'vitest';
import { RulesEngine } from '../../src/workflow/rulesEngine';

describe('Rules Engine Unit Tests', () => {
  describe('Field Value Resolution (Dot Notation)', () => {
    it('should correctly resolve nested object properties', () => {
      const state = {
        customer: {
          profile: {
            email: 'jane@example.com',
            score: 850,
          },
        },
        refund: {
          amount: 7500,
        },
      };

      expect(RulesEngine.resolveFieldValue(state, 'customer.profile.email')).toBe('jane@example.com');
      expect(RulesEngine.resolveFieldValue(state, 'customer.profile.score')).toBe(850);
      expect(RulesEngine.resolveFieldValue(state, 'refund.amount')).toBe(7500);
      expect(RulesEngine.resolveFieldValue(state, 'nonexistent.path')).toBeUndefined();
    });
  });

  describe('Comparison Operators', () => {
    it('should evaluate equals and not_equals correctly', () => {
      expect(RulesEngine.compare('ORD-100', 'equals', 'ORD-100')).toBe(true);
      expect(RulesEngine.compare('ORD-100', 'equals', 'ORD-200')).toBe(false);
      expect(RulesEngine.compare(5000, 'equals', '5000')).toBe(true);
      expect(RulesEngine.compare('ACTIVE', 'not_equals', 'PAUSED')).toBe(true);
    });

    it('should evaluate numeric comparisons (greater_than, gte, less_than, lte)', () => {
      expect(RulesEngine.compare(7500, 'greater_than', 5000)).toBe(true);
      expect(RulesEngine.compare(5000, 'greater_than', 5000)).toBe(false);
      expect(RulesEngine.compare(5000, 'gte', 5000)).toBe(true);
      expect(RulesEngine.compare(3000, 'less_than', 5000)).toBe(true);
      expect(RulesEngine.compare(5000, 'lte', 5000)).toBe(true);
    });

    it('should evaluate contains and in operators', () => {
      expect(RulesEngine.compare('Customer Refund Request', 'contains', 'Refund')).toBe(true);
      expect(RulesEngine.compare(['VIP', 'REGULAR'], 'contains', 'VIP')).toBe(true);
      expect(RulesEngine.compare('VIP', 'in', ['VIP', 'PREMIUM'])).toBe(true);
      expect(RulesEngine.compare('GUEST', 'in', 'VIP, PREMIUM, REGULAR')).toBe(false);
    });
  });

  describe('Condition Group Evaluation (AND / OR)', () => {
    const state = {
      order: { amount: 7500, status: 'DELIVERED' },
      user: { role: 'VIP' },
    };

    it('should return true for AND logic when all rules match', () => {
      const group = {
        logic: 'AND' as const,
        rules: [
          { field: 'order.amount', operator: 'gte' as const, value: 5000 },
          { field: 'order.status', operator: 'equals' as const, value: 'DELIVERED' },
        ],
      };

      const result = RulesEngine.evaluateGroup(group, state);
      expect(result.passed).toBe(true);
    });

    it('should return false for AND logic when any rule fails', () => {
      const group = {
        logic: 'AND' as const,
        rules: [
          { field: 'order.amount', operator: 'gte' as const, value: 5000 },
          { field: 'user.role', operator: 'equals' as const, value: 'GUEST' },
        ],
      };

      const result = RulesEngine.evaluateGroup(group, state);
      expect(result.passed).toBe(false);
    });

    it('should return true for OR logic when at least one rule matches', () => {
      const group = {
        logic: 'OR' as const,
        rules: [
          { field: 'order.amount', operator: 'less_than' as const, value: 1000 },
          { field: 'user.role', operator: 'equals' as const, value: 'VIP' },
        ],
      };

      const result = RulesEngine.evaluateGroup(group, state);
      expect(result.passed).toBe(true);
    });
  });
});
