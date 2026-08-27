/**
 * Deterministic Rules Engine for ProcessPilot AI
 * Evaluates conditions and business rules without relying on LLM call.
 */

export type ComparisonOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'gte'
  | 'lte'
  | 'contains'
  | 'in';

export interface ConditionRule {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

export interface ConditionGroup {
  logic: 'AND' | 'OR';
  rules: ConditionRule[];
}

export class RulesEngine {
  /**
   * Resolve nested field value from a state object using dot notation (e.g. 'refund.amount')
   */
  public static resolveFieldValue(state: Record<string, any>, path: string): any {
    if (!path || !state) return undefined;
    const parts = path.split('.');
    let current: any = state;

    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  /**
   * Compare two values using the specified operator
   */
  public static compare(actual: any, operator: ComparisonOperator, expected: any): boolean {
    if (actual === undefined || actual === null) {
      if (operator === 'not_equals') return expected !== null && expected !== undefined;
      return false;
    }

    switch (operator) {
      case 'equals':
        return String(actual) === String(expected);
      case 'not_equals':
        return String(actual) !== String(expected);
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'gte':
        return Number(actual) >= Number(expected);
      case 'lte':
        return Number(actual) <= Number(expected);
      case 'contains':
        if (typeof actual === 'string') return actual.includes(String(expected));
        if (Array.isArray(actual)) return actual.includes(expected);
        return false;
      case 'in':
        if (Array.isArray(expected)) return expected.includes(actual);
        if (typeof expected === 'string') return expected.split(',').map((s) => s.trim()).includes(String(actual));
        return false;
      default:
        return false;
    }
  }

  /**
   * Evaluate a ConditionGroup against workflow variables state
   */
  public static evaluateGroup(group: ConditionGroup, state: Record<string, any>): { passed: boolean; details: string[] } {
    if (!group || !group.rules || group.rules.length === 0) {
      return { passed: true, details: ['No rules declared, defaulted to passed'] };
    }

    const details: string[] = [];
    const results: boolean[] = [];

    for (const rule of group.rules) {
      const actualValue = this.resolveFieldValue(state, rule.field);
      const isMatch = this.compare(actualValue, rule.operator, rule.value);
      results.push(isMatch);
      details.push(
        `Field '${rule.field}' (actual: ${JSON.stringify(actualValue)}) ${rule.operator} ${JSON.stringify(
          rule.value
        )} => ${isMatch}`
      );
    }

    const passed =
      group.logic === 'OR'
        ? results.some((r) => r === true)
        : results.every((r) => r === true);

    return { passed, details };
  }
}
