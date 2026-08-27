export type FailureCategory =
  | 'MISSING_DATA'
  | 'INVALID_INPUT'
  | 'AUTH_EXPIRED'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'API_FAILURE'
  | 'BUSINESS_RULE_FAILURE'
  | 'AI_BUDGET_EXCEEDED'
  | 'UNKNOWN';

export type RecoveryDecision =
  | 'RETRY'
  | 'RETRY_WITH_BACKOFF'
  | 'SKIP'
  | 'REQUEST_HUMAN'
  | 'TERMINATE';

export interface RecoveryPlan {
  category: FailureCategory;
  decision: RecoveryDecision;
  backoffMs: number;
  reasoning: string;
}

export class RecoveryAgent {
  /**
   * Classify failure and determine recovery decision
   */
  public static handleFailure(error: string | Error, retryCount: number = 0): RecoveryPlan {
    const errorMsg = typeof error === 'string' ? error : error.message;
    const lowerMsg = errorMsg.toLowerCase();

    let category: FailureCategory = 'UNKNOWN';
    let decision: RecoveryDecision = 'TERMINATE';
    let backoffMs = 0;

    if (lowerMsg.includes('ai_budget_exceeded') || lowerMsg.includes('budget')) {
      category = 'AI_BUDGET_EXCEEDED';
      decision = 'REQUEST_HUMAN';
      return {
        category,
        decision,
        backoffMs: 0,
        reasoning: 'AI-call budget breached. Force-escalated to human review to prevent infinite loops.',
      };
    }

    if (lowerMsg.includes('missing') || lowerMsg.includes('required field')) {
      category = 'MISSING_DATA';
      decision = 'TERMINATE';
    } else if (lowerMsg.includes('429') || lowerMsg.includes('rate limit')) {
      category = 'RATE_LIMIT';
      decision = 'RETRY_WITH_BACKOFF';
      backoffMs = Math.min(1000 * Math.pow(2, retryCount), 8000); // 1s, 2s, 4s, 8s
    } else if (lowerMsg.includes('timeout') || lowerMsg.includes('etimedout')) {
      category = 'TIMEOUT';
      decision = retryCount < 3 ? 'RETRY_WITH_BACKOFF' : 'REQUEST_HUMAN';
      backoffMs = Math.min(1000 * Math.pow(2, retryCount), 8000);
    } else if (lowerMsg.includes('auth') || lowerMsg.includes('unauthorized') || lowerMsg.includes('401')) {
      category = 'AUTH_EXPIRED';
      decision = 'REQUEST_HUMAN';
    } else if (lowerMsg.includes('500') || lowerMsg.includes('api failure')) {
      category = 'API_FAILURE';
      decision = retryCount < 3 ? 'RETRY' : 'TERMINATE';
    }

    const reasoning = `Classified error as '${category}'. Recovery decision: '${decision}' with ${backoffMs}ms backoff (attempt ${retryCount + 1})`;

    return {
      category,
      decision,
      backoffMs,
      reasoning,
    };
  }

  /**
   * Execute in-process exponential backoff sleep
   */
  public static async executeBackoff(ms: number): Promise<void> {
    if (ms <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
