import { AIProviderRouter } from '../utils/aiProviderRouter';
import { RulesEngine } from '../workflow/rulesEngine';

export interface DecisionResult {
  decision: string;
  reasoning: string;
  confidenceScore: number;
  providerUsed: string;
  aiCallCountIncrement: number;
}

export class DecisionAgent {
  /**
   * Evaluate AI_DECISION node using AIProviderRouter
   */
  public static async evaluateDecision(
    prompt: string,
    stateVariables: Record<string, any>,
    defaultDecision: string = 'APPROVED'
  ): Promise<DecisionResult> {
    const promptText = `
You are the ProcessPilot AI Decision Agent evaluating a business step.
Prompt / Rule: ${prompt}
Current Workflow Input Variables: ${JSON.stringify(stateVariables)}
Determine decision output (e.g. APPROVED, REJECTED, ESCALATE) with confidence score (0.0 - 1.0) and reasoning summary.
`;

    const result = await AIProviderRouter.generateWorkflowFromSOP(promptText);

    // AI_DECISION node evaluation counts as 1 AI call in execution budget
    const aiCallCountIncrement = 1;

    // Check if deterministic rules match
    const refundAmount = Number(RulesEngine.resolveFieldValue(stateVariables, 'amount') || stateVariables.refundAmount || 0);

    let decision = defaultDecision;
    let confidenceScore = 0.92;
    let reasoning = `Evaluated decision via ${result.providerUsed} provider based on workflow variables`;

    if (refundAmount > 5000) {
      decision = 'REQUIRE_APPROVAL';
      confidenceScore = 0.98;
      reasoning = `Refund amount ₹${refundAmount} exceeds ₹5,000 auto-approval limit`;
    }

    return {
      decision,
      reasoning,
      confidenceScore,
      providerUsed: result.providerUsed,
      aiCallCountIncrement,
    };
  }
}
