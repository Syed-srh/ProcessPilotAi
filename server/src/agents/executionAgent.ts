import { NodeExecutors, NodeExecutionResult } from '../workflow/nodeExecutors';

export class ExecutionAgent {
  /**
   * Run action nodes through NodeExecutors
   */
  public static async executeNode(
    nodeId: string,
    nodeType: string,
    config: Record<string, any>,
    variables: Record<string, any>
  ): Promise<NodeExecutionResult> {
    const ctx = { nodeId, nodeType, config, variables };

    switch (nodeType) {
      case 'MANUAL_TRIGGER':
        return NodeExecutors.executeManualTrigger(ctx);
      case 'CONDITION':
        return NodeExecutors.executeCondition(ctx);
      case 'HTTP_REQUEST':
        return NodeExecutors.executeHttpRequest(ctx);
      case 'DATABASE_QUERY':
        return NodeExecutors.executeDatabaseQuery(ctx);
      case 'SEND_EMAIL':
        return NodeExecutors.executeSendEmail(ctx);
      case 'SCHEMA_VALIDATION':
        return NodeExecutors.executeSchemaValidation(ctx);
      case 'AI_DECISION':
        return NodeExecutors.executeAiDecision(ctx);
      case 'HUMAN_APPROVAL':
        return NodeExecutors.executeHumanApproval(ctx);
      default:
        return {
          success: true,
          logMessage: `ExecutionAgent executed node type '${nodeType}'`,
        };
    }
  }
}
