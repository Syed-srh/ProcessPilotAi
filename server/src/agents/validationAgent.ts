import { RulesEngine } from '../workflow/rulesEngine';

export interface ValidationCheckResult {
  valid: boolean;
  requiresApproval: boolean;
  triggerReason?: 'THRESHOLD' | 'LOW_CONFIDENCE';
  reasoning: string;
}

export class ValidationAgent {
  /**
   * Validate step execution outputs and evaluate the Approval Gate trigger rule
   */
  public static validateStep(
    nodeType: string,
    nodeConfig: Record<string, any>,
    variables: Record<string, any>,
    confidenceScore: number = 0.95,
    minConfidenceThreshold: number = 0.85
  ): ValidationCheckResult {
    // 1. Evaluate Approval Trigger Rule
    // Formula: (declared threshold exceeded) OR (confidence < minConfidenceThreshold)
    const approvalThreshold = nodeConfig.approvalThreshold || nodeConfig.threshold;
    const currentAmount = Number(
      RulesEngine.resolveFieldValue(variables, 'amount') || variables.refundAmount || 0
    );

    const isThresholdExceeded =
      approvalThreshold !== undefined && currentAmount > Number(approvalThreshold);
    const isLowConfidence = confidenceScore < minConfidenceThreshold;

    if (isThresholdExceeded || nodeType === 'HUMAN_APPROVAL') {
      return {
        valid: true,
        requiresApproval: true,
        triggerReason: 'THRESHOLD',
        reasoning: `Amount ₹${currentAmount} exceeds threshold limit ₹${approvalThreshold || 5000}`,
      };
    }

    if (isLowConfidence) {
      return {
        valid: true,
        requiresApproval: true,
        triggerReason: 'LOW_CONFIDENCE',
        reasoning: `Decision confidence score (${confidenceScore}) is below minimum threshold (${minConfidenceThreshold})`,
      };
    }

    return {
      valid: true,
      requiresApproval: false,
      reasoning: `Validation passed cleanly for ${nodeType} node`,
    };
  }
}
