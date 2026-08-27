import { PlannerAgent } from './plannerAgent';
import { DecisionAgent } from './decisionAgent';
import { ExecutionAgent } from './executionAgent';
import { ValidationAgent } from './validationAgent';
import { RecoveryAgent } from './recoveryAgent';
import { MonitoringAgent } from './monitoringAgent';
import { WorkflowNode, WorkflowEdge } from '../workflow/workflowEngine';
import { prisma } from '../config/prisma';

export interface OrchestratorOptions {
  executionId?: string;
  workflowId: string;
  maxAiCalls?: number;
  isSimulation?: boolean;
}

export interface OrchestratorResult {
  executionId: string;
  status: 'COMPLETED' | 'FAILED' | 'AWAITING_APPROVAL';
  currentNodeId: string | null;
  aiCallCount: number;
  variables: Record<string, any>;
  logs: any[];
  error?: string;
  approvalId?: string;
}

export class AgentOrchestrator {
  public static readonly DEFAULT_MAX_AI_CALLS = 10;

  /**
   * Run multi-agent orchestrated workflow execution
   */
  public static async execute(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    initialInputs: Record<string, any> = {},
    options: OrchestratorOptions
  ): Promise<OrchestratorResult> {
    const { workflowId, maxAiCalls = this.DEFAULT_MAX_AI_CALLS, isSimulation = false } = options;
    const executionId = options.executionId || `exec-${Date.now()}`;

    let aiCallCount = 0;
    let variables = { ...initialInputs };
    const logs: any[] = [];

    // 1. PLANNER AGENT: Generate plan
    const plan = PlannerAgent.plan(nodes, edges);
    const planLog = await MonitoringAgent.logEvent({
      executionId,
      workflowId,
      agent: 'PLANNER',
      message: `PlannerAgent created execution plan (${plan.orderedNodeIds.length} steps)`,
      reasoningTrace: plan.reasoning,
      confidenceScore: plan.confidenceScore,
    });
    logs.push(planLog);

    if (plan.orderedNodeIds.length === 0) {
      return {
        executionId,
        status: 'FAILED',
        currentNodeId: null,
        aiCallCount,
        variables,
        logs,
        error: 'Planner found no executable nodes',
      };
    }

    let currentNode = nodes.find((n) => n.id === plan.orderedNodeIds[0]) || nodes[0];
    const visitedNodes = new Set<string>();
    let lastNodeId: string | null = null;

    while (currentNode) {
      lastNodeId = currentNode.id;
      visitedNodes.add(currentNode.id);
      const nodeType = currentNode.type;
      const config = currentNode.data?.config || {};

      // 2. DECISION AGENT or EXECUTION AGENT
      if (nodeType === 'AI_DECISION') {
        // Enforce AI Call Budget Server-Side BEFORE executing LLM call
        if (aiCallCount >= maxAiCalls) {
          const recoveryPlan = RecoveryAgent.handleFailure('AI_BUDGET_EXCEEDED');
          const budgetLog = await MonitoringAgent.logEvent({
            executionId,
            workflowId,
            nodeId: currentNode.id,
            agent: 'RECOVERY',
            level: 'ERROR',
            message: `AI_BUDGET_EXCEEDED: Execution exceeded maximum allowed AI calls (${maxAiCalls})`,
            reasoningTrace: recoveryPlan.reasoning,
          });
          logs.push(budgetLog);

          return {
            executionId,
            status: 'FAILED',
            currentNodeId: currentNode.id,
            aiCallCount,
            variables,
            logs,
            error: `AI_BUDGET_EXCEEDED: Per-execution AI-call budget limit (${maxAiCalls}) breached. Run escalated.`,
          };
        }

        const prompt = config.prompt || 'Evaluate business eligibility';
        const decisionResult = await DecisionAgent.evaluateDecision(prompt, variables, config.defaultDecision);
        aiCallCount += decisionResult.aiCallCountIncrement;

        variables.aiDecision = decisionResult.decision;
        variables.confidenceScore = decisionResult.confidenceScore;

        const decisionLog = await MonitoringAgent.logEvent({
          executionId,
          workflowId,
          nodeId: currentNode.id,
          agent: 'DECISION',
          message: `DecisionAgent evaluated: ${decisionResult.decision}`,
          reasoningTrace: decisionResult.reasoning,
          confidenceScore: decisionResult.confidenceScore,
          metadata: { provider: decisionResult.providerUsed },
        });
        logs.push(decisionLog);
      } else {
        // 3. EXECUTION AGENT: Action execution
        const execResult = await ExecutionAgent.executeNode(currentNode.id, nodeType, config, variables);

        if (execResult.outputs) {
          variables = { ...variables, ...execResult.outputs };
        }

        const execLog = await MonitoringAgent.logEvent({
          executionId,
          workflowId,
          nodeId: currentNode.id,
          agent: 'EXECUTION',
          level: execResult.success ? 'INFO' : 'ERROR',
          message: execResult.logMessage,
        });
        logs.push(execLog);

        if (!execResult.success) {
          const recoveryPlan = RecoveryAgent.handleFailure(execResult.error || 'Execution failed');
          const recLog = await MonitoringAgent.logEvent({
            executionId,
            workflowId,
            nodeId: currentNode.id,
            agent: 'RECOVERY',
            level: 'WARNING',
            message: `RecoveryAgent decision: ${recoveryPlan.decision}`,
            reasoningTrace: recoveryPlan.reasoning,
          });
          logs.push(recLog);

          return {
            executionId,
            status: 'FAILED',
            currentNodeId: currentNode.id,
            aiCallCount,
            variables,
            logs,
            error: execResult.error,
          };
        }
      }

      // 4. VALIDATION AGENT: Validate & Approval Gate
      const validationResult = ValidationAgent.validateStep(
        nodeType,
        config,
        variables,
        variables.confidenceScore || 0.95
      );

      const valLog = await MonitoringAgent.logEvent({
        executionId,
        workflowId,
        nodeId: currentNode.id,
        agent: 'VALIDATION',
        level: validationResult.requiresApproval ? 'WARNING' : 'SUCCESS',
        message: validationResult.reasoning,
      });
      logs.push(valLog);

      if (validationResult.requiresApproval && !isSimulation) {
        // Create Approval DB Record
        let approvalId = `appr-${Date.now()}`;
        try {
          if (prisma.approval && prisma.approval.create) {
            const approvalRec = await prisma.approval.create({
              data: {
                executionId,
                workflowId,
                nodeId: currentNode.id,
                status: 'PENDING',
                triggerReason: validationResult.triggerReason || 'THRESHOLD',
                reason: validationResult.reasoning,
                metadata: { variables },
              },
            });
            approvalId = approvalRec.id;
          }
        } catch (e) {
          // Fallback for test environment
        }

        return {
          executionId,
          status: 'AWAITING_APPROVAL',
          currentNodeId: currentNode.id,
          aiCallCount,
          variables,
          logs,
          approvalId,
        };
      }

      // Next node traversal
      const outgoingEdges = edges.filter((e) => e.source === currentNode?.id);
      if (outgoingEdges.length === 0) break;

      let nextEdge = outgoingEdges[0];
      if (nodeType === 'CONDITION') {
        const branch = variables.conditionPassed ? 'true' : 'false';
        nextEdge = outgoingEdges.find((e) => e.sourceHandle === branch) || outgoingEdges[0];
      }

      if (!nextEdge) break;

      const nextNode = nodes.find((n) => n.id === nextEdge.target);
      if (!nextNode || visitedNodes.has(nextNode.id)) break;

      currentNode = nextNode;
    }

    return {
      executionId,
      status: 'COMPLETED',
      currentNodeId: lastNodeId,
      aiCallCount,
      variables,
      logs,
    };
  }
}
