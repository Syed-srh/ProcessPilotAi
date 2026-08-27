import { NodeExecutors, NodeExecutionResult } from './nodeExecutors';

export interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label?: string;
    config?: Record<string, any>;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface ExecutionState {
  workflowId: string;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING';
  currentNodeId: string | null;
  variables: Record<string, any>;
  stepLogs: Array<{
    nodeId: string;
    nodeType: string;
    message: string;
    outputs?: Record<string, any>;
    timestamp: string;
  }>;
  error?: string;
}

export class WorkflowEngine {
  /**
   * Execute workflow graph sequentially
   */
  public static async execute(
    workflowId: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    initialInputs: Record<string, any> = {}
  ): Promise<ExecutionState> {
    const state: ExecutionState = {
      workflowId,
      status: 'RUNNING',
      currentNodeId: null,
      variables: { ...initialInputs },
      stepLogs: [],
    };

    // Find entry trigger node (MANUAL_TRIGGER or first node)
    let currentNode = nodes.find((n) => n.type === 'MANUAL_TRIGGER') || nodes[0];

    if (!currentNode) {
      state.status = 'FAILED';
      state.error = 'Workflow has no nodes to execute';
      return state;
    }

    const visitedNodes = new Set<string>();
    const maxSteps = 50; // Safety threshold for cycles
    let stepCount = 0;

    while (currentNode && stepCount < maxSteps) {
      stepCount++;
      state.currentNodeId = currentNode.id;
      visitedNodes.add(currentNode.id);

      const config = currentNode.data?.config || {};
      const nodeType = currentNode.type;

      let result: NodeExecutionResult;

      switch (nodeType) {
        case 'MANUAL_TRIGGER':
          result = await NodeExecutors.executeManualTrigger({ nodeId: currentNode.id, nodeType, config, variables: state.variables });
          break;
        case 'CONDITION':
          result = await NodeExecutors.executeCondition({ nodeId: currentNode.id, nodeType, config, variables: state.variables });
          break;
        case 'HTTP_REQUEST':
          result = await NodeExecutors.executeHttpRequest({ nodeId: currentNode.id, nodeType, config, variables: state.variables });
          break;
        case 'DATABASE_QUERY':
          result = await NodeExecutors.executeDatabaseQuery({ nodeId: currentNode.id, nodeType, config, variables: state.variables });
          break;
        case 'SEND_EMAIL':
          result = await NodeExecutors.executeSendEmail({ nodeId: currentNode.id, nodeType, config, variables: state.variables });
          break;
        case 'SCHEMA_VALIDATION':
          result = await NodeExecutors.executeSchemaValidation({ nodeId: currentNode.id, nodeType, config, variables: state.variables });
          break;
        case 'AI_DECISION':
          result = await NodeExecutors.executeAiDecision({ nodeId: currentNode.id, nodeType, config, variables: state.variables });
          break;
        case 'HUMAN_APPROVAL':
          result = await NodeExecutors.executeHumanApproval({ nodeId: currentNode.id, nodeType, config, variables: state.variables });
          break;
        default:
          result = {
            success: true,
            logMessage: `Executed unhandled node type '${nodeType}'`,
          };
      }

      // Record log entry
      state.stepLogs.push({
        nodeId: currentNode.id,
        nodeType,
        message: result.logMessage,
        outputs: result.outputs,
        timestamp: new Date().toISOString(),
      });

      // Merge node outputs into execution variables
      if (result.outputs) {
        state.variables = {
          ...state.variables,
          ...result.outputs,
        };
      }

      if (!result.success) {
        state.status = 'FAILED';
        state.error = result.error || `Node '${currentNode.id}' failed execution`;
        return state;
      }

      // Determine next node based on edges and condition handles
      const outgoingEdges = edges.filter((e) => e.source === currentNode?.id);

      if (outgoingEdges.length === 0) {
        // Reached end of graph branch
        break;
      }

      let nextEdge: WorkflowEdge | undefined;

      if (nodeType === 'CONDITION' && result.nextBranch) {
        // Match handle 'true' or 'false'
        nextEdge = outgoingEdges.find((e) => e.sourceHandle === result.nextBranch) || outgoingEdges[0];
      } else {
        nextEdge = outgoingEdges[0];
      }

      if (!nextEdge) break;

      const nextNode = nodes.find((n) => n.id === nextEdge!.target);
      if (!nextNode || visitedNodes.has(nextNode.id)) {
        // Cycle detected or missing target
        break;
      }

      currentNode = nextNode;
    }

    state.status = 'COMPLETED';
    return state;
  }
}
